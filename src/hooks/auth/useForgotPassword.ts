/** Demande de réinitialisation de mot de passe. */
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/services';

export function useForgotPassword() {
  return useMutation({ mutationFn: (email: string) => authApi.forgotPassword(email) });
}
