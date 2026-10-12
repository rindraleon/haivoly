import * as Crypto from 'expo-crypto';

import { getActiveAccountId } from '@/storage/authStorage';
import { accountStorageKey, getItem, setItem, StorageKeys } from '@/storage/database';
import type { OfflineAction, EnqueueOptions, SyncStatus, EntityType } from '@/types/offline.types';

let queueWriteChain: Promise<void> = Promise.resolve();

function serializeWrite<T>(operation: () => Promise<T>): Promise<T> {
  const result = queueWriteChain.then(operation, operation);
  queueWriteChain = result.then(() => undefined, () => undefined);
  return result;
}

async function queueKey(): Promise<string | null> {
  const accountId = await getActiveAccountId();
  return accountId ? accountStorageKey(accountId, StorageKeys.OFFLINE_QUEUE) : null;
}

async function readQueue(key: string): Promise<OfflineAction[]> {
  return getItem<OfflineAction[]>(key, []);
}

export async function enqueue(options: EnqueueOptions): Promise<OfflineAction> {
  const key = await queueKey();
  if (!key) {
    throw new Error('Connectez-vous avec une session valide avant de créer une action hors ligne.');
  }

  return serializeWrite(async () => {
    const now = new Date().toISOString();
    const id = Crypto.randomUUID();
    const action: OfflineAction = {
      id,
      actionType: options.actionType,
      entityType: options.entityType,
      entityId: options.entityId ?? (options.actionType === 'CREATE' ? id : null),
      payload: options.payload,
      createdAt: now,
      updatedAt: now,
      status: 'PENDING',
      retryCount: 0,
      lastError: null,
      syncedAt: null,
      serverEntityId: null,
    };
    const queue = await readQueue(key);
    queue.push(action);
    await setItem(key, queue);
    return action;
  });
}

export async function getQueue(): Promise<OfflineAction[]> {
  await queueWriteChain;
  const key = await queueKey();
  if (!key) return [];
  return readQueue(key);
}

export async function getPending(): Promise<OfflineAction[]> {
  const queue = await getQueue();
  return queue.filter((action) => action.status === 'PENDING' || action.status === 'FAILED');
}

export async function getLocalActions(entityType?: EntityType): Promise<OfflineAction[]> {
  const queue = await getQueue();
  const recentSyncCutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return queue.filter((action) => {
    const recentlyConfirmedCreate =
      action.actionType === 'CREATE' &&
      action.status === 'SYNCED' &&
      !!action.serverEntityId &&
      !!action.syncedAt &&
      Date.parse(action.syncedAt) >= recentSyncCutoff;
    return (
      (recentlyConfirmedCreate || (action.status !== 'SYNCED' && action.status !== 'DUPLICATE')) &&
      (!entityType || action.entityType === entityType)
    );
  });
}

export async function getLocalAction(entityType: EntityType, entityId: string): Promise<OfflineAction | undefined> {
  const queue = await getQueue();
  return queue
    .filter((action) => action.entityType === entityType && (action.entityId === entityId || action.serverEntityId === entityId))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
}

export async function updateStatus(
  id: string,
  status: SyncStatus,
  patch: Partial<OfflineAction> = {},
): Promise<void> {
  const key = await queueKey();
  if (!key) return;
  await serializeWrite(async () => {
    const queue = await readQueue(key);
    const index = queue.findIndex((action) => action.id === id);
    if (index === -1) return;
    queue[index] = {
      ...queue[index],
      status,
      updatedAt: new Date().toISOString(),
      ...patch,
    };
    await setItem(key, queue);
  });
}

export async function markSynced(id: string, serverEntityId?: string | null): Promise<void> {
  await updateStatus(id, 'SYNCED', {
    syncedAt: new Date().toISOString(),
    serverEntityId: serverEntityId ?? null,
    lastError: null,
  });
}

export async function markInvalid(id: string, error: string): Promise<void> {
  await updateStatus(id, 'INVALID', { lastError: error });
}

export async function markConflict(id: string, error: string): Promise<void> {
  await updateStatus(id, 'CONFLICT', { lastError: error });
}

export async function markFailed(id: string, error: string): Promise<void> {
  const key = await queueKey();
  if (!key) return;
  await serializeWrite(async () => {
    const queue = await readQueue(key);
    const index = queue.findIndex((action) => action.id === id);
    if (index === -1) return;
    const found = queue[index];
    queue[index] = {
      ...found,
      status: 'FAILED',
      updatedAt: new Date().toISOString(),
      lastError: error,
      retryCount: found.retryCount + 1,
    };
    await setItem(key, queue);
  });
}

export async function incrementRetry(id: string): Promise<void> {
  const queue = await getQueue();
  const found = queue.find((action) => action.id === id);
  if (!found) return;
  await updateStatus(id, found.status, { retryCount: found.retryCount + 1 });
}

export async function removeSynced(): Promise<void> {
  const key = await queueKey();
  if (!key) return;
  await serializeWrite(async () => {
    const queue = await readQueue(key);
    await setItem(key, queue.filter((action) => action.status !== 'SYNCED' && action.status !== 'DUPLICATE'));
  });
}

export async function clearQueue(): Promise<void> {
  const key = await queueKey();
  if (key) await serializeWrite(() => setItem(key, []));
}

export async function getPendingCount(): Promise<number> {
  return (await getPending()).length;
}
