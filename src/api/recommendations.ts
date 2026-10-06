import { api } from './client';

export interface Recommendation {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
  readAt: string | null;
  expiresAt?: string | null;
}

/**
 * Récupérer les recommandations de l'utilisateur connecté
 */
export async function getMyRecommendations(): Promise<Recommendation[]> {
  const response = await api.get<Recommendation[]>(
    '/recommendations/me',
  );

  return response.data;
}

/**
 * Marquer une recommandation comme lue
 */
export async function markRecommendationRead(
  id: string,
): Promise<Recommendation> {
  const response = await api.patch<Recommendation>(
    `/recommendations/${id}/read`,
  );

  return response.data;
}

/**
 * Marquer toutes les recommandations comme lues
 */
export async function markAllRecommendationsRead() {
  const response = await api.patch(
    '/recommendations/read-all',
  );

  return response.data;
}