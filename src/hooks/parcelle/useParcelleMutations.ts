import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { parcellesApi } from '@/services';
import type { ParcellePayload } from '@/services';
import type { Parcelle } from '@/types';
import { executeQueueableMutation } from '@/services/offline/mutate';
import { localParcelle } from '@/services/offline/localEntities';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateParcelle(options?: UseMutationOptions<Parcelle, Error, ParcellePayload>) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: (body: ParcellePayload) => executeQueueableMutation({
      actionType: 'CREATE',
      entityType: 'PARCELLE',
      payload: body as Record<string, unknown>,
      remote: () => parcellesApi.create(body),
      local: (action, accountId) => localParcelle(action, accountId),
    }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(data?.id);
      options?.onSuccess?.(data, variables, context, undefined as never);
    },
  });
}

export function useUpdateParcelle(
  options?: UseMutationOptions<Parcelle, Error, { id: string; body: Partial<ParcellePayload> & { statut?: string } }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, body }) => executeQueueableMutation({
      actionType: 'UPDATE',
      entityType: 'PARCELLE',
      entityId: id,
      payload: { id, ...body },
      remote: () => parcellesApi.update(id, body),
      local: (action) => ({
        id,
        ...body,
        _localOnly: true,
        _syncStatus: action.status,
      } as Parcelle),
    }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.id);
      options?.onSuccess?.(data, variables, context, undefined as never);
    },
  });
}

export function useDeleteParcelle(
  options?: UseMutationOptions<Parcelle, Error, { id: string; raison: string }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, raison }) => executeQueueableMutation({
      actionType: 'DELETE',
      entityType: 'PARCELLE',
      entityId: id,
      payload: { id, raison },
      remote: () => parcellesApi.remove(id, raison),
      local: (action) => ({ id, _localOnly: true, _syncStatus: action.status } as Parcelle),
    }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.id);
      options?.onSuccess?.(data, variables, context, undefined as never);
    },
  });
}

export function useDelimiterParcelle(
  options?: UseMutationOptions<Parcelle, Error, { id: string; pointsGPS: { latitude: number; longitude: number }[] }>,
) {
  const invalidate = useInvalidateDomain();
  return useMutation({
    mutationFn: ({ id, pointsGPS }) => executeQueueableMutation({
      actionType: 'UPDATE',
      entityType: 'POINT_GPS',
      entityId: id,
      payload: { parcelleId: id, pointsGPS },
      remote: () => parcellesApi.delimitation(id, pointsGPS),
      local: (action) => ({ id, pointsGPS, _localOnly: true, _syncStatus: action.status } as Parcelle),
    }),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.id);
      options?.onSuccess?.(data, variables, context, undefined as never);
    },
  });
}
