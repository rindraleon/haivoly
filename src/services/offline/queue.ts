/**
 * Offline Queue — enqueue / list / update / remove
 * Utilise AsyncStorage via storage/database.ts
 */
import * as Crypto from 'expo-crypto';
import { getItem, setItem, StorageKeys } from '@/storage/database';
import type { OfflineAction, EnqueueOptions, SyncStatus } from '@/types/offline.types';

const QUEUE_KEY = StorageKeys.OFFLINE_QUEUE;

export async function enqueue(options: EnqueueOptions): Promise<OfflineAction> {
  const now = new Date().toISOString();
  const action: OfflineAction = {
    id: Crypto.randomUUID(),
    actionType: options.actionType,
    entityType: options.entityType,
    entityId: options.entityId ?? null,
    payload: options.payload,
    createdAt: now,
    updatedAt: now,
    status: 'PENDING',
    retryCount: 0,
    lastError: null,
    syncedAt: null,
  };
  const queue = await getItem<OfflineAction[]>(QUEUE_KEY, []);
  queue.push(action);
  await setItem(QUEUE_KEY, queue);
  return action;
}

export async function getQueue(): Promise<OfflineAction[]> {
  return getItem<OfflineAction[]>(QUEUE_KEY, []);
}

export async function getPending(): Promise<OfflineAction[]> {
  const q = await getQueue();
  return q.filter((a) => a.status === 'PENDING' || a.status === 'FAILED');
}

export async function updateStatus(id: string, status: SyncStatus, patch: Partial<OfflineAction> = {}): Promise<void> {
  const q = await getQueue();
  const idx = q.findIndex((a) => a.id === id);
  if (idx === -1) return;
  q[idx] = { ...q[idx], status, updatedAt: new Date().toISOString(), ...patch };
  await setItem(QUEUE_KEY, q);
}

export async function markSynced(id: string): Promise<void> {
  await updateStatus(id, 'SYNCED', { syncedAt: new Date().toISOString(), lastError: null });
}

/** Action que le serveur ne peut pas traiter : sortie de la file d'attente. */
export async function markInvalid(id: string, error: string): Promise<void> {
  await updateStatus(id, 'INVALID', { lastError: error });
}

export async function markFailed(id: string, error: string): Promise<void> {
  const q = await getQueue();
  const found = q.find((a) => a.id === id);
  if (!found) return;
  const nextRetry = found.retryCount + 1;
  await updateStatus(id, 'FAILED', { lastError: error, retryCount: nextRetry });
}

export async function incrementRetry(id: string): Promise<void> {
  const q = await getQueue();
  const f = q.find((a) => a.id === id);
  if (!f) return;
  await updateStatus(id, f.status, { retryCount: f.retryCount + 1 });
}

export async function removeSynced(): Promise<void> {
  const q = await getQueue();
  const filtered = q.filter((a) => a.status !== 'SYNCED' && a.status !== 'DUPLICATE');
  await setItem(QUEUE_KEY, filtered);
}

export async function clearQueue(): Promise<void> {
  await setItem(QUEUE_KEY, []);
}

export async function getPendingCount(): Promise<number> {
  const pending = await getPending();
  return pending.length;
}
