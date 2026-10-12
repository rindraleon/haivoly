import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/services';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (reponse) => {
      // Une nouvelle connexion peut être un autre utilisateur sur le même
      // appareil; aucune donnée en mémoire ne doit traverser ce changement.
      queryClient.clear();
      queryClient.setQueryData(['auth', 'me'], reponse.utilisateur);
    },
  });
}
