import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { observationsApi } from '@/services';
import type { Observation, ObservationPayload } from '@/types';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useUpdateObservation(
  options?: UseMutationOptions<
    Observation,
    Error,
    { id: string; cultureId: string; body: Partial<ObservationPayload> }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id, body }) => observationsApi.update(id, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useDeleteObservation(
  options?: UseMutationOptions<{ id: string }, Error, { id: string; cultureId: string }>,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id }) => observationsApi.remove(id),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}
