import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  getPhotosRecolte,
  getPhotoRecolte,
  uploadPhotoRecolte,
  updatePhotoRecolte,
  deletePhotoRecolte,
  type PhotoRecolte,
} from '../api/recoltes';

// =========================
// RÉCUPÉRER LES PHOTOS
// =========================

export function usePhotosRecoltes(
  recolteId: string,
) {
  return useQuery<PhotoRecolte[]>({
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

// =========================
// RÉCUPÉRER UNE PHOTO
// =========================

export function usePhotoRecolte(
  recolteId: string,
  photoId: string,
) {
  return useQuery<PhotoRecolte>({
    queryKey: [
      'photo-recolte',
      recolteId,
      photoId,
    ],

    queryFn: () =>
      getPhotoRecolte(
        recolteId,
        photoId,
      ),

    enabled:
      !!recolteId &&
      !!photoId,

    retry: false,
  });
}

// =========================
// UPLOADER UNE PHOTO
// =========================

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
      // Actualiser la liste des photos
      queryClient.invalidateQueries({
        queryKey: [
          'photos-recolte',
          variables.recolteId,
        ],
      });

      // Actualiser la récolte
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.recolteId,
        ],
      });
    },
  });
}

// =========================
// MODIFIER UNE PHOTO
// =========================

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
      // Actualiser la liste
      queryClient.invalidateQueries({
        queryKey: [
          'photos-recolte',
          variables.recolteId,
        ],
      });

      // Actualiser la photo
      queryClient.invalidateQueries({
        queryKey: [
          'photo-recolte',
          variables.recolteId,
          variables.photoId,
        ],
      });

      // Actualiser la récolte
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.recolteId,
        ],
      });
    },
  });
}

// =========================
// SUPPRIMER UNE PHOTO
// =========================

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
      // Actualiser la liste des photos
      queryClient.invalidateQueries({
        queryKey: [
          'photos-recolte',
          variables.recolteId,
        ],
      });

      // Actualiser la récolte
      queryClient.invalidateQueries({
        queryKey: [
          'recolte',
          variables.recolteId,
        ],
      });
    },
  });
}