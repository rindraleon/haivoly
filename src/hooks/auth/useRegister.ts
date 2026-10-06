/** Inscription d'un nouvel utilisateur. */
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/services';

export function useRegister() {
  return useMutation({ mutationFn: authApi.register });
}
