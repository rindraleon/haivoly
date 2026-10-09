import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { observationPhotosApi } from '@/services';
import type { FichierPhoto } from '@/types';
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
    // Même contrat que les photos d'intervention : fichier déjà compressé.
    mutationFn: (fichier: FichierPhoto) =>
      observationPhotosApi.upload(
        parcelleId,
        cultureId,
        observationId,
        fichier,
      ),
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
