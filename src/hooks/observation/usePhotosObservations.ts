/**
 * Photos d'une observation : lecture, téléversement et suppression.
 *
 * Les mutations invalident la clé de liste, ce qui rafraîchit la carte
 * d'observation sans rechargement manuel.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { observationPhotosApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function usePhotosObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  return useQuery({
    queryKey: queryKeys.photosObservation(parcelleId, cultureId, observationId),
    queryFn: () => observationPhotosApi.list(parcelleId, cultureId, observationId),
    enabled: Boolean(parcelleId && cultureId && observationId),
  });
}

export function useUploadPhotoObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uri: string) => observationPhotosApi.upload(parcelleId, cultureId, observationId, uri),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photosObservation(parcelleId, cultureId, observationId),
      });
    },
  });
}

export function useDeletePhotoObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      observationPhotosApi.remove(parcelleId, cultureId, observationId, photoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photosObservation(parcelleId, cultureId, observationId),
      });
    },
  });
}
