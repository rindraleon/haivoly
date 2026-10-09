import * as Crypto from 'expo-crypto';

import { getIsOnline } from '@/hooks/common/useNetwork';
import { getItem, setItem, StorageKeys } from '@/storage/database';
import {
  MAX_RETRIES,
  RETRY_DELAYS_MS,
  estActionSynchronisable,
  type OfflineAction,
} from '@/types/offline.types';
import {
  getPending,
  markFailed,
  markInvalid,
  markSynced,
  updateStatus,
} from '@/services/offline/queue';
import { syncApi, type SyncActionResult } from '@/services';

export type SyncState = {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastSyncAt?: string;
  lastError?: string;
};

type Listener = (state: SyncState) => void;

let isSyncing = false;
let state: SyncState = { isSyncing: false, pendingCount: 0, failedCount: 0 };
let listeners: Listener[] = [];
let deviceIdCache: string | null = null;

function emit(patch: Partial<SyncState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener(state));
}

export function getSyncState(): SyncState {
  return state;
}

export function onSyncState(change: Listener): () => void {
  listeners.push(change);
  change(state);
  return () => {
    listeners = listeners.filter((listener) => listener !== change);
  };
}

/** Identifiant d'appareil stable (jamais l'IMEI : un UUID local suffit). */
export async function getDeviceId(): Promise<string> {
  if (deviceIdCache) return deviceIdCache;

  const meta = await getItem<{ deviceId?: string }>(StorageKeys.SYNC_META, {});
  let id = meta.deviceId;

  if (!id) {
    id = Crypto.randomUUID();
    await setItem(StorageKeys.SYNC_META, { ...meta, deviceId: id });
  }

  deviceIdCache = id;
  return id;
}

/** Rafraîchit les compteurs affichés dans l'interface. */
export async function refreshCounters(): Promise<SyncState> {
  const queue = await getPending();
  emit({
    pendingCount: queue.filter((action) => action.status === 'PENDING').length,
    failedCount: queue.filter((action) => action.status === 'FAILED').length,
  });
  return state;
}

function applyResult(action: OfflineAction, result: SyncActionResult): Promise<void> {
  switch (result.status) {
    case 'SYNCED':
      return markSynced(action.id);
    case 'DUPLICATE':
      // Déjà traitée par le serveur : c'est un succès, pas une erreur.
      return updateStatus(action.id, 'DUPLICATE', {
        syncedAt: new Date().toISOString(),
        lastError: null,
      });
    case 'CONFLICT':
      return markFailed(
        action.id,
        result.message ??
          "Conflit détecté : la donnée a été modifiée sur un autre appareil.",
      );
    default:
      return markFailed(action.id, result.message ?? "Échec de synchronisation");
  }
}

export async function syncOnce(): Promise<{
  synced: number;
  failed: number;
  duplicates: number;
  conflicts: number;
}> {
  const empty = { synced: 0, failed: 0, duplicates: 0, conflicts: 0 };

  if (isSyncing) return empty;

  const online = await getIsOnline();
  if (!online) {
    emit({ lastError: 'Hors connexion — les modifications seront envoyées plus tard.' });
    return empty;
  }

  const pending = await getPending();
  const candidats = pending.filter(
    (action) =>
      action.status === 'PENDING' ||
      (action.status === 'FAILED' &&
        action.retryCount < MAX_RETRIES &&
        Date.now() - new Date(action.updatedAt).getTime() >= backoffFor(action)),
  );

  const horsContrat = candidats.filter((action) => !estActionSynchronisable(action));

  for (const action of horsContrat) {
    await markInvalid(
      action.id,
      `Action non prise en charge par l'API : ${action.actionType}/${action.entityType}`,
    );
  }

  const candidates = candidats.filter(estActionSynchronisable);

  if (candidates.length === 0) {
    await refreshCounters();
    return empty;
  }

  isSyncing = true;
  emit({ isSyncing: true });

  for (const action of candidates) {
    await updateStatus(action.id, 'SYNCING');
  }

  const deviceId = await getDeviceId();

  try {
    const response = await syncApi.push({
      deviceId,
      actions: candidates.map((action) => ({
        clientId: action.id,
        actionType: action.actionType,
        entityType: action.entityType,
        entityId: action.entityId,
        payload: action.payload,
        deviceId,
        // ⚠️ Le backend attend `timestamp` (et refuse tout champ inconnu) :
        // c'est l'horodatage de création de l'action côté mobile.
        timestamp: action.createdAt,
        metadata: { source: 'mobile', retryCount: action.retryCount },
      })),
    });

    const byClientId = new Map(response.results.map((result) => [result.clientId, result]));

    let synced = 0;
    let failed = 0;
    let duplicates = 0;
    let conflicts = 0;

    for (const action of candidates) {
      const result = byClientId.get(action.id);

      if (!result) {
        // Aucun résultat renvoyé : on ne considère JAMAIS l'action comme
        // réussie (l'ancien moteur la marquait « SYNCED » à tort).
        await markFailed(action.id, 'Aucune réponse du serveur pour cette action');
        failed += 1;
        continue;
      }

      await applyResult(action, result);

      if (result.status === 'SYNCED') synced += 1;
      else if (result.status === 'DUPLICATE') duplicates += 1;
      else if (result.status === 'CONFLICT') conflicts += 1;
      else failed += 1;
    }

    await refreshCounters();
    await setItem(StorageKeys.SYNC_META, {
      ...(await getItem(StorageKeys.SYNC_META, {})),
      deviceId,
      lastSyncAt: response.syncedAt,
    });

    emit({
      isSyncing: false,
      lastSyncAt: response.syncedAt,
      lastError:
        failed + conflicts > 0
          ? 'Certaines modifications n’ont pas pu être synchronisées.'
          : undefined,
    });

    return { synced, failed, duplicates, conflicts };
  } catch (error) {
    const message =
      (error as { message?: string })?.message ?? 'Erreur réseau pendant la synchronisation';

    for (const action of candidates) {
      await markFailed(action.id, message);
    }

    await refreshCounters();
    emit({ isSyncing: false, lastError: message });

    return { ...empty, failed: candidates.length };
  } finally {
    isSyncing = false;
  }
}

function backoffFor(action: OfflineAction): number {
  const index = Math.min(Math.max(action.retryCount - 1, 0), RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[index] ?? 1000;
}

/** Relance manuelle déclenchée par le bouton « Réessayer ». */
export async function retryFailed(): Promise<void> {
  const pending = await getPending();

  for (const action of pending.filter((item) => item.status === 'FAILED')) {
    await updateStatus(action.id, 'PENDING', { lastError: null });
  }

  await syncOnce();
}

let timer: ReturnType<typeof setInterval> | null = null;

/** Démarre la synchronisation automatique (au démarrage + périodique). */
export function startAutoSync(intervalMs = 20000): () => void {
  void refreshCounters();
  void syncOnce();

  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    void syncOnce();
  }, intervalMs);

  return () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
}
