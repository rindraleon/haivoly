import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createCulture,
  deleteCulture,
  getCultureById,
  getCultures,
  PointGPSCulture,
  savePointsGPSCulture,
  getPointsGPSCulture,
  updateCulture,
  CreateCultureData,
  DeleteCultureData,
  UpdateCultureData,
} from '@/api/cultures';

// ==============================
// RECUPERER LES CULTURES
// ==============================

export function useCultures(parcelleId: string) {
  return useQuery({
    queryKey: ['cultures', parcelleId],

    queryFn: () => getCultures(parcelleId),

    enabled: !!parcelleId,
  });
}

// ==============================
// RECUPERER UNE CULTURE
// ==============================

export function useCulture(
  parcelleId: string,
  cultureId: string,
) {
  return useQuery({
    queryKey: ['culture', parcelleId, cultureId],

    queryFn: () =>
      getCultureById(parcelleId, cultureId),

    enabled: !!parcelleId && !!cultureId,
  });
}

// ==============================
// CREER UNE CULTURE
// ==============================

export function useCreateCulture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      data,
    }: {
      parcelleId: string;
      data: CreateCultureData;
    }) => createCulture(parcelleId, data),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['cultures', variables.parcelleId],
      });
    },
  });
}

// ==============================
// MODIFIER UNE CULTURE
// ==============================

export function useUpdateCulture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      data,
    }: {
      parcelleId: string;
      cultureId: string;
      data: UpdateCultureData;
    }) =>
      updateCulture(
        parcelleId,
        cultureId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'cultures',
          variables.parcelleId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'culture',
          variables.parcelleId,
          variables.cultureId,
        ],
      });
    },
  });
}

// ==============================
// SUPPRIMER UNE CULTURE
// ==============================

export function useDeleteCulture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      data,
    }: {
      parcelleId: string;
      cultureId: string;
      data?: DeleteCultureData;
    }) =>
      deleteCulture(
        parcelleId,
        cultureId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'cultures',
          variables.parcelleId,
        ],
      });
    },
  });
}

export function usePointsGPSCulture(
  parcelleId: string,
  cultureId: string,
) {
  return useQuery({
    queryKey: [
      'pointsGPSCulture',
      parcelleId,
      cultureId,
    ],
    queryFn: () =>
      getPointsGPSCulture(
        parcelleId,
        cultureId,
      ),
    enabled:
      !!parcelleId &&
      !!cultureId,
  });
}

export function useSavePointsGPSCulture() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      points,
    }: {
      parcelleId: string;
      cultureId: string;
      points: PointGPSCulture[];
    }) =>
      savePointsGPSCulture(
        parcelleId,
        cultureId,
        points,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'pointsGPSCulture',
          variables.parcelleId,
          variables.cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'culture',
          variables.parcelleId,
          variables.cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'cultures',
          variables.parcelleId,
        ],
      });
    },
  });
}