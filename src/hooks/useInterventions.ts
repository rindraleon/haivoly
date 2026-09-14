import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createIntervention,
  deleteIntervention,
  getInterventionById,
  getInterventions,
  updateIntervention,
  CreateInterventionData,
  UpdateInterventionData,
} from '@/api/interventions';

// ==============================
// RECUPERER LES INTERVENTIONS
// ==============================

export function useInterventions(
  parcelleId: string,
  cultureId: string,
) {
  return useQuery({
    queryKey: [
      'interventions',
      parcelleId,
      cultureId,
    ],

    queryFn: () =>
      getInterventions(
        parcelleId,
        cultureId,
      ),

    enabled:
      !!parcelleId &&
      !!cultureId,
  });
}

// ==============================
// RECUPERER UNE INTERVENTION
// ==============================

export function useIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
) {
  return useQuery({
    queryKey: [
      'intervention',
      parcelleId,
      cultureId,
      interventionId,
    ],

    queryFn: () =>
      getInterventionById(
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

// ==============================
// CREER UNE INTERVENTION
// ==============================

export function useCreateIntervention() {
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
      data: CreateInterventionData;
    }) =>
      createIntervention(
        parcelleId,
        cultureId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'interventions',
          variables.parcelleId,
          variables.cultureId,
        ],
      });
    },
  });
}

// ==============================
// MODIFIER UNE INTERVENTION
// ==============================

export function useUpdateIntervention() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      interventionId,
      data,
    }: {
      parcelleId: string;
      cultureId: string;
      interventionId: string;
      data: UpdateInterventionData;
    }) =>
      updateIntervention(
        parcelleId,
        cultureId,
        interventionId,
        data,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'interventions',
          variables.parcelleId,
          variables.cultureId,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: [
          'intervention',
          variables.parcelleId,
          variables.cultureId,
          variables.interventionId,
        ],
      });
    },
  });
}

// ==============================
// SUPPRIMER UNE INTERVENTION
// ==============================

export function useDeleteIntervention() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      parcelleId,
      cultureId,
      interventionId,
    }: {
      parcelleId: string;
      cultureId: string;
      interventionId: string;
    }) =>
      deleteIntervention(
        parcelleId,
        cultureId,
        interventionId,
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [
          'interventions',
          variables.parcelleId,
          variables.cultureId,
        ],
      });
    },
  });
}