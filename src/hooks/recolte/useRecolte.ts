import { useQuery } from '@tanstack/react-query';
import { recoltesApi } from '@/services';
import type { Recolte } from '@/types';
import { queryKeys } from '../queryKeys';
import { accountCachedQuery } from '@/services/offline/accountData';
import { getLocalActions } from '@/services/offline/queue';
import { localRecolte } from '@/services/offline/localEntities';

export function useRecolte(cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.recolte(cultureId ?? ''),
    queryFn: async () => {
      const actions = await getLocalActions();
      const local = actions.find((action) =>
        action.entityType === 'RECOLTE' &&
        action.actionType === 'CREATE' &&
        action.payload.cultureId === cultureId,
      );
      if (local) return localRecolte(local);
      return accountCachedQuery<Recolte>('recolte', cultureId, () => recoltesApi.getByCulture(cultureId as string));
    },
    enabled: Boolean(cultureId),
    retry: false,
  });
}
