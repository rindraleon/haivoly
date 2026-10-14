import * as Location from 'expo-location';

import { env } from '@/config/env';
import { logger } from '@/utils/logger';

export interface GPSPosition {
  latitude: number;
  longitude: number;
  /** Précision estimée en mètres, telle que rapportée par le récepteur. */
  accuracy?: number;
  /** Heure de la mesure. */
  timestamp?: Date;
}

export type CauseErreurGPS =
  | 'PERMISSION_REFUSEE'
  | 'PERMISSION_LIMITEE'
  | 'SERVICES_DESACTIVES'
  | 'AUCUN_SIGNAL'
  | 'PRECISION_INSUFFISANTE'
  | 'ECHEC_ACQUISITION';

export class ErreurGPS extends Error {
  readonly cause_: CauseErreurGPS;
  readonly precision?: number;

  constructor(cause: CauseErreurGPS, message: string, precision?: number) {
    super(message);
    this.name = 'ErreurGPS';
    this.cause_ = cause;
    this.precision = precision;
  }
}

export interface OptionsAcquisition {
  /** Durée maximale d'attente (ms). Défaut : `env.gpsTimeout`. */
  timeoutMs?: number;
}

/** Convertit un objet Expo Location en position applicative. */
function versPosition(position: Location.LocationObject): GPSPosition {
  const { latitude, longitude, accuracy } = position.coords;

  return {
    latitude,
    longitude,
    accuracy: accuracy ?? undefined,
    timestamp: position.timestamp ? new Date(position.timestamp) : undefined,
  };
}

/** Vérifie permissions et services de localisation, sinon lève une `ErreurGPS`. */
async function assurerAccesLocalisation(): Promise<void> {
  const { status } = await Location.requestForegroundPermissionsAsync();

  if (status === 'denied') {
    throw new ErreurGPS(
      'PERMISSION_REFUSEE',
      "L'accès à la position est refusé. Autorisez la localisation dans les réglages de l'appareil.",
    );
  }

  if (status !== 'granted') {
    throw new ErreurGPS(
      'PERMISSION_LIMITEE',
      "L'accès à la position n'est pas accordé pour cet usage. Autorisez la localisation pendant l'utilisation de l'application.",
    );
  }

  const servicesActifs = await Location.hasServicesEnabledAsync();
  if (!servicesActifs) {
    throw new ErreurGPS(
      'SERVICES_DESACTIVES',
      'La localisation est désactivée sur cet appareil. Activez le GPS puis réessayez.',
    );
  }
}

/**
 * Position courante fiable pour le relevé d'un sommet de parcelle.
 *
 * Combine trois sources pour ne jamais dépendre d'un seul fournisseur :
 *   1. la dernière position connue (réponse quasi immédiate) ;
 *   2. un fix ponctuel (`getCurrentPositionAsync`), qui fonctionne même à l'arrêt ;
 *   3. un suivi continu qui affine la précision quand le signal s'améliore.
 *
 * La première mesure sous le seuil acceptable est retenue ; à l'expiration du
 * délai, la meilleure mesure sous le seuil maximal est utilisée en repli.
 */
