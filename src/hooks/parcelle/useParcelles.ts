import { useQuery, useQueryClient } from '@tanstack/react-query';
import { parcellesApi } from '@/services';
import type { Paginated, Parcelle } from '@/types';
import { queryKeys } from '../queryKeys';
import { accountCachedQuery, mergeQueuedEntities } from '@/services/offline/accountData';
import { getActiveAccountId } from '@/storage/authStorage';
import { getLocalActions } from '@/services/offline/queue';
import { localParcelle } from '@/services/offline/localEntities';

export function useParcelles(params?: {
  page?: number;
  limit?: number;
  statut?: string;
  recherche?: string;
}) {
  return useQuery({
    queryKey: queryKeys.parcelles(params),
    queryFn: async () => {
      const response = await accountCachedQuery('parcelles', params, () => parcellesApi.list(params));
      const accountId = await getActiveAccountId();
      if (!accountId) return response;
      const actions = await getLocalActions();
      let items = mergeQueuedEntities(response.items, actions, 'PARCELLE', (action) => localParcelle(action, accountId));

      for (const action of actions) {
        if (action.entityType !== 'POINT_GPS') continue;
        const parcelleId = action.payload.parcelleId;
        const pointsGPS = action.payload.pointsGPS;
        if (typeof parcelleId !== 'string' || !Array.isArray(pointsGPS)) continue;
        items = items.map((parcelle) => parcelle.id === parcelleId
          ? { ...parcelle, pointsGPS: pointsGPS as Parcelle['pointsGPS'], _syncStatus: action.status }
          : parcelle);
      }

      return { ...response, items, total: Math.max(response.total, items.length) };
    },
    placeholderData: (previous) => previous,
  });
}

export function useParcelle(id: string | undefined) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.parcelle(id ?? ''),
    queryFn: async () => {
      const accountId = await getActiveAccountId();
      if (!accountId) throw new Error('Une session authentifiée et non expirée est requise.');
      const actions = await getLocalActions();
      const create = actions.find((action) => action.entityType === 'PARCELLE' && action.actionType === 'CREATE' && (action.entityId ?? action.id) === id);
      if (create) return localParcelle(create, accountId);

      let base = queryClient.getQueriesData<Paginated<Parcelle>>({ queryKey: ['parcelles'] })
        .flatMap(([, page]) => page?.items ?? [])
        .find((parcelle) => parcelle.id === id);
      if (!base) {
        base = await accountCachedQuery('parcelle', id, () => parcellesApi.get(id as string));
      }
      const latest = actions
        .filter((action) => action.entityType === 'PARCELLE' && (action.entityId ?? action.id) === id)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt));
      let result = base;
      for (const action of latest) {
        if (action.actionType === 'DELETE') throw new Error('Cette parcelle est supprimée en attente de synchronisation.');
        if (action.actionType === 'UPDATE' && result) {
          result = { ...result, ...action.payload, _localOnly: true, _syncStatus: action.status };
        }
      }
      return result;
    },
    enabled: Boolean(id),
  });
}
