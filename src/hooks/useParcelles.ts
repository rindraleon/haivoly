import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createParcelle,
  getParcelles,
  getParcelleById,
  updateParcelle,
  deleteParcelle,
} from '@/api/parcelles';

export function useParcelles() {
  return useQuery({
    queryKey: ['parcelles'],
    queryFn: getParcelles,
  });
}

// ==========================================
// RECUPERER UNE PARCELLE PAR ID
// ==========================================

export function useParcelle(id: string) {
  return useQuery({
    queryKey: ['parcelle', id],
    queryFn: () => getParcelleById(id),
    enabled: !!id,
  });
}

// ==========================================
// CREER UNE PARCELLE
// ==========================================

export function useCreateParcelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createParcelle,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['parcelles'],
      });
    },
  });
}

// ==========================================
// MODIFIER UNE PARCELLE
// ==========================================

export function useUpdateParcelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
  nom?: string;
  description?: string;
  superficie?: number;
  typeSol?: string;
  statut?: 'ACTIVE' | 'ABANDONNEE' | 'ARCHIVEE';
};
    }) => updateParcelle(id, data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['parcelles'],
      });
    },
  });
}

// ==========================================
// SUPPRIMER UNE PARCELLE
// ==========================================

export function useDeleteParcelle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      raison,
    }: {
      id: string;
      raison: string;
    }) => deleteParcelle(id, { raison }),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ['parcelles'],
      });
    },
  });
}

