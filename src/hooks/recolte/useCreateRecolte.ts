/**
 * Création d’une récolte : le serveur bascule la culture en `RECOLTEE`.
 */
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { recoltesApi } from '@/services';
import type { RecoltePayload } from '@/services';
import type { Recolte } from '@/types';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateRecolte(
  options?: UseMutationOptions<
    Recolte,
    Error,
    { cultureId: string; body: RecoltePayload }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ cultureId, body }) => recoltesApi.create(cultureId, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}
