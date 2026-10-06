/**
 * Création d’une observation.
 */
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { observationsApi } from '@/services';
import type { Observation } from '@/types';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateObservation(
  options?: UseMutationOptions<
    Observation,
    Error,
    { cultureId: string; body: { description: string; date?: string } }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ cultureId, body }) => observationsApi.create(cultureId, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

/**
 * Création d'une récolte.
 *
 * Point clé : le mobile **n'envoie aucun statut**. Le serveur crée la récolte
 * et bascule la culture en `RECOLTEE` dans la même transaction. On invalide
 * ensuite la culture pour que l'écran affiche immédiatement le nouveau statut.
 */
