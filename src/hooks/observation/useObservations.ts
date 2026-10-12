import { useQuery, useQueryClient } from '@tanstack/react-query';
import { observationsApi } from '@/services';
import { asItems } from '@/utils/api';
import type { Observation } from '@/types';
import { queryKeys } from '../queryKeys';
import { accountCachedQuery, mergeQueuedEntities } from '@/services/offline/accountData';
import { getLocalActions } from '@/services/offline/queue';
import { localObservation } from '@/services/offline/localEntities';
import { getActiveAccountId } from '@/storage/authStorage';

export function useObservations(cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.observations(cultureId ?? ''),
    queryFn: async () => {
      const serverItems = await accountCachedQuery('observations', cultureId, () =>
        observationsApi.listByCulture(cultureId as string, { limit: 200 }).then(asItems),
      );
      const accountId = await getActiveAccountId();
      if (!accountId) return serverItems;
      const actions = await getLocalActions();
      return mergeQueuedEntities(serverItems, actions, 'OBSERVATION', localObservation)
        .filter((item) => item.cultureId === cultureId);
    },
    enabled: Boolean(cultureId),
  });
}

export function useObservation(id?: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['observation', id ?? ''],
    queryFn: async () => {
      const accountId = await getActiveAccountId();
      if (!accountId) throw new Error('Une session authentifiée et non expirée est requise.');
      const actions = await getLocalActions();
      const create = actions.find((action) => action.entityType === 'OBSERVATION' && action.actionType === 'CREATE' && (action.entityId ?? action.id) === id);
      if (create) return localObservation(create);

      const cachedItems = queryClient.getQueriesData<Observation[]>({ queryKey: ['observations'] })
        .flatMap(([, items]) => items ?? []);
      let base = cachedItems.find((item) => item.id === id);
      if (!base) base = await accountCachedQuery('observation', id, () => observationsApi.get(id as string));
      let result: Observation | undefined = base;
      for (const action of actions
        .filter((item) => item.entityType === 'OBSERVATION' && (item.entityId ?? item.id) === id)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))) {
        if (action.actionType === 'DELETE') throw new Error('Cette observation est supprimée en attente de synchronisation.');
        if (action.actionType === 'UPDATE' && result) result = { ...result, ...action.payload, _localOnly: true, _syncStatus: action.status };
      }
      return result as Observation;
    },
    enabled: Boolean(id),
  });
}
