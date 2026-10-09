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
