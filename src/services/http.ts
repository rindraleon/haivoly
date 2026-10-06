import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios';

import { env } from '@/config/env';
import type { FichierPhoto } from '@/types';
import { clearToken, getToken } from '@/storage/authStorage';

/**
 * Client HTTP unique de l'application.
 *
 * Responsabilités :
 *   • URL de base issue de la configuration (jamais codée en dur) ;
 *   • injection du jeton JWT ;
 *   • **déballage de l'enveloppe** `{ success, data, message }` : les services
 *     ne manipulent que la charge utile ;
 *   • normalisation des erreurs en `ApiError` (message lisible + statut) ;
 *   • déconnexion automatique sur 401.
 */

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(message: string, status = 0, code = 'UNKNOWN', details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  /** Vrai si l'erreur est liée au réseau (mode hors-ligne). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

let onUnauthorized: (() => void) | null = null;

/** Permet au provider d'auth de réagir à une expiration de session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

// `axios.create` est bien l'instance par défaut d'axios (`import axios from
// 'axios'`) : la règle signale un faux positif lié aux exports nommés d'axios.
// eslint-disable-next-line import/no-named-as-default-member
export const httpClient: AxiosInstance = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
);

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      await clearToken();
      onUnauthorized?.();
    }
    return Promise.reject(error);
  },
);

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const axiosError = error as AxiosError<{
    message?: string | string[];
    errorCode?: string;
    details?: unknown;
  }>;

  if (!axiosError.response) {
    return new ApiError(
      'Impossible de joindre le serveur. Vérifiez votre connexion.',
      0,
      'NETWORK_ERROR',
    );
  }

  const { status, data } = axiosError.response;
  const rawMessage = data?.message;
  const message = Array.isArray(rawMessage)
    ? 'Données invalides'
    : (rawMessage ?? 'Une erreur est survenue');

  return new ApiError(
    message,
    status,
    data?.errorCode ?? 'HTTP_ERROR',
    Array.isArray(rawMessage) ? rawMessage : data?.details,
  );
}

/** Requête typée : renvoie directement `data` (enveloppe déballée). */
export async function request<T>(config: AxiosRequestConfig): Promise<T> {
  try {
    const response = await httpClient.request<ApiEnvelope<T> | T>(config);
    const payload = response.data;

    if (
      payload !== null &&
      typeof payload === 'object' &&
      'success' in (payload as Record<string, unknown>) &&
      'data' in (payload as Record<string, unknown>)
    ) {
      return (payload as ApiEnvelope<T>).data;
    }

    return payload as T;
  } catch (error) {
    throw toApiError(error);
  }
}

export const http = {
  get: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'GET', url }),
  post: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'POST', url, data: body }),
  put: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PUT', url, data: body }),
  patch: <T>(url: string, body?: unknown, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'PATCH', url, data: body }),
  delete: <T>(url: string, config?: AxiosRequestConfig) =>
    request<T>({ ...config, method: 'DELETE', url, ...config }),
  /**
   * Téléversement de fichier (`multipart/form-data`).
   *
   * On ne fixe **pas** `Content-Type` à la main : dans React Native, c'est la
   * couche réseau qui ajoute la frontière (`boundary`) ; l'imposer casserait
   * l'analyse côté serveur.
   */
  upload: <T>(url: string, fichier: FichierPhoto, champ = 'file') => {
    const donnees = new FormData();
    donnees.append(champ, {
      uri: fichier.uri,
      name: fichier.name,
      type: fichier.type,
    } as unknown as Blob);

    return request<T>({
      method: 'POST',
      url,
      data: donnees,
      headers: { 'Content-Type': undefined },
    });
  },
  /** URL absolue d'une ressource servie par l'API (photos). */
  assetUrl: (relative: string): string =>
    relative.startsWith('http') ? relative : `${env.apiUrl}${relative}`,
};
