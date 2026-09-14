import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createPhotoIntervention,
  deletePhotoIntervention,
  getPhotoInterventionById,
  getPhotosIntervention,
  updatePhotoIntervention,
  uploadPhotoIntervention,
  type CreatePhotoInterventionData,
  type UpdatePhotoInterventionData,
} from '@/api/photosInterventions';

/**
 * Récupérer toutes les photos d'une intervention
 */
export function usePhotosIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  return useQuery({
    queryKey: [
      'photos-intervention',
      parcelleId,
      cultureId,
      interventionId,
    ],
    queryFn: () =>
      getPhotosIntervention(
        parcelleId,
        cultureId,
        interventionId,
      ),
    enabled:
      !!parcelleId &&
      !!cultureId &&
      !!interventionId,
  });
}

/**
 * Récupérer une photo précise
 */
export function usePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
  photoId: string,
) {
  return useQuery({
    queryKey: [
      'photo-intervention',
      parcelleId,
      cultureId,
      interventionId,
      photoId,
    ],
    queryFn: () =>
      getPhotoInterventionById(
        parcelleId,
        cultureId,
        interventionId,
        photoId,
      ),
    enabled:
      !!parcelleId &&
      !!cultureId &&
      !!interventionId &&
      !!photoId,
  });
}

/**
 * Ajouter une photo
 */
export function useCreatePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePhotoInterventionData) =>
      createPhotoIntervention(
        parcelleId,
        cultureId,
        interventionId,
        data,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'photos-intervention',
          parcelleId,
          cultureId,
          interventionId,
        ],
      });
    },
  });
}

/**
 * Modifier une photo
 */
export function useUpdatePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      photoId,
      data,
    }: {
      photoId: string;
      data: UpdatePhotoInterventionData;
    }) =>
      updatePhotoIntervention(
        parcelleId,
        cultureId,
        interventionId,
        photoId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'photos-intervention',
          parcelleId,
          cultureId,
          interventionId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'photo-intervention',
          parcelleId,
          cultureId,
          interventionId,
          variables.photoId,
        ],
      });
    },
  });
}

/**
 * Supprimer une photo
 */
export function useDeletePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (photoId: string) =>
      deletePhotoIntervention(
        parcelleId,
        cultureId,
        interventionId,
        photoId,
      ),

    onSuccess: (_, photoId) => {
      queryClient.invalidateQueries({
        queryKey: [
          'photos-intervention',
          parcelleId,
          cultureId,
          interventionId,
        ],
      });

      queryClient.removeQueries({
        queryKey: [
          'photo-intervention',
          parcelleId,
          cultureId,
          interventionId,
          photoId,
        ],
      });
    },
  });
}
/**
 * Uploader une photo
 */
export function useUploadPhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (uri: string) =>
      uploadPhotoIntervention(
        parcelleId,
        cultureId,
        interventionId,
        uri,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [
          'photos-intervention',
          parcelleId,
          cultureId,
          interventionId,
        ],
      });
    },
  });
}