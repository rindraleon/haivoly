import axios from 'axios';
import Constants from 'expo-constants';
import { getToken } from '@/storage/authStorage';

// Résout le baseURL selon le mode : LAN, tunnel, ou EXPO_PUBLIC_API_URL (ngrok/prod)
function resolveBaseUrl(): string {
  // 1. Prioritaire : variable d'env (ngrok, prod, IP fixe)
  // ex: EXPO_PUBLIC_API_URL=https://a1b2c3.ngrok-free.app
  // ou  EXPO_PUBLIC_API_URL=http://192.168.2.170:3000
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.replace(/\/$/, '');
  }

  // 2. Détection Expo hostUri (LAN vs Tunnel)
  const hostUri =
    (Constants.expoConfig?.hostUri as string | undefined) ??
    ((Constants as any).manifest?.hostUri as string | undefined) ??
    ((Constants as any).manifest2?.extra?.expoGo?.debuggerHost as string | undefined) ??
    '';

  const isTunnel = hostUri.includes('exp.direct') || hostUri.includes('tunnel');

  if (isTunnel) {
    // En tunnel, le téléphone ne peut PAS joindre 192.168.x.x directement
    // → il faut exposer le backend via ngrok et mettre l'URL ngrok dans EXPO_PUBLIC_API_URL
    console.warn(
      '[API] Tunnel Expo détecté (hostUri=' + hostUri + '). ' +
        'Pour que le mobile joigne le backend, lance "ngrok http 3000" et mets EXPO_PUBLIC_API_URL=https://xxx.ngrok-free.app dans frontend/.env',
    );
    // Fallback temporaire : essaie quand même l'IP LAN si dispo dans le hostUri avant tunnel
    // mais ça ne marchera qu'en WiFi commun. On retourne l'IP LAN par défaut.
    const fallbackIp = '192.168.2.170';
    return `http://${fallbackIp}:3000`;
  }

  // 3. Mode LAN classique : extrait l'IP du hostUri (ex: 192.168.2.170:19000)
  const host = hostUri.split(':')[0]?.split('?')[0];
  if (host && /^\d+\.\d+\.\d+\.\d+$/.test(host)) {
    return `http://${host}:3000`;
  }

  // 4. Fallback final
  return 'http://192.168.2.170:3000';
}

const baseURL = resolveBaseUrl();
console.log('[API] baseURL =', baseURL, '| hostUri =', (Constants.expoConfig?.hostUri as string) || 'n/a');

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Log utile en dev
  if (__DEV__) {
    console.log('[API] →', config.method?.toUpperCase(), (config.baseURL || '') + (config.url || ''));
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (e) => {
    if (__DEV__) {
      console.log('[API] ✖', e.message, e.response?.status, e.response?.data);
    }
    return Promise.reject(e);
  },
);