export async function getCurrentLocation(
  options: OptionsAcquisition = {},
): Promise<GPSPosition> {
  await assurerAccesLocalisation();

  const timeoutMs = options.timeoutMs ?? env.gpsTimeout;

  logger.debug('location.service', 'GPS : acquisition en cours…', {
    seuilAcceptable: env.gpsAccuracyAcceptable,
    seuilMaximal: env.gpsAccuracyMaximale,
    timeoutMs,
  });

  return new Promise<GPSPosition>((resolve, reject) => {
    let reglee = false;
    let meilleure: Location.LocationObject | null = null;
    let subscription: Location.LocationSubscription | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const nettoyer = () => {
      if (timer !== null) {
        clearTimeout(timer);
        timer = null;
      }
      if (subscription) {
        subscription.remove();
        subscription = null;
      }
    };

    const valider = (position: Location.LocationObject) => {
      if (reglee) return;
      reglee = true;
      nettoyer();

      logger.debug('location.service', 'GPS : position retenue', {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });

      resolve(versPosition(position));
    };

    const echouer = (erreur: ErreurGPS) => {
      if (reglee) return;
      reglee = true;
      nettoyer();
      reject(erreur);
    };

    const collecter = (position: Location.LocationObject) => {
      if (reglee) return;

      const precision = position.coords.accuracy;

      if (
        !meilleure ||
        (precision ?? Number.MAX_SAFE_INTEGER) <
          (meilleure.coords.accuracy ?? Number.MAX_SAFE_INTEGER)
      ) {
        meilleure = position;
      }

      if (precision !== null && precision <= env.gpsAccuracyAcceptable) {
        valider(position);
      }
    };

    timer = setTimeout(() => {
      const precision = meilleure?.coords.accuracy ?? null;

      // Repli : la meilleure position reçue reste exploitable si elle demeure
      // sous le seuil maximal — jamais présentée comme une position exacte.
      if (
        meilleure &&
        precision !== null &&
        precision <= env.gpsAccuracyMaximale
      ) {
        valider(meilleure);
        return;
      }

      if (meilleure) {
        echouer(
          new ErreurGPS(
            'PRECISION_INSUFFISANTE',
            `Signal GPS trop imprécis (${precision?.toFixed(0) ?? '?'} m). Patientez à ciel dégagé, ou ajoutez le point manuellement sur la carte.`,
            precision ?? undefined,
          ),
        );
        return;
      }

      echouer(
        new ErreurGPS(
          'AUCUN_SIGNAL',
          'Aucun signal GPS reçu. Vérifiez que vous êtes à ciel dégagé, ou ajoutez le point manuellement sur la carte.',
        ),
      );
    }, timeoutMs);

    // 1) Dernière position connue : réponse quasi immédiate si elle est récente.
    void Location.getLastKnownPositionAsync({
      maxAge: 30_000,
      requiredAccuracy: env.gpsAccuracyMaximale,
    })
      .then((position) => position && collecter(position))
      .catch(() => {});

    // 2) Fix ponctuel : force l'obtention d'une position, même à l'arrêt.
    void Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.BestForNavigation,
    })
      .then((position) => collecter(position))
      .catch(() => {});

    // 3) Suivi continu : affine la précision tant que le relevé n'est pas réglé.
    void Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 0,
        timeInterval: 1000,
      },
      collecter,
    )
      .then((souscription) => {
        if (reglee) {
          souscription.remove();
          return;
        }
        subscription = souscription;
      })
      .catch((error) => {
        logger.warn('location.service', 'GPS : échec du suivi', error);
        // Si les autres sources ont déjà fourni une position, on les laisse aboutir.
        if (!reglee && !meilleure) {
          echouer(
            new ErreurGPS(
              'ECHEC_ACQUISITION',
              "Impossible d'acquérir une position GPS. Réessayez, ou ajoutez le point manuellement sur la carte.",
            ),
          );
        }
      });
  });
}

/**
 * Position approximative, pour recadrer la carte sans attendre un fix précis.
 * Se contente de la dernière position connue, sinon d'un fix rapide.
 */
export async function getApproximateLocation(): Promise<GPSPosition> {
  await assurerAccesLocalisation();

  const derniere = await Location.getLastKnownPositionAsync().catch(() => null);
  if (derniere) return versPosition(derniere);

  return new Promise<GPSPosition>((resolve, reject) => {
    let reglee = false;

    const timer = setTimeout(() => {
      if (reglee) return;
      reglee = true;
      reject(
        new ErreurGPS(
          'AUCUN_SIGNAL',
          'Aucune position approximative disponible pour le moment.',
        ),
      );
    }, Math.min(env.gpsTimeout, 8000));

    Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })
      .then((position) => {
        if (reglee) return;
        reglee = true;
        clearTimeout(timer);
        resolve(versPosition(position));
      })
      .catch(() => {
        if (reglee) return;
        reglee = true;
        clearTimeout(timer);
        reject(
          new ErreurGPS(
            'ECHEC_ACQUISITION',
            'Impossible de déterminer une position approximative.',
          ),
        );
      });
  });
}

/** Libellé court de l'état de précision, pour l'affichage terrain. */
export function qualitePrecision(accuracy?: number): 'bonne' | 'moyenne' | 'faible' | 'inconnue' {
  if (accuracy === undefined || accuracy === null || !Number.isFinite(accuracy)) {
    return 'inconnue';
  }
  if (accuracy <= env.gpsAccuracyAcceptable) return 'bonne';
  if (accuracy <= env.gpsAccuracyMaximale) return 'moyenne';
  return 'faible';
}
