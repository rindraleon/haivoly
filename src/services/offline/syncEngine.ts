import * as Crypto from 'expo-crypto';

import { getIsOnline } from '@/hooks/common/useNetwork';
import { getActiveAccountId } from '@/storage/authStorage';
import { getItem, setItem } from '@/storage/database';
import {
  MAX_RETRIES,
  RETRY_DELAYS_MS,
  estActionSynchronisable,
  type OfflineAction,
} from '@/types/offline.types';
import {
  getQueue,
  markConflict,
  markFailed,
  markInvalid,
  markSynced,
  updateStatus,
} from '@/services/offline/queue';
import { syncApi, type SyncActionResult } from '@/services';
import { syncMetaKey } from '@/services/offline/accountData';

export type SyncState = {
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  invalidCount: number;
  conflictCount: number;
  lastSyncAt?: string;
  lastError?: string;
};

type Listener = (state: SyncState) => void;
type CompletionHandler = () => void | Promise<void>;

let isSyncing = false;
let state: SyncState = {
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  invalidCount: 0,
  conflictCount: 0,
};
let listeners: Listener[] = [];
let deviceIdCache: { accountId: string; value: string } | null = null;
let syncCompletionHandler: CompletionHandler | null = null;

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

export function setSyncCompletionHandler(handler: CompletionHandler | null): void {
  syncCompletionHandler = handler;
}

/** Identifiant d'appareil stable, dans les métadonnées du compte actif. */
export async function getDeviceId(accountId: string): Promise<string> {
  if (deviceIdCache?.accountId === accountId) return deviceIdCache.value;
  const key = syncMetaKey(accountId);
  const meta = await getItem<{ deviceId?: string }>(key, {});
  const id = meta.deviceId ?? Crypto.randomUUID();
  if (!meta.deviceId) await setItem(key, { ...meta, deviceId: id });
  deviceIdCache = { accountId, value: id };
  return id;
}

/** Compteurs par compte actif, sans exposer une file d'un autre utilisateur. */
export async function refreshCounters(): Promise<SyncState> {
  const queue = await getQueue();
  emit({
    pendingCount: queue.filter((action) => action.status === 'PENDING' || action.status === 'SYNCING').length,
    failedCount: queue.filter((action) => action.status === 'FAILED').length,
    invalidCount: queue.filter((action) => action.status === 'INVALID').length,
    conflictCount: queue.filter((action) => action.status === 'CONFLICT').length,
  });
  return state;
}

function safeStatusMessage(status: SyncActionResult['status']): string {
  switch (status) {
    case 'CONFLICT':
      return 'Cette donnée a été modifiée ailleurs. Vérifiez-la puis corrigez-la avant un nouvel envoi.';
    case 'INVALID':
      return 'Le serveur a refusé cette modification. Vérifiez les données et vos autorisations.';
    case 'FAILED':
      return 'Échec temporaire de synchronisation. La modification sera retentée automatiquement.';
    default:
      return '';
  }
}

async function applyResult(action: OfflineAction, result: SyncActionResult): Promise<void> {
  switch (result.status) {
    case 'SYNCED':
    case 'DUPLICATE':
      await markSynced(action.id, result.entityId ?? null);
      return;
    case 'CONFLICT':
      await markConflict(action.id, safeStatusMessage('CONFLICT'));
      return;
    case 'INVALID':
      await markInvalid(action.id, safeStatusMessage('INVALID'));
      return;
    default:
      await markFailed(action.id, safeStatusMessage('FAILED'));
  }
}

function mapReference(value: unknown, idMap: Record<string, string>): unknown {
  return typeof value === 'string' ? idMap[value] ?? value : value;
}

function mapPayloadReferences(
  payload: Record<string, unknown>,
  idMap: Record<string, string>,
): Record<string, unknown> {
  const mapped = { ...payload };
  for (const key of [
    'id',
    'entityId',
    'parcelleId',
    'parcelle_id',
    'cultureId',
    'interventionId',
    'observationId',
  ]) {
    if (key in mapped) mapped[key] = mapReference(mapped[key], idMap);
  }
  return mapped;
}

