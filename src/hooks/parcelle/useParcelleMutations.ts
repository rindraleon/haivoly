/**
 * Écritures sur les parcelles (création, modification, suppression, délimitation).
 */
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { parcellesApi } from '@/services';
import type { ParcellePayload } from '@/services';
import type { Parcelle } from '@/types';
import { useInvalidateDomain } from '../common/useInvalidateDomain';

export function useCreateParcelle(
  options?: UseMutationOptions<Parcelle, Error, ParcellePayload>,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: (body: ParcellePayload) => parcellesApi.create(body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(data?.id);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useUpdateParcelle(
  options?: UseMutationOptions<
    Parcelle,
    Error,
    { id: string; body: Partial<ParcellePayload> & { statut?: string } }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id, body }) => parcellesApi.update(id, body),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.id);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useDeleteParcelle(
  options?: UseMutationOptions<Parcelle, Error, { id: string; raison: string }>,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id, raison }) => parcellesApi.remove(id, raison),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.id);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}

export function useDelimiterParcelle(
  options?: UseMutationOptions<
    Parcelle,
    Error,
    { id: string; pointsGPS: { latitude: number; longitude: number }[] }
  >,
) {
  const invalidate = useInvalidateDomain();

  return useMutation({
    mutationFn: ({ id, pointsGPS }) => parcellesApi.delimitation(id, pointsGPS),
    ...options,
    onSuccess: async (data, variables, context) => {
      await invalidate.parcelle(variables.id);
      options?.onSuccess?.(data, variables, undefined as never, undefined as never);
    },
  });
}
