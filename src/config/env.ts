import Constants from 'expo-constants';

import { retirerBarreFinale } from '@/utils/url';

/**
 * Backend public de production. Sert de dernier recours pour un APK compilé
 * sans `EXPO_PUBLIC_API_URL` : sans cela, l'application retombait sur
 * `http://localhost:3000`, injoignable depuis un téléphone.
 */
const API_PRODUCTION = 'https://haivoly-back.onrender.com';

function urlConfiguree(): string | null {
  const candidates = [
    process.env.EXPO_PUBLIC_API_URL,
    Constants.expoConfig?.extra?.apiUrl,
  ];

  for (const valeur of candidates) {
    if (typeof valeur === 'string' && valeur.trim()) {
      return retirerBarreFinale(valeur.trim());
    }
  }

  return null;
}

function resolveApiUrl(): string {
  const configuree = urlConfiguree();
  if (configuree) {
    return configuree;
  }

  // Un build de production n'a pas de bundler : jamais de `localhost`.
  if (!__DEV__) {
    return API_PRODUCTION;
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
  /**
   * Délai maximal d'une requête HTTP (ms).
   * Volontairement large : le backend Render (offre gratuite) s'endort et son
   * réveil peut dépasser 30 s, ce qui produisait « Impossible de joindre le
   * serveur » au premier appel après installation.
   */
  apiTimeout: Number(process.env.EXPO_PUBLIC_API_TIMEOUT ?? 60000),
  /** Intervalle de synchronisation automatique (ms). */
  syncInterval: Number(process.env.EXPO_PUBLIC_SYNC_INTERVAL ?? 20000),
  /** Nombre maximal de tentatives avant de classer une action en échec. */
  maxSyncRetries: Number(process.env.EXPO_PUBLIC_SYNC_MAX_RETRIES ?? 5),

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