function backoffFor(action: OfflineAction): number {
  const index = Math.min(Math.max(action.retryCount - 1, 0), RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[index] ?? 1000;
}

const STALE_SYNCING_MS = 2 * 60 * 1000;

export async function syncOnce(): Promise<{
  synced: number;
  failed: number;
  duplicates: number;
  conflicts: number;
}> {
  const empty = { synced: 0, failed: 0, duplicates: 0, conflicts: 0 };
  if (isSyncing) return empty;

  const accountId = await getActiveAccountId();
  if (!accountId) {
    emit({ isSyncing: false, pendingCount: 0, failedCount: 0, invalidCount: 0, conflictCount: 0 });
    return empty;
  }

  if (!(await getIsOnline())) {
    emit({ lastError: 'Hors connexion — les modifications restent locales et ne sont pas confirmées par le serveur.' });
    return empty;
  }

  isSyncing = true;
  emit({ isSyncing: true });

  try {
    let queue = await getQueue();
    const now = Date.now();

    // Reprise après fermeture forcée; le même clientId rend le nouvel envoi idempotent.
    for (const action of queue) {
      if (
        action.status === 'SYNCING' &&
        now - Date.parse(action.updatedAt) >= STALE_SYNCING_MS
      ) {
        await updateStatus(action.id, 'PENDING', {
          lastError: 'Reprise après interruption de l’application.',
        });
      }
    }
    queue = await getQueue();

    const candidates = queue.filter((action) =>
      action.status === 'PENDING' ||
      (action.status === 'FAILED' &&
        action.retryCount < MAX_RETRIES &&
        now - Date.parse(action.updatedAt) >= backoffFor(action)),
    );

    const unsupported = candidates.filter((action) => !estActionSynchronisable(action));
    for (const action of unsupported) {
      await markInvalid(action.id, 'Cette catégorie de fichier n’est pas prise en charge par la synchronisation.');
    }
    const supported = candidates.filter(estActionSynchronisable);

    if (supported.length === 0) {
      await refreshCounters();
      return empty;
    }

    const deviceId = await getDeviceId(accountId);
    const metaKey = syncMetaKey(accountId);
    const meta = await getItem<{
      deviceId?: string;
      lastSyncAt?: string;
      idMap?: Record<string, string>;
    }>(metaKey, {});
    const idMap = meta.idMap ?? {};

    for (const action of supported) await updateStatus(action.id, 'SYNCING');

    const response = await syncApi.push({
      deviceId,
      ...(meta.lastSyncAt ? { lastSync: meta.lastSyncAt } : {}),
      actions: supported.map((action) => {
        const payload = mapPayloadReferences(action.payload, idMap);
        const entityId = action.actionType === 'CREATE'
          ? action.entityId
          : (typeof action.entityId === 'string' ? idMap[action.entityId] ?? action.entityId : action.entityId);
        return {
          clientId: action.id,
          actionType: action.actionType,
          entityType: action.entityType,
          entityId,
          payload,
          deviceId,
          timestamp: action.createdAt,
          metadata: { source: 'mobile', retryCount: action.retryCount },
        };
      }),
    });

    const byClientId = new Map(response.results.map((result) => [result.clientId, result]));
    let synced = 0;
    let failed = 0;
    let duplicates = 0;
    let conflicts = 0;
    const nextIdMap = { ...idMap };

    for (const action of supported) {
      const result = byClientId.get(action.id);
      if (!result) {
        await markFailed(action.id, 'Aucune confirmation valide du serveur pour cette action.');
        failed += 1;
        continue;
      }

      await applyResult(action, result);
      if (
        action.actionType === 'CREATE' &&
        action.entityId &&
        result.entityId &&
        (result.status === 'SYNCED' || result.status === 'DUPLICATE')
      ) {
        nextIdMap[action.entityId] = result.entityId;
      }

      if (result.status === 'SYNCED') synced += 1;
      else if (result.status === 'DUPLICATE') duplicates += 1;
      else if (result.status === 'CONFLICT') conflicts += 1;
      else failed += 1;
    }

    await setItem(metaKey, {
      ...meta,
      deviceId,
      idMap: nextIdMap,
      lastSyncAt: response.syncedAt,
    });
    await refreshCounters();

    const anyRejected = failed + conflicts > 0;
    emit({
      isSyncing: true,
      lastSyncAt: response.syncedAt,
      lastError: anyRejected
        ? 'Certaines modifications nécessitent une vérification.'
        : undefined,
    });
    if (synced + duplicates > 0) await syncCompletionHandler?.();

    return { synced, failed, duplicates, conflicts };
  } catch {
    // Ne journalise ni le corps de la requête, ni le jeton, ni des erreurs DB.
    const queue = await getQueue();
    const retryables = queue.filter((action) => action.status === 'SYNCING');
    for (const action of retryables) {
      await markFailed(action.id, 'Le serveur n’a pas confirmé la synchronisation. Une nouvelle tentative sera faite.');
    }
    await refreshCounters();
    emit({
      isSyncing: true,
      lastError: 'Le serveur n’a pas confirmé la synchronisation. Une nouvelle tentative sera faite.',
    });
    return { ...empty, failed: retryables.length };
  } finally {
    isSyncing = false;
    emit({ isSyncing: false });
  }
}

/** Relance manuelle, sans contourner le plafond de tentatives. */
export async function retryFailed(): Promise<void> {
  const queue = await getQueue();
  for (const action of queue) {
    if (action.status === 'FAILED' && action.retryCount < MAX_RETRIES) {
      await updateStatus(action.id, 'PENDING', { lastError: null });
    }
  }
  await syncOnce();
}

let timer: ReturnType<typeof setInterval> | null = null;

/** Synchronisation automatique seulement si le compte actif et le token sont valides. */
export function startAutoSync(intervalMs = 20000): () => void {
  void refreshCounters();
  void syncOnce();
  if (timer) clearInterval(timer);
  timer = setInterval(() => void syncOnce(), intervalMs);
  return () => {
    if (timer) clearInterval(timer);
    timer = null;
  };
}
