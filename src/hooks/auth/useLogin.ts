/**
 * Connexion : la mutation renvoie `{ access_token, utilisateur }`.
 *
 * Aucun état serveur n'est mis en cache ici : l'écran enregistre le jeton puis
 * laisse `useMe()` alimenter le cache du profil.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { authApi } from '@/services';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (reponse) => {
      queryClient.setQueryData(['auth', 'me'], reponse.utilisateur);
    },
  });
}
