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

export async function getCurrentLocation(
  options: OptionsAcquisition = {},
): Promise<GPSPosition> {
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

  const timeoutMs = options.timeoutMs ?? env.gpsTimeout;

  logger.debug('location.service', 'GPS : acquisition en cours…', {
    seuilAcceptable: env.gpsAccuracyAcceptable,
    seuilMaximal: env.gpsAccuracyMaximale,
    timeoutMs,
  });

  return new Promise<GPSPosition>((resolve, reject) => {
    let subscription: Location.LocationSubscription | null = null;
    let meilleure: Location.LocationObject | null = null;
    let reglee = false;

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

      const { latitude, longitude, accuracy } = position.coords;
      logger.debug('location.service', 'GPS : position retenue', {
        latitude,
        longitude,
        accuracy,
      });

      resolve({
        latitude,
        longitude,
        accuracy: accuracy ?? undefined,
        timestamp: position.timestamp ? new Date(position.timestamp) : undefined,
      });
    };

    const echouer = (erreur: ErreurGPS) => {
      if (reglee) return;
      reglee = true;
      nettoyer();
      reject(erreur);
    };

    let timer: ReturnType<typeof setTimeout> | null = setTimeout(() => {
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

    void (async () => {
      try {
        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            distanceInterval: 1,
            timeInterval: 1000,
          },
          (position) => {
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
          },
        );
      } catch (error) {
        logger.warn('location.service', 'GPS : échec du suivi', error);
        echouer(
          new ErreurGPS(
            'ECHEC_ACQUISITION',
            "Impossible d'acquérir une position GPS. Réessayez, ou ajoutez le point manuellement sur la carte.",
          ),
        );
      }
    })();
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
