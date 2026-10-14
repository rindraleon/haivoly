export type SyncStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'DUPLICATE'
  | 'INVALID'
  | 'CONFLICT';

export type WithSyncStatus = {
  _localOnly?: boolean;
  _syncStatus?: SyncStatus;
};

export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE';

export const ACTION_TYPES: readonly ActionType[] = ['CREATE', 'UPDATE', 'DELETE'];

export type EntityType =
  | 'PARCELLE'
  | 'POINT_GPS'
  | 'CULTURE'
  | 'INTERVENTION'
  | 'OBSERVATION'
  | 'PHOTO'
  | 'RECOLTE';

export const ENTITY_TYPES: readonly EntityType[] = [
  'PARCELLE',
  'POINT_GPS',
  'CULTURE',
  'INTERVENTION',
  'OBSERVATION',
  'PHOTO',
  'RECOLTE',
];

/** Vrai si l'action respecte le contrat accepté par `POST /sync`. */
export function estActionSynchronisable(action: {
  actionType: string;
  entityType: string;
}): boolean {
  return (
    ACTION_TYPES.includes(action.actionType as ActionType) &&
    ENTITY_TYPES.includes(action.entityType as EntityType)
  );
}

export interface OfflineAction {
  /** UUID aléatoire : clé d'idempotence unique sur le backend par utilisateur. */
  id: string;
  actionType: ActionType;
  entityType: EntityType;
  /** UUID local à résoudre après une création hors ligne. */
  entityId: string | null;
  /** ID attribué par le serveur après un résultat SYNCED/DUPLICATE. */
  serverEntityId?: string | null;
  payload: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  status: SyncStatus;
  retryCount: number;
  lastError?: string | null;
  syncedAt?: string | null;
  deviceId?: string | null;
}

export interface EnqueueOptions {
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string | null;
  payload: Record<string, unknown>;
}

export const MAX_RETRIES = 5;
export const RETRY_DELAYS_MS = [1000, 3000, 10000, 30000, 60000] as const;
