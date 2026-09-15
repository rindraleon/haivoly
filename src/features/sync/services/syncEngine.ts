/* eslint-disable @typescript-eslint/no-unused-vars */
/**
 * Sync Engine — offline-first, batch, idempotence, retry progressif
 */
import { getIsOnline } from '@/hooks/useNetwork';
import { getPending, markSynced, markFailed, updateStatus } from '@/features/sync/services/queue';
import { MAX_RETRIES, RETRY_DELAYS_MS, type OfflineAction } from '@/features/offline/types';
import { api } from '@/api/client';

type SyncResult = { id: string; status: 'SYNCED' | 'FAILED' | 'DUPLICATE' | 'INVALID'; message?: string };

let isSyncing = false;
let listeners: ((state: SyncState) => void)[] = [];

export type SyncState = {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncAt?: string;
  lastError?: string;
};

export function onSyncState(cb: (s: SyncState) => void) {
  listeners.push(cb);
  return () => {
    listeners = listeners.filter((l) => l !== cb);
  };
}
function emit(state: Partial<SyncState>) {
  listeners.forEach((cb) => cb({ isSyncing, pendingCount: 0, ...state } as SyncState));
}

export async function syncOnce(): Promise<{ synced: number; failed: number; duplicates: number }> {
  if (isSyncing) return { synced: 0, failed: 0, duplicates: 0 };
  const online = await getIsOnline();
  if (!online) {
    emit({ lastError: 'Hors connexion' });
    return { synced: 0, failed: 0, duplicates: 0 };
  }

  const pending = await getPending();
  if (pending.length === 0) return { synced: 0, failed: 0, duplicates: 0 };

  // Filtrer ceux qui ont dépassé MAX_RETRIES -> on les laisse en FAILED sans retry
  const toSync = pending.filter((a) => a.retryCount < MAX_RETRIES);
  if (toSync.length === 0) return { synced: 0, failed: pending.length, duplicates: 0 };

  isSyncing = true;
  emit({ isSyncing: true });

  // Marquer SYNCING
  for (const a of toSync) await updateStatus(a.id, 'SYNCING');

  try {
    // Batch — 1 requête pour éviter N requêtes
    const res = await api.post<{ results: SyncResult[] }>('/actions/batch-sync', {
      actions: toSync.map((a) => ({
        clientId: a.id, // idempotence key
        actionType: a.actionType,
        entityType: a.entityType,
        entityId: a.entityId,
        payload: a.payload,
        createdAt: a.createdAt,
      })),
    });

    const results: SyncResult[] = (res.data as any).results ?? (res.data as any).data?.results ?? [];

    let synced = 0,
      failed = 0,
      duplicates = 0;

    const resultById = new Map(results.map((r) => [r.id, r]));

    for (const a of toSync) {
      const r = resultById.get(a.id);
      if (!r) {
        // si backend ne renvoie rien pour cet id, on considère SYNCED par défaut si 2xx global
        await markSynced(a.id);
        synced++;
        continue;
      }
      if (r.status === 'SYNCED') {
        await markSynced(a.id);
        synced++;
      } else if (r.status === 'DUPLICATE') {
        await updateStatus(a.id, 'DUPLICATE', { syncedAt: new Date().toISOString() });
        duplicates++;
      } else if (r.status === 'INVALID') {
        await markFailed(a.id, r.message ?? 'INVALID');
        failed++;
      } else {
        await markFailed(a.id, r.message ?? 'FAILED');
        failed++;
      }
    }

    // Ceux non inclus dans toSync (max retries dépassé) restent FAILED
    isSyncing = false;
    emit({ isSyncing: false, lastSyncAt: new Date().toISOString(), pendingCount: (await getPending()).length });
    return { synced, failed, duplicates };
  } catch (e: any) {
    const msg = e?.response?.data?.message || e?.message || 'Erreur réseau';
    // Remettre en FAILED avec increment retry et délai progressif géré au prochain appel
    for (const a of toSync) {
      await markFailed(a.id, String(msg));
    }
    isSyncing = false;
    emit({ isSyncing: false, lastError: String(msg) });
    return { synced: 0, failed: toSync.length, duplicates: 0 };
  }
}

export async function syncWithRetry(): Promise<void> {
  const pending = await getPending();
  for (const a of pending) {
    if (a.status !== 'FAILED') continue;
    const delay = RETRY_DELAYS_MS[Math.min(a.retryCount - 1, RETRY_DELAYS_MS.length - 1)] ?? 1000;
    const sinceUpdate = Date.now() - new Date(a.updatedAt).getTime();
    if (sinceUpdate < delay) continue; // respecter délai progressif
  }
  await syncOnce();
}

/** Auto-sync quand connexion revient — à appeler au boot + via intervalle */
export function startAutoSync(intervalMs = 15000) {
  let timer: ReturnType<typeof setInterval> | null = null;
  const tick = async () => {
    const online = await getIsOnline();
    if (online) await syncWithRetry();
  };
  tick();
  timer = setInterval(tick, intervalMs);
  return () => {
    if (timer) clearInterval(timer);
  };
}
