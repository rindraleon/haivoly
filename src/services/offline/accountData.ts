import { getIsOnline } from '@/hooks/common/useNetwork';
import { getActiveAccountId } from '@/storage/authStorage';
import { accountStorageKey, getItem, setItem, StorageKeys } from '@/storage/database';
import type { EntityType, OfflineAction, SyncStatus } from '@/types/offline.types';
import { getQueue } from '@/services/offline/queue';

export class OfflineCacheMissError extends Error {
  readonly code = 'OFFLINE_CACHE_MISS';
  constructor() {
    super('Aucune copie locale de cette donnée n’est disponible.');
    this.name = 'OfflineCacheMissError';
  }
}

function serializeKey(value: unknown): string {
  return encodeURIComponent(JSON.stringify(value ?? null));
}

/** API reads use per-account cache; offline data is always explicitly stale/local. */
export async function accountCachedQuery<T>(
  namespace: string,
  params: unknown,
  fetcher: () => Promise<T>,
): Promise<T> {
  const accountId = await getActiveAccountId();
  if (!accountId) {
    throw new Error('Une session authentifiée et non expirée est requise.');
  }

  const key = accountStorageKey(
    accountId,
    `${StorageKeys.QUERY_CACHE}:${namespace}:${serializeKey(params)}`,
  );
  const online = await getIsOnline();
  if (!online) {
    const cached = await getItem<{ data: T } | null>(key, null);
    if (!cached) throw new OfflineCacheMissError();
    return cached.data;
  }

  const data = await fetcher();
  try {
    await setItem(key, { savedAt: new Date().toISOString(), data });
  } catch {
    // Un échec de cache ne doit ni masquer une réponse API valide ni l'annuler.
  }
  return data;
}

export function mergeQueuedEntities<T extends { id: string }>(
  serverItems: T[],
  actions: OfflineAction[],
  entityType: EntityType,
  makeLocal: (action: OfflineAction) => T,
): T[] {
  const byId = new Map(serverItems.map((item) => [item.id, item]));
  const ordered = actions
    .filter((action) => action.entityType === entityType)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));

  for (const action of ordered) {
    const id = action.serverEntityId ?? action.entityId ?? action.id;
    if (action.actionType === 'DELETE') {
      byId.delete(id);
      continue;
    }
    if (action.actionType === 'CREATE') {
      // Ne remplace jamais une réponse serveur plus récente par une copie locale.
      if (!byId.has(id)) byId.set(id, makeLocal(action));
      continue;
    }

    const current = byId.get(id);
    if (current) {
      byId.set(id, {
        ...current,
        ...action.payload,
        _localOnly: Boolean((current as T & { _localOnly?: boolean })._localOnly),
        _syncStatus: action.status,
      } as T);
    }
  }

  return Array.from(byId.values());
}

/** Returns the best local/server snapshot after pending changes are overlaid. */
export async function getQueuedEntity<T extends { id: string }>(
  entityType: EntityType,
  entityId: string,
  base: T | undefined,
  makeLocal: (action: OfflineAction) => T,
): Promise<T | undefined> {
  const queue = await getQueue();
  const relevant = queue
    .filter((action) => action.entityType === entityType && (action.entityId ?? action.id) === entityId)
    .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  let current = base;

  for (const action of relevant) {
    if (action.actionType === 'DELETE') {
      current = undefined;
    } else if (action.actionType === 'CREATE') {
      current = makeLocal(action);
    } else if (current) {
      current = {
        ...current,
        ...action.payload,
        _syncStatus: action.status,
      } as T;
    }
  }
  return current;
}

export function syncMetaKey(accountId: string): string {
  return accountStorageKey(accountId, StorageKeys.SYNC_META);
}

export type WithSyncStatus = {
  _localOnly?: boolean;
  _syncStatus?: SyncStatus;
};
