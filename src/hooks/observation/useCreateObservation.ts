import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { observationsApi } from '@/services';
import type { Observation } from '@/types';
import { executeQueueableMutation } from '@/services/offline/mutate';
import { localObservation } from '@/services/offline/localEntities';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateObservation(
  options?: UseMutationOptions<Observation, Error, { cultureId: string; body: { description: string; date?: string } }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ cultureId, body }) => executeQueueableMutation({
      actionType: 'CREATE',
      entityType: 'OBSERVATION',
      payload: { cultureId, ...body },
      remote: () => observationsApi.create(cultureId, body),
      local: (action) => localObservation(action),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
