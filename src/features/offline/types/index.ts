/**
 * Offline-first — types
 * Une action = une opération métier qui doit être synchronisée
 */

export type SyncStatus = 'PENDING' | 'SYNCING' | 'SYNCED' | 'FAILED' | 'DUPLICATE' | 'INVALID';

export type ActionType =
  | 'CREATE_PARCELLE'
  | 'UPDATE_PARCELLE'
  | 'DELETE_PARCELLE'
  | 'CREATE_CULTURE'
  | 'UPDATE_CULTURE'
  | 'DELETE_CULTURE'
  | 'CREATE_INTERVENTION'
  | 'UPDATE_INTERVENTION'
  | 'CREATE_OBSERVATION'
  | 'CREATE_RECOLTE'
  | 'UPDATE_RECOLTE'
  | 'UPLOAD_PHOTO';

export type EntityType = 'PARCELLE' | 'CULTURE' | 'INTERVENTION' | 'OBSERVATION' | 'RECOLTE' | 'PHOTO' | 'UTILISATEUR';

export interface OfflineAction {
  /** UUID v4 local, idempotence key pour backend */
  id: string;
  actionType: ActionType;
  entityType: EntityType;
  /** id local temporaire si création offline (ex: temp_xxx), sinon id distant */
  entityId: string | null;
  payload: Record<string, unknown>;
  createdAt: string; // ISO
  updatedAt: string;
  status: SyncStatus;
  retryCount: number;
  lastError?: string | null;
  syncedAt?: string | null;
  /** pour debug / traçabilité */
  deviceId?: string | null;
}

export interface EnqueueOptions {
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string | null;
  payload: Record<string, unknown>;
}

export const MAX_RETRIES = 5;
export const RETRY_DELAYS_MS = [1000, 3000, 10000, 30000, 60000]; // progressif
