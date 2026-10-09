import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { culturesApi } from '@/services';
import type { CulturePayload } from '@/services';
import type { Culture } from '@/types';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateCulture(
  options?: UseMutationOptions<
    Culture,
    Error,
    { parcelleId: string; body: CulturePayload }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ parcelleId, body }) => culturesApi.create(parcelleId, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.parcelleId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useUpdateCulture(
  options?: UseMutationOptions<
    Culture,
    Error,
    { parcelleId: string; cultureId: string; body: Partial<CulturePayload> }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ parcelleId, cultureId, body }) =>
      culturesApi.update(parcelleId, cultureId, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.culture(variables.cultureId);
      await invalidate.parcelle(variables.parcelleId);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}
