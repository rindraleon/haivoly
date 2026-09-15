import { api } from './client';

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  password: string;
}

export async function register(data: RegisterData) {
  const response = await api.post('/auth/register', data);
  return response.data;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  role: 'AGRICULTEUR' | 'PROPRIETAIRE';
}

export interface LoginResponse {
  access_token: string;
  utilisateur: Utilisateur;
}

export async function login(data: LoginData): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
}

export async function getProfile(): Promise<Utilisateur> {
  const response = await api.get('/auth/profile');
  return response.data;
}

// ——— Mot de passe oublié ———

export interface ForgotPasswordData {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  _devToken?: string;
  _devResetUrl?: string;
}

export async function forgotPassword(data: ForgotPasswordData): Promise<ForgotPasswordResponse> {
  const response = await api.post<ForgotPasswordResponse>('/auth/forgot-password', data);
  return response.data;
}

export interface ResetPasswordData {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export async function resetPassword(data: ResetPasswordData): Promise<{ message: string }> {
  const response = await api.post<{ message: string }>('/auth/reset-password', data);
  return response.data;
}
