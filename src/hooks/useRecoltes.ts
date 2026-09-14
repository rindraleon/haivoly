import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createRecolte,
  getRecolte,
  uploadPhotoRecolte,
  getPhotosRecolte,
  updatePhotoRecolte,
  deletePhotoRecolte,
  type CreateRecolteDto,
} from '../api/recoltes';

/**
 * Récupérer la récolte d'une culture
 */
export function useRecolte(
  cultureId: string,
) {
  return useQuery({
    queryKey: [
      'recolte',
      cultureId,
    ],

    queryFn: () =>
      getRecolte(cultureId),

    enabled: !!cultureId,

    retry: false,
  });
}

/**
 * Créer une récolte
 */
export function useCreateRecolte() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      cultureId,
      data,
    }: {
      cultureId: string;
      data: CreateRecolteDto;
    }) =>
      createRecolte(
        cultureId,
        data,
      ),

    onSuccess: (_data, variables) => {
      // Actualiser la récolte
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.cultureId,
        ],
      });

      // Actualiser les cultures
      queryClient.invalidateQueries({
        queryKey: ['cultures'],
      });

      // Actualiser le détail de la culture
      queryClient.invalidateQueries({
        queryKey: [
          'culture',
          variables.cultureId,
        ],
      });
    },
  });
}

/**
 * Uploader une photo de récolte
 */
export function useUploadPhotoRecolte() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      recolteId,
      uri,
    }: {
      recolteId: string;
      uri: string;
    }) =>
      uploadPhotoRecolte(
        recolteId,
        uri,
      ),

    onSuccess: (_data, variables) => {
      // Actualiser les informations de la récolte
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.recolteId,
        ],
      });

      // Actualiser les photos
      queryClient.invalidateQueries({
        queryKey: [
          'photos-recolte',
          variables.recolteId,
        ],
      });
    },
  });
}

/**
 * Récupérer les photos d'une récolte
 */
export function usePhotosRecolte(
  recolteId: string,
) {
  return useQuery({
    queryKey: [
      'photos-recolte',
      recolteId,
    ],

    queryFn: () =>
      getPhotosRecolte(
        recolteId,
      ),

    enabled: !!recolteId,

    retry: false,
  });
}

/**
 * Modifier une photo de récolte
 */
export function useUpdatePhotoRecolte() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      recolteId,
      photoId,
      data,
    }: {
      recolteId: string;
      photoId: string;
      data: {
        url: string;
      };
    }) =>
      updatePhotoRecolte(
        recolteId,
        photoId,
        data,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.recolteId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'photos-recolte',
          variables.recolteId,
        ],
      });
    },
  });
}

/**
 * Supprimer une photo de récolte
 */
export function useDeletePhotoRecolte() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      recolteId,
      photoId,
    }: {
      recolteId: string;
      photoId: string;
    }) =>
      deletePhotoRecolte(
        recolteId,
        photoId,
      ),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.recolteId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'photos-recolte',
          variables.recolteId,
        ],
      });
    },
  });
}