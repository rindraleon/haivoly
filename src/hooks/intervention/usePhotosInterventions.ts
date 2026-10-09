import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { interventionPhotosApi } from '@/services';
import type { FichierPhoto } from '@/types';
import { queryKeys } from '../queryKeys';

export function usePhotosIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  return useQuery({
    queryKey: queryKeys.photosIntervention(parcelleId, cultureId, interventionId),
    queryFn: () => interventionPhotosApi.list(parcelleId, cultureId, interventionId),
    enabled: Boolean(parcelleId && cultureId && interventionId),
  });
}

export function useUploadPhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fichier: FichierPhoto) =>
      interventionPhotosApi.upload(
        parcelleId,
        cultureId,
        interventionId,
        fichier,
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photosIntervention(parcelleId, cultureId, interventionId),
      });
    },
  });
}

export function useDeletePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      interventionPhotosApi.remove(parcelleId, cultureId, interventionId, photoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.photosIntervention(parcelleId, cultureId, interventionId),
      });
    },
  });
}
