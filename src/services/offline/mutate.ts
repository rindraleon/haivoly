import { getIsOnline } from '@/hooks/common/useNetwork';
import { getActiveAccountId } from '@/storage/authStorage';
import type { ActionType, EntityType, OfflineAction } from '@/types/offline.types';
import { enqueue } from '@/services/offline/queue';

export interface QueueableMutation<T> {
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string | null;
  payload: Record<string, unknown>;
  remote: () => Promise<T>;
  local: (action: OfflineAction, accountId: string) => T;
}

/**
 * N'essaie le REST que si Internet est disponible. En cas de coupure signalée,
 * enfile sous le compte/session valides; une erreur après une tentative REST
 * n'est jamais transformée en succès local (risque de doublon après timeout).
 */
export async function executeQueueableMutation<T>(input: QueueableMutation<T>): Promise<T> {
  if (await getIsOnline()) return input.remote();

  const accountId = await getActiveAccountId();
  if (!accountId) {
    throw new Error('Une session authentifiée et non expirée est requise pour enregistrer hors ligne.');
  }

  const action = await enqueue({
    actionType: input.actionType,
    entityType: input.entityType,
    entityId: input.entityId,
    payload: input.payload,
  });
  const engine = await import('@/services/offline/syncEngine');
  await engine.refreshCounters();
  return input.local(action, accountId);
}
