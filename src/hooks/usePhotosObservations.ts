import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  deletePhotoObservation,
  getObservationById,
  uploadPhotoObservation,
  type PhotoObservation,
} from '@/api/observations';

/**
 * Récupérer les photos d'une observation
 *
 * Les photos sont déjà retournées avec l'observation.
 * On utilise donc getObservationById().
 */
export function usePhotosObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  return useQuery({
    queryKey: [
      'photos-observation',
      parcelleId,
      cultureId,
      observationId,
    ],

    queryFn: async (): Promise<PhotoObservation[]> => {
      const observation =
        await getObservationById(
          parcelleId,
          cultureId,
          observationId,
        );

      return observation.photos ?? [];
    },

    enabled:
      !!parcelleId &&
      !!cultureId &&
      !!observationId,
  });
}

/**
 * Uploader une photo
 */
export function useUploadPhotoObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (uri: string) =>
      uploadPhotoObservation(
        parcelleId,
        cultureId,
        observationId,
        uri,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'photos-observation',
          parcelleId,
          cultureId,
          observationId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          parcelleId,
          cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observation',
          parcelleId,
          cultureId,
          observationId,
        ],
      });
    },
  });
}

/**
 * Supprimer une photo
 */
export function useDeletePhotoObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      deletePhotoObservation(
        parcelleId,
        cultureId,
        observationId,
        photoId,
      ),

    onSuccess: (_, photoId) => {
      queryClient.invalidateQueries({
        queryKey: [
          'photos-observation',
          parcelleId,
          cultureId,
          observationId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          parcelleId,
          cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observation',
          parcelleId,
          cultureId,
          observationId,
        ],
      });

      queryClient.removeQueries({
        queryKey: [
          'photo-observation',
          parcelleId,
          cultureId,
          observationId,
          photoId,
        ],
      });
    },
  });
}