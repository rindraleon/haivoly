/**
 * Lecture des interventions d’une culture.
 */
import { useQuery } from '@tanstack/react-query';
import { interventionsApi } from '@/services';
import { asItems } from '@/utils/api';
import { queryKeys } from '../queryKeys';

export function useInterventions(cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.interventions(cultureId ?? ''),
    queryFn: () =>
      interventionsApi.listByCulture(cultureId as string, { limit: 200 }).then(asItems),
    enabled: Boolean(cultureId),
  });
}

/** Une intervention par identifiant (`GET /interventions/:id`). */
export function useIntervention(id?: string) {
  return useQuery({
    queryKey: ['intervention', id ?? ''],
    queryFn: () => interventionsApi.get(id as string),
    enabled: Boolean(id),
  });
}
