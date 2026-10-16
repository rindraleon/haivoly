import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { culturesApi } from '@/services';
import type { Culture, Paginated } from '@/types';
import { asItems } from '@/utils/api';
import { queryKeys } from '../queryKeys';
import { accountCachedQuery, mergeQueuedEntities } from '@/services/offline/accountData';
import { getActiveAccountId } from '@/storage/authStorage';
import { getLocalActions } from '@/services/offline/queue';
import { localCulture } from '@/services/offline/localEntities';

async function mergeCultureList(serverItems: Culture[], parcelleId?: string): Promise<Culture[]> {
  const accountId = await getActiveAccountId();
  if (!accountId) return serverItems;
  const actions = await getLocalActions();
  return mergeQueuedEntities(serverItems, actions, 'CULTURE', (action) => localCulture(action))
    .filter((culture) => !parcelleId || culture.parcelleId === parcelleId);
}

export function useCultures(params?: {
  page?: number;
  limit?: number;
  statut?: string;
  parcelleId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.cultures(params),
    queryFn: async () => {
      const response = await accountCachedQuery('cultures', params, () => culturesApi.list(params));
      const items = await mergeCultureList(response.items, params?.parcelleId);
      return { ...response, items, total: Math.max(response.total, items.length) };
    },
    placeholderData: (previous) => previous,
  });
}

export function useCulture(parcelleId?: string, cultureId?: string) {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.culture(cultureId ?? ''),
    queryFn: async () => {
      const accountId = await getActiveAccountId();
      if (!accountId) throw new Error('Une session authentifiée et non expirée est requise.');
      const actions = await getLocalActions();
      const create = actions.find((action) => action.entityType === 'CULTURE' && action.actionType === 'CREATE' && (action.entityId ?? action.id) === cultureId);
      if (create) return localCulture(create);

      // Copie de liste utilisée seulement si elle est à jour : juste après une
      // modification (statut…), la liste invalidée n'est pas encore relue et
      // renverrait l'ancienne valeur — on interroge alors le serveur.
      let base = queryClient
        .getQueriesData<Paginated<Culture>>({ queryKey: ['cultures'], predicate: (query) => !query.state.isInvalidated })
        .flatMap(([, page]) => page?.items ?? [])
        .find((culture) => culture.id === cultureId);
      if (!base) {
        base = await accountCachedQuery('culture', cultureId, () =>
          parcelleId
            ? culturesApi.get(parcelleId, cultureId as string)
            : culturesApi.getById(cultureId as string),
        );
      }

      let result: Culture | undefined = base;
      for (const action of actions
        .filter((item) => item.entityType === 'CULTURE' && (item.entityId ?? item.id) === cultureId)
        .sort((left, right) => left.createdAt.localeCompare(right.createdAt))) {
        if (action.actionType === 'DELETE') throw new Error('Cette culture est supprimée en attente de synchronisation.');
        if (action.actionType === 'UPDATE' && result) {
          result = { ...result, ...action.payload, _localOnly: true, _syncStatus: action.status };
        }
      }
      return result as Culture;
    },
    enabled: Boolean(cultureId),
  });
}

export function useCulturesDeParcelle(parcelleId?: string) {
  return useQuery({
    queryKey: queryKeys.culturesParcelle(parcelleId ?? ''),
    queryFn: async () => {
      const items = await accountCachedQuery('cultures-parcelle', parcelleId, () =>
        culturesApi.listByParcelle(parcelleId as string, { limit: 200 }).then(asItems),
      );
      return mergeCultureList(items, parcelleId);
    },
    enabled: Boolean(parcelleId),
  });
}

export type CultureAvecParcelle = Culture & { parcelleId: string; parcelleNom: string };

export function useToutesLesCultures(parcelles: { id: string; nom: string }[] | undefined) {
  const results = useQueries({
    queries: (parcelles ?? []).map((parcelle) => ({
      queryKey: queryKeys.culturesParcelle(parcelle.id),
      queryFn: async () => {
        const items = await accountCachedQuery('cultures-parcelle', parcelle.id, () =>
          culturesApi.listByParcelle(parcelle.id, { limit: 200 }).then(asItems),
        );
        return mergeCultureList(items, parcelle.id);
      },
      enabled: Boolean(parcelle.id),
    })),
  });

  const cultures = results.flatMap((result, index) => {
    const parcelle = parcelles?.[index];
    if (!result.data || !parcelle) return [];
    return result.data.map((culture) => ({ ...culture, parcelleId: parcelle.id, parcelleNom: parcelle.nom }));
  });

  return {
    data: cultures as CultureAvecParcelle[],
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    refetch: () => Promise.all(results.map((result) => result.refetch())),
  };
}

/** Pages de 200 (plafond serveur) ; au-delà de 10 pages, la liste est tronquée et le dit. */
const LIMITE_PAGE_CULTURES = 200;
const PAGES_MAX_CULTURES = 10;

/**
 * Toutes les cultures du compte en une source (`GET /cultures`, paginé) au lieu
 * d'une requête par parcelle (N+1 de la V1). Même cache hors ligne par compte,
 * même fusion des saisies en file. Clé sous `['cultures']` : invalidée par
 * toutes les mutations de culture et de parcelle.
 */
export function useCulturesDuCompte() {
  return useQuery({
    queryKey: queryKeys.cultures({ compte: true }),
    queryFn: async (): Promise<Paginated<Culture>> => {
      const serveur = await accountCachedQuery('cultures-compte', null, async () => {
        const premiere = await culturesApi.list({ page: 1, limit: LIMITE_PAGE_CULTURES });
        const pages = Math.min(premiere.totalPages ?? 1, PAGES_MAX_CULTURES);
        const suivantes = await Promise.all(
          Array.from({ length: Math.max(0, pages - 1) }, (_, index) =>
            culturesApi.list({ page: index + 2, limit: LIMITE_PAGE_CULTURES }),
          ),
        );
        return {
          items: [premiere, ...suivantes].flatMap((page) => page.items),
          total: premiere.total,
        };
      });
      const items = await mergeCultureList(serveur.items);
      return {
        items,
        total: Math.max(serveur.total, items.length),
        page: 1,
        limit: items.length,
        totalPages: 1,
      };
    },
    placeholderData: (previous) => previous,
  });
}

/** Tracé d'une culture (cockpit) : une requête, en cache hors ligne par compte. */
export function usePointsGPSCulture(parcelleId?: string, cultureId?: string) {
  return useQuery({
    queryKey: ['points-culture', cultureId ?? ''] as const,
    queryFn: () =>
      accountCachedQuery('points-culture', cultureId, () =>
        culturesApi.pointsGPS(parcelleId as string, cultureId as string),
      ),
    enabled: Boolean(parcelleId && cultureId),
  });
}
