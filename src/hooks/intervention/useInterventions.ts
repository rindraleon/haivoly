import { useQuery, useQueryClient } from '@tanstack/react-query';
import { interventionsApi } from '@/services';
import { asItems } from '@/utils/api';
import type { Intervention } from '@/types';
import { queryKeys } from '../queryKeys';
import { accountCachedQuery, mergeQueuedEntities } from '@/services/offline/accountData';
import { getLocalActions } from '@/services/offline/queue';
import { localIntervention } from '@/services/offline/localEntities';
import { getActiveAccountId } from '@/storage/authStorage';

export function useInterventions(cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.interventions(cultureId ?? ''),
    queryFn: async () => {
      const serverItems = await accountCachedQuery('interventions', cultureId, () =>
        interventionsApi.listByCulture(cultureId as string, { limit: 200 }).then(asItems),
      );
      const accountId = await getActiveAccountId();
      if (!accountId) return serverItems;
      const actions = await getLocalActions();
      return mergeQueuedEntities(serverItems, actions, 'INTERVENTION', localIntervention)
        .filter((item) => item.cultureId === cultureId);
    },
    enabled: Boolean(cultureId),
  });
}

export function useIntervention(id?: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: ['intervention', id ?? ''],
    queryFn: async () => {
      const accountId = await getActiveAccountId();
      if (!accountId) throw new Error('Une session authentifiée et non expirée est requise.');
      const actions = await getLocalActions();
      const create = actions.find((action) => action.entityType === 'INTERVENTION' && action.actionType === 'CREATE' && (action.entityId ?? action.id) === id);
      if (create) return localIntervention(create);

      const cachedItems = queryClient.getQueriesData<Intervention[]>({ queryKey: ['interventions'] })
        .flatMap(([, items]) => items ?? []);
      let base = cachedItems.find((item) => item.id === id);
      if (!base) base = await accountCachedQuery('intervention', id, () => interventionsApi.get(id as string));
      let result: Intervention | undefined = base;
      for (const action of actions
        .filter((item) => item.entityType === 'INTERVENTION' && (item.entityId ?? item.id) === id)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))) {
        if (action.actionType === 'DELETE') throw new Error('Cette intervention est supprimée en attente de synchronisation.');
        if (action.actionType === 'UPDATE' && result) result = { ...result, ...action.payload, _localOnly: true, _syncStatus: action.status };
      }
      return result as Intervention;
    },
    enabled: Boolean(id),
  });
}
