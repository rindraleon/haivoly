/** Réinitialisation du mot de passe à partir du jeton reçu. */
import { useMutation } from '@tanstack/react-query';

import { authApi } from '@/services';

export interface ResetPasswordVariables {
  token: string;
  password: string;
  confirmPassword: string;
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (variables: ResetPasswordVariables) => authApi.resetPassword(variables),
  });
}
