import { useQueries, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useCulturesDuCompte } from '@/hooks';
import { queryKeys } from '@/hooks/queryKeys';
import { ApiError, interventionsApi, observationsApi, recoltesApi } from '@/services';
import { accountCachedQuery, mergeQueuedEntities } from '@/services/offline/accountData';
import { localIntervention, localObservation, localRecolte } from '@/services/offline/localEntities';
import { getLocalActions } from '@/services/offline/queue';
import { getActiveAccountId } from '@/storage/authStorage';
import type { Culture, Intervention, Observation, Recolte } from '@/types';
import { asItems } from '@/utils/api';

export interface DonneesSuivi {
  cultures: Culture[];
  observations: Observation[];
  interventions: Intervention[];
  recoltes: Recolte[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Suivi unifié V2 (lot 4) : une requête par culture et par famille
 * (observations, interventions, récolte), avec la même fusion hors ligne
 * que les écrans d'origine — le fil montre aussi les actions en attente
 * d'envoi. Les clés de requête sont partagées : aucun doublon de cache.
 */
export function useSuiviDuCompte(): DonneesSuivi {
  const cultures = useCulturesDuCompte();
  const culturesVisibles = useMemo(
    () => (cultures.data?.items ?? []).filter((culture) => culture.statut !== 'SUPPRIMEE'),
    [cultures.data],
  );
  const ids = useMemo(() => culturesVisibles.map((culture) => culture.id), [culturesVisibles]);

  const recoltesLocales = useQuery({
    queryKey: ['suivi', 'recoltes-locales'] as const,
    queryFn: async (): Promise<Recolte[]> => {
      const actions = await getLocalActions();
      return actions
        .filter((action) => action.entityType === 'RECOLTE' && action.actionType === 'CREATE')
        .map(localRecolte);
    },
  });

  const requetes = useQueries({
    queries: ids.flatMap((id) => [
      {
        queryKey: queryKeys.observations(id),
        queryFn: async (): Promise<Observation[]> => {
          const serveur = await accountCachedQuery('observations', id, () =>
            observationsApi.listByCulture(id, { limit: 200 }).then(asItems),
          );
          const accountId = await getActiveAccountId();
          if (!accountId) return serveur;
          const actions = await getLocalActions();
          return mergeQueuedEntities(serveur, actions, 'OBSERVATION', localObservation).filter(
            (item) => item.cultureId === id,
          );
        },
      },
      {
        queryKey: queryKeys.interventions(id),
        queryFn: async (): Promise<Intervention[]> => {
          const serveur = await accountCachedQuery('interventions', id, () =>
            interventionsApi.listByCulture(id, { limit: 200 }).then(asItems),
          );
          const accountId = await getActiveAccountId();
          if (!accountId) return serveur;
          const actions = await getLocalActions();
          return mergeQueuedEntities(serveur, actions, 'INTERVENTION', localIntervention).filter(
            (item) => item.cultureId === id,
          );
        },
      },
      {
        queryKey: queryKeys.recolte(id),
        // L'API répond 404 sans récolte : on ne la requête que si le cycle est
        // terminé ou si une récolte est déjà connue — sinon, état vide normal.
        enabled:
          culturesVisibles.find((culture) => culture.id === id)?.statut === 'RECOLTEE' ||
          Boolean(culturesVisibles.find((culture) => culture.id === id)?.recolte),
        queryFn: async (): Promise<Recolte | null> => {
          try {
            return await accountCachedQuery<Recolte | null>('recolte', id, () =>
              recoltesApi.getByCulture(id),
            );
          } catch (erreur) {
            if (erreur instanceof ApiError && erreur.status === 404) return null;
            throw erreur;
          }
        },
      },
    ]),
  });

  const observations = useMemo(
    () => requetes.filter((_, index) => index % 3 === 0).flatMap((requete) => (requete.data as Observation[] | undefined) ?? []),
    [requetes],
  );
  const interventions = useMemo(
    () => requetes.filter((_, index) => index % 3 === 1).flatMap((requete) => (requete.data as Intervention[] | undefined) ?? []),
    [requetes],
  );
  const recoltes = useMemo(
    () => [
      ...requetes
        .filter((_, index) => index % 3 === 2)
        .flatMap((requete) => {
          const recolte = requete.data as Recolte | null | undefined;
          return recolte ? [recolte] : [];
        }),
      ...recoltesLocales.data ?? [],
    ],
    [requetes, recoltesLocales.data],
  );

  const refetch = useCallback(() => {
    void cultures.refetch();
    for (const requete of requetes) void requete.refetch();
    void recoltesLocales.refetch();
  }, [cultures, requetes, recoltesLocales]);

  return {
    cultures: cultures.data?.items ?? [],
    observations,
    interventions,
    recoltes,
    isLoading: cultures.isLoading || requetes.some((requete) => requete.isLoading) || recoltesLocales.isLoading,
    isError: cultures.isError || requetes.some((requete) => requete.isError),
    refetch,
  };
}
