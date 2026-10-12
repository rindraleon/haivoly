import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { interventionsApi } from '@/services';
import type { InterventionPayload } from '@/services';
import type { Intervention } from '@/types';
import { executeQueueableMutation } from '@/services/offline/mutate';
import { localIntervention } from '@/services/offline/localEntities';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateIntervention(
  options?: UseMutationOptions<Intervention, Error, { cultureId: string; body: InterventionPayload }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ cultureId, body }) => executeQueueableMutation({
      actionType: 'CREATE',
      entityType: 'INTERVENTION',
      payload: { cultureId, ...body },
      remote: () => interventionsApi.create(cultureId, body),
      local: (action) => localIntervention(action),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useUpdateIntervention(
  options?: UseMutationOptions<Intervention, Error, { id: string; cultureId: string; body: Partial<InterventionPayload> }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, cultureId, body }) => executeQueueableMutation({
      actionType: 'UPDATE',
      entityType: 'INTERVENTION',
      entityId: id,
      payload: { id, cultureId, ...body },
      remote: () => interventionsApi.update(id, body),
      local: (action) => ({
        id,
        cultureId,
        ...body,
        _localOnly: true,
        _syncStatus: action.status,
      } as Intervention),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}

export function useDeleteIntervention(
  options?: UseMutationOptions<{ id: string }, Error, { id: string; cultureId: string }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, cultureId }) => executeQueueableMutation({
      actionType: 'DELETE',
      entityType: 'INTERVENTION',
      entityId: id,
      payload: { id, cultureId },
      remote: () => interventionsApi.remove(id),
      local: (action) => ({ id, _localOnly: true, _syncStatus: action.status }),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
