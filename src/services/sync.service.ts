import { http } from '@/services/http';

export interface SyncActionPayload {
  clientId: string;
  actionType: string;
  entityType: string;
  entityId?: string | null;
  payload?: Record<string, unknown>;
  deviceId?: string | null;
  /** Horodatage ISO-8601 (le backend refuse les champs non déclarés). */
  timestamp?: string;
  metadata?: Record<string, unknown>;
}

export interface SyncActionResult {
  id: string;
  clientId: string;
  status: 'SYNCED' | 'DUPLICATE' | 'FAILED' | 'INVALID' | 'CONFLICT';
  entityType: string;
  actionType: string;
  entityId?: string | null;
  message?: string;
  data?: unknown;
}

export interface SyncResponse {
  results: SyncActionResult[];
  syncedAt: string;
  summary: { total: number; synced: number; duplicates: number; failed: number };
  changes?: Record<string, unknown>;
}

export const syncApi = {
  push: (body: { actions: SyncActionPayload[]; deviceId?: string; lastSync?: string }) =>
    http.post<SyncResponse>('/sync', body),
  failed: () => http.get<unknown>('/actions/me/failed'),
};
