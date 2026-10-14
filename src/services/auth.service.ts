import { http } from '@/services/http';
import type { LangueCompte, Role, Utilisateur } from '@/types';

export interface AuthResponse {
  access_token: string;
  expires_at: string;
  utilisateur: Utilisateur;
}

export interface RegisterResponse extends Utilisateur {
  message: string;
  emailEnvoye?: boolean;
}

/** Réponse de `POST /auth/verifier-jeton-initialisation`. */
export interface VerificationJetonInitialisation {
  valide: boolean;
  username?: string;
  expireLe?: string;
}

export const authApi = {
  register: (body: {
    nom: string;
    prenom?: string;
    email: string;
    password: string;
    telephone?: string;
    username?: string;
    langue?: LangueCompte;
    role?: Role;
  }) => http.post<RegisterResponse>('/auth/register', body),
  resendVerification: (email: string) =>
    http.post<{ message: string }>('/auth/resend-verification', { email }),
  verifyEmail: (token: string) =>
    http.post<{ message: string }>('/auth/verify-email', { token }),
  login: (body: { identifier?: string; email?: string; password: string }) =>
    http.post<AuthResponse>('/auth/login', body),
  me: () => http.get<Utilisateur>('/auth/me'),
  logout: () => http.post<{ message: string }>('/auth/logout', {}),
  forgotPassword: (email: string) =>
    http.post<{ message: string }>('/auth/forgot-password', {
      email,
    }),
  /** Le serveur attend `newPassword` (et `confirmPassword` à l'identique). */
  resetPassword: (body: { token: string; newPassword: string; confirmPassword: string }) =>
    http.post<{ message: string }>('/auth/reset-password', body),
  verifierJetonInitialisation: (token: string) =>
    http.post<VerificationJetonInitialisation>('/auth/verifier-jeton-initialisation', { token }),
  definirMotDePasse: (body: {
    token: string;
    newPassword: string;
    confirmPassword: string;
  }) => http.post<{ message: string; expiresIn: number }>('/auth/initialiser-mot-de-passe', body),
  updateProfile: (
    body: Partial<Pick<Utilisateur, 'nom' | 'prenom' | 'telephone' | 'username' | 'langue'>>,
  ) => http.patch<Utilisateur>('/users/me', body),
};
