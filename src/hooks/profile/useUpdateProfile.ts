import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/services';
import type { Utilisateur } from '@/types';
import { queryKeys } from '../queryKeys';

export type ProfileUpdate = Partial<
  Pick<Utilisateur, 'nom' | 'prenom' | 'telephone' | 'username' | 'langue'>
>;

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: ProfileUpdate) => authApi.updateProfile(body),
    onSuccess: async (updated) => {
      queryClient.setQueryData<Utilisateur>(queryKeys.me, (current) =>
        current ? { ...current, ...updated } : updated,
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}
