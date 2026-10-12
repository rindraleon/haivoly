import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { recoltesApi } from '@/services';
import type { RecoltePayload } from '@/services';
import type { Recolte } from '@/types';
import { executeQueueableMutation } from '@/services/offline/mutate';
import { localRecolte } from '@/services/offline/localEntities';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateRecolte(
  options?: UseMutationOptions<Recolte, Error, { cultureId: string; body: RecoltePayload }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ cultureId, body }) => executeQueueableMutation({
      actionType: 'CREATE',
      entityType: 'RECOLTE',
      payload: { cultureId, ...body },
      remote: () => recoltesApi.create(cultureId, body),
      local: (action) => localRecolte(action),
    }),
    ...options,
    onSuccess: async (data, variables, onMutateResult, context) => {
      await invalidate.culture(variables.cultureId);
      options?.onSuccess?.(data, variables, onMutateResult, context);
    },
  });
}
