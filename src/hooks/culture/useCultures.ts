/**
 * Lecture des cultures.
 */
import { useQueries, useQuery } from '@tanstack/react-query';
import { culturesApi } from '@/services';
import type { Culture } from '@/types';
import { asItems } from '@/utils/api';
import { queryKeys } from '../queryKeys';

export function useCultures(params?: {
  page?: number;
  limit?: number;
  statut?: string;
  parcelleId?: string;
}) {
  return useQuery({
    queryKey: queryKeys.cultures(params),
    queryFn: () => culturesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useCulture(parcelleId?: string, cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.culture(cultureId ?? ''),
    queryFn: () =>
      parcelleId
        ? culturesApi.get(parcelleId, cultureId as string)
        : culturesApi.getById(cultureId as string),
    enabled: Boolean(cultureId),
  });
}

/** Normalise une réponse d'API qui peut être un tableau ou une page. */

/**
 * Cultures d'une parcelle sous forme de **tableau**.
 *
 * Même contrat que le hook historique (`data` = `Culture[]`) : les écrans de
 * liste filtrent, trient et comptent sans se soucier de la pagination.
 */
export function useCulturesDeParcelle(parcelleId?: string) {
  return useQuery({
    queryKey: queryKeys.culturesParcelle(parcelleId ?? ''),
    queryFn: () =>
      culturesApi
        .listByParcelle(parcelleId as string, { limit: 200 })
        .then(asItems),
    enabled: Boolean(parcelleId),
  });
}

/** Culture enrichie de sa parcelle, pour les listes transverses. */
export type CultureAvecParcelle = Culture & {
  parcelleId: string;
  parcelleNom: string;
};

/**
 * Cultures de **toutes** les parcelles fournies.
 *
 * Chaque parcelle garde sa propre entrée de cache (et donc son propre
 * chargement) ; l'agrégat est reconstruit à chaque rendu.
 */
export function useToutesLesCultures(
  parcelles: { id: string; nom: string }[] | undefined,
) {
  const results = useQueries({
    queries: (parcelles ?? []).map((parcelle) => ({
      queryKey: queryKeys.culturesParcelle(parcelle.id),
      queryFn: () =>
        culturesApi.listByParcelle(parcelle.id, { limit: 200 }).then(asItems),
      enabled: Boolean(parcelle.id),
    })),
  });

  const cultures = results.flatMap((result, index) => {
    const parcelle = parcelles?.[index];

    if (!result.data || !parcelle) {
      return [];
    }

    return result.data.map((culture) => ({
      ...culture,
      parcelleId: parcelle.id,
      parcelleNom: parcelle.nom,
    }));
  });

  return {
    data: cultures as CultureAvecParcelle[],
    isLoading: results.some((result) => result.isLoading),
    isError: results.some((result) => result.isError),
    refetch: () => Promise.all(results.map((result) => result.refetch())),
  };
}
