/**
 * Lecture des observations d’une culture.
 */
import { useQuery } from '@tanstack/react-query';
import { observationsApi } from '@/services';
import { asItems } from '@/utils/api';
import { queryKeys } from '../queryKeys';

export function useObservations(cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.observations(cultureId ?? ''),
    queryFn: () =>
      observationsApi.listByCulture(cultureId as string, { limit: 200 }).then(asItems),
    enabled: Boolean(cultureId),
  });
}

/** Une observation par identifiant (`GET /observations/:id`). */
export function useObservation(id?: string) {
  return useQuery({
    queryKey: ['observation', id ?? ''],
    queryFn: () => observationsApi.get(id as string),
    enabled: Boolean(id),
  });
}
