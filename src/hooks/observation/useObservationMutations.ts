import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { observationsApi } from '@/services';
import type { Observation, ObservationPayload } from '@/types';
import { executeQueueableMutation } from '@/services/offline/mutate';
import { localObservation } from '@/services/offline/localEntities';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useUpdateObservation(
  options?: UseMutationOptions<Observation, Error, { id: string; cultureId: string; body: Partial<ObservationPayload> }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, cultureId, body }) => executeQueueableMutation({
      actionType: 'UPDATE',
      entityType: 'OBSERVATION',
      entityId: id,
      payload: { id, cultureId, ...body },
      remote: () => observationsApi.update(id, body),
      local: (action) => ({ id, cultureId, ...body, photos: [], _localOnly: true, _syncStatus: action.status } as Observation),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteObservation(
  options?: UseMutationOptions<{ id: string }, Error, { id: string; cultureId: string }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, cultureId }) => executeQueueableMutation({
      actionType: 'DELETE',
      entityType: 'OBSERVATION',
      entityId: id,
      payload: { id, cultureId },
      remote: () => observationsApi.remove(id),
      local: () => ({ id }),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
