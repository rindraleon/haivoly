import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { recoltesApi } from '@/services';
import { accountCachedQuery, mergeQueuedEntities } from '@/services/offline/accountData';
import { localRecolte } from '@/services/offline/localEntities';
import { getLocalActions } from '@/services/offline/queue';
import { getActiveAccountId } from '@/storage/authStorage';
import type { Recolte } from '@/types';
import { asItems } from '@/utils/api';

/**
 * Récoltes du compte (lot 5) : liste paginée complète + fusion hors ligne,
 * clé partagée `queryKeys.recoltes` pour ne jamais doubler le cache.
 */
export function useRecoltesDuCompte() {
  return useQuery({
    queryKey: queryKeys.recoltes,
    queryFn: async (): Promise<Recolte[]> => {
      const serveur = await accountCachedQuery('recoltes', 'compte', () =>
        recoltesApi.list({ limit: 200 }).then(asItems),
      );
      const accountId = await getActiveAccountId();
      if (!accountId) return serveur;
      const actions = await getLocalActions();
      return mergeQueuedEntities(serveur, actions, 'RECOLTE', localRecolte);
    },
  });
}
