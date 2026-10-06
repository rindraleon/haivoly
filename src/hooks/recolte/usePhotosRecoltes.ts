/**
 * Photos d'une récolte : lecture, téléversement, modification et suppression.
 *
 * Le serveur n'accepte une photo que si la culture est `RECOLTEE` : une erreur
 * explicite remonte donc jusqu'à l'écran (message du serveur).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { recoltePhotosApi } from '@/services';
import type { PhotoPayload } from '@/types';
import { queryKeys } from '../queryKeys';

export function usePhotosRecolte(recolteId: string) {
  return useQuery({
    queryKey: queryKeys.photosRecolte(recolteId),
    queryFn: () => recoltePhotosApi.list(recolteId),
    enabled: Boolean(recolteId),
  });
}

export function useUploadPhotoRecolte(recolteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uri: string) => recoltePhotosApi.upload(recolteId, uri),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.photosRecolte(recolteId) });
    },
  });
}

export function useUpdatePhotoRecolte(recolteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ photoId, data }: { photoId: string; data: PhotoPayload }) =>
      recoltePhotosApi.update(recolteId, photoId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.photosRecolte(recolteId) });
    },
  });
}

export function useDeletePhotoRecolte(recolteId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) => recoltePhotosApi.remove(recolteId, photoId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.photosRecolte(recolteId) });
    },
  });
}
