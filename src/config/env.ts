import Constants from 'expo-constants';

import { retirerBarreFinale } from '@/utils/url';

function resolveApiUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (fromEnv) {
    return retirerBarreFinale(fromEnv);
  }

  // Mode développement : on réutilise l'IP du bundler Expo.
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoGoConfig as { debuggerHost?: string } | undefined)?.debuggerHost;

  const host = hostUri?.split(':')[0];
  if (host) {
    return `http://${host}:3000`;
  }

  return 'http://localhost:3000';
}

export const env = {
  apiUrl: resolveApiUrl(),
  /** Délai maximal d'une requête HTTP (ms). */
  apiTimeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 15000),
  /** Intervalle de synchronisation automatique (ms). */
  syncInterval: Number(process.env.EXPO_PUBLIC_SYNC_INTERVAL ?? 20000),
  /** Nombre maximal de tentatives avant de classer une action en échec. */
  maxSyncRetries: Number(process.env.EXPO_PUBLIC_SYNC_MAX_RETRIES ?? 5),

  /**
   * Précision GPS acceptable, en mètres.
   *
   * Deux seuils distincts :
   *  - `gpsAccuracyAcceptable` : précision jugée suffisante pour valider un
   *    sommet immédiatement ;
   *  - `gpsAccuracyMaximale` : au-delà, la position est rejetée plutôt que
   *    présentée comme fiable.
   *
   * ⚠️ Ces valeurs ne garantissent RIEN : elles bornent ce que l'application
   * accepte d'afficher. La précision réelle dépend du récepteur, du ciel
   * visible et des obstacles. Le seuil est volontairement large (terrain
   * agricole malgache, ciel partiellement dégagé) et configurable.
   */
  gpsAccuracyAcceptable: Number(
    process.env.EXPO_PUBLIC_GPS_ACCURACY_ACCEPTABLE ?? 15,
  ),
  gpsAccuracyMaximale: Number(
    process.env.EXPO_PUBLIC_GPS_ACCURACY_MAX ?? 40,
  ),
  /** Durée maximale d'attente d'une position GPS (ms). */
  gpsTimeout: Number(process.env.EXPO_PUBLIC_GPS_TIMEOUT ?? 12000),
  appName: 'Haivoly',
  isDev: __DEV__,
} as const;
