import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { interventionsApi } from '@/services';
import type { InterventionPayload } from '@/services';
import type { Intervention } from '@/types';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateIntervention(
  options?: UseMutationOptions<
    Intervention,
    Error,
    { cultureId: string; body: InterventionPayload }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ cultureId, body }) => interventionsApi.create(cultureId, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useUpdateIntervention(
  options?: UseMutationOptions<
    Intervention,
    Error,
    { id: string; cultureId: string; body: Partial<InterventionPayload> }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id, body }) => interventionsApi.update(id, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useDeleteIntervention(
  options?: UseMutationOptions<{ id: string }, Error, { id: string; cultureId: string }>,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id }) => interventionsApi.remove(id),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}
