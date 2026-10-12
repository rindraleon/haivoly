import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { culturesApi } from '@/services';
import type { CulturePayload } from '@/services';
import type { Culture } from '@/types';
import { executeQueueableMutation } from '@/services/offline/mutate';
import { localCulture } from '@/services/offline/localEntities';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateCulture(
  options?: UseMutationOptions<Culture, Error, { parcelleId: string; body: CulturePayload }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ parcelleId, body }) => executeQueueableMutation({
      actionType: 'CREATE',
      entityType: 'CULTURE',
      payload: { parcelleId, ...body },
      remote: () => culturesApi.create(parcelleId, body),
      local: (action) => localCulture(action),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.parcelle(variables.parcelleId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateCulture(
  options?: UseMutationOptions<Culture, Error, { parcelleId: string; cultureId: string; body: Partial<CulturePayload> }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ parcelleId, cultureId, body }) => executeQueueableMutation({
      actionType: 'UPDATE',
      entityType: 'CULTURE',
      entityId: cultureId,
      payload: { id: cultureId, parcelleId, ...body },
      remote: () => culturesApi.update(parcelleId, cultureId, body),
      local: (action) => ({
        id: cultureId,
        parcelleId,
        ...body,
        _localOnly: true,
        _syncStatus: action.status,
      } as Culture),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      await invalidate.parcelle(variables.parcelleId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
