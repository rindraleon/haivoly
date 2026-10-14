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
