import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
  isAxiosError,
} from 'axios';

import { env } from '@/config/env';
import type { FichierPhoto } from '@/types';
import { clearToken, getToken } from '@/storage/authStorage';


export interface ChampInvalide {
  field: string;
  path?: (string | number)[];
  code: string;
  message: string;
  value?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  /** Champs fautifs indexés (`VALIDATION_ERROR`). */
  readonly fields: ChampInvalide[];

  constructor(
    message: string,
    status = 0,
    code = 'UNKNOWN',
    details?: unknown,
    fields: ChampInvalide[] = [],
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    // Assainissement systématique : une charge utile malformée (champ sans
    // `field`, entrée non objet) ne doit pas casser l'affichage d'un formulaire.
    this.fields = champsRecus(fields);
  }

  /** Vrai si l'erreur est liée au réseau (mode hors-ligne). */
  get isNetworkError(): boolean {
    return this.status === 0;
  }

  /** Vrai si l'erreur porte des champs de formulaire identifiés. */
  get hasFieldErrors(): boolean {
    return this.fields.length > 0;
  }
}

/** Sécurise la charge utile `fields` reçue du serveur. */
function champsRecus(valeur: unknown): ChampInvalide[] {
  if (!Array.isArray(valeur)) return [];

  return valeur.flatMap((entree) => {
    if (!entree || typeof entree !== 'object') return [];
    const champ = entree as Record<string, unknown>;
    if (typeof champ.field !== 'string') return [];

    return [
      {
        field: champ.field,
        path: Array.isArray(champ.path) ? (champ.path as (string | number)[]) : undefined,
        code: typeof champ.code === 'string' ? champ.code : 'VALIDATION_ERROR',
        message:
          typeof champ.message === 'string'
            ? champ.message
            : 'Valeur invalide',
        value: champ.value,
      },
    ];
  });
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

let onUnauthorized: (() => void) | null = null;
let sessionPerdueSignalee = false;

/** Permet au provider d'auth de réagir à une expiration de session. */
export function setUnauthorizedHandler(handler: (() => void) | null): void {
  onUnauthorized = handler;
}

export function estExpirationDeSession(
  statut: number,
  code?: string,
): boolean {
  if (statut !== 401) return false;
  return code !== 'AUTH_INVALID_CREDENTIALS';
}

/** Réarme la notification de session perdue après une connexion réussie. */
export function reinitialiserExpirationSession(): void {
  sessionPerdueSignalee = false;
}

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
    const statut = error.response?.status ?? 0;
    const corps = error.response?.data as
      | { code?: string; errorCode?: string }
      | undefined;
    const code = corps?.code ?? corps?.errorCode;

    if (estExpirationDeSession(statut, code)) {
      await clearToken();

      // Un seul signalement par session : dix requêtes en parallèle ne doivent
      // pas produire dix fois le même message.
      if (!sessionPerdueSignalee) {
        sessionPerdueSignalee = true;
        onUnauthorized?.();
      }
    }

    return Promise.reject(error);
  },
);

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;

  const axiosError = error as AxiosError<{
    message?: string | string[];
    code?: string;
    errorCode?: string;
    fields?: unknown;
    details?: unknown;
  }>;

  if (!isAxiosError(error)) {
    return new ApiError('Une erreur inattendue est survenue.', 0, 'UNKNOWN');
  }

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

  const fields = champsRecus(data?.fields);
  // Un message générique ne doit pas masquer les champs fautifs : quand le
  // serveur en fournit, l'écran affiche l'erreur sous chaque champ.
  const messageFinal =
    message === 'Validation échouée' && fields.length > 0
      ? 'Certaines informations sont invalides.'
      : message;

  return new ApiError(
    messageFinal,
    status,
    data?.code ?? data?.errorCode ?? 'HTTP_ERROR',
    Array.isArray(rawMessage) ? rawMessage : data?.details,
    fields,
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
