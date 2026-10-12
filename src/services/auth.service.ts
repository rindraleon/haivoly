import { http } from '@/services/http';
import type { Utilisateur } from '@/types';

export interface AuthResponse {
  access_token: string;
  expires_at: string;
  utilisateur: Utilisateur;
}

export interface RegisterResponse extends Utilisateur {
  message: string;
  emailEnvoye?: boolean;
}

export const authApi = {
  register: (body: {
    nom: string;
    prenom?: string;
    email: string;
    password: string;
    telephone?: string;
  }) => http.post<RegisterResponse>('/auth/register', body),
  resendVerification: (email: string) =>
    http.post<{ message: string }>('/auth/resend-verification', { email }),
  verifyEmail: (token: string) =>
    http.post<{ message: string }>('/auth/verify-email', { token }),
  login: (body: { email: string; password: string }) =>
    http.post<AuthResponse>('/auth/login', body),
  me: () => http.get<Utilisateur>('/auth/me'),
  logout: () => http.post<{ message: string }>('/auth/logout', {}),
  forgotPassword: (email: string) =>
    http.post<{ message: string }>('/auth/forgot-password', {
      email,
    }),
  resetPassword: (body: { token: string; password: string; confirmPassword: string }) =>
    http.post<{ message: string }>('/auth/reset-password', body),
  updateProfile: (body: Partial<Pick<Utilisateur, 'nom' | 'prenom' | 'telephone'>>) =>
    http.patch<Utilisateur>('/users/me', body),
};
