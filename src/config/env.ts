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
  appName: 'Haivoly',
  isDev: __DEV__,
} as const;
