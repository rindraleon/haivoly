import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createObservation,
  deleteObservation,
  getObservationById,
  getObservations,
  updateObservation,
  uploadPhotoObservation,
  deletePhotoObservation,
  CreateObservationData,
  UpdateObservationData,
} from '@/api/observations';

// ==============================
// RECUPERER LES OBSERVATIONS
// ==============================

export function useObservations(
  parcelleId: string,
  cultureId: string,
) {
  return useQuery({
    queryKey: [
      'observations',
      parcelleId,
      cultureId,
    ],

    queryFn: () =>
      getObservations(
        parcelleId,
        cultureId,
      ),

    enabled:
      !!parcelleId &&
      !!cultureId,
  });
}

// ==============================
// RECUPERER UNE OBSERVATION
// ==============================

export function useObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
) {
  return useQuery({
    queryKey: [
      'observation',
      parcelleId,
      cultureId,
      observationId,
    ],

    queryFn: () =>
      getObservationById(
        parcelleId,
        cultureId,
        observationId,
      ),

    enabled:
      !!parcelleId &&
      !!cultureId &&
      !!observationId,
  });
}

// ==============================
// CREER UNE OBSERVATION
// ==============================

export function useCreateObservation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      data,
    }: {
      parcelleId: string;
      cultureId: string;
      data: CreateObservationData;
    }) =>
      createObservation(
        parcelleId,
        cultureId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          variables.parcelleId,
          variables.cultureId,
        ],
      });
    },
  });
}

// ==============================
// MODIFIER UNE OBSERVATION
// ==============================

export function useUpdateObservation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      observationId,
      data,
    }: {
      parcelleId: string;
      cultureId: string;
      observationId: string;
      data: UpdateObservationData;
    }) =>
      updateObservation(
        parcelleId,
        cultureId,
        observationId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          variables.parcelleId,
          variables.cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observation',
          variables.parcelleId,
          variables.cultureId,
          variables.observationId,
        ],
      });
    },
  });
}

// ==============================
// SUPPRIMER UNE OBSERVATION
// ==============================

export function useDeleteObservation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      observationId,
    }: {
      parcelleId: string;
      cultureId: string;
      observationId: string;
    }) =>
      deleteObservation(
        parcelleId,
        cultureId,
        observationId,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          variables.parcelleId,
          variables.cultureId,
        ],
      });
    },
  });
}

// ==============================
// AJOUTER UNE PHOTO
// ==============================

export function useUploadPhotoObservation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      observationId,
      uri,
    }: {
      parcelleId: string;
      cultureId: string;
      observationId: string;
      uri: string;
    }) =>
      uploadPhotoObservation(
        parcelleId,
        cultureId,
        observationId,
        uri,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          variables.parcelleId,
          variables.cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observation',
          variables.parcelleId,
          variables.cultureId,
          variables.observationId,
        ],
      });
    },
  });
}

// ==============================
// SUPPRIMER UNE PHOTO
// ==============================

export function useDeletePhotoObservation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      observationId,
      photoId,
    }: {
      parcelleId: string;
      cultureId: string;
      observationId: string;
      photoId: string;
    }) =>
      deletePhotoObservation(
        parcelleId,
        cultureId,
        observationId,
        photoId,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'observations',
          variables.parcelleId,
          variables.cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'observation',
          variables.parcelleId,
          variables.cultureId,
          variables.observationId,
        ],
      });
    },
  });
}