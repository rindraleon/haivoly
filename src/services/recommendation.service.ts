/**
 * Recommandations affichées par l'application.
 *
 * Aucun écran n'appelle `axios` directement : tout passe par `http` puis par
 * ces fonctions. Les identifiants (`parcelleId`, `cultureId`…) sont envoyés
 * tels quels ; c'est le serveur qui valide la propriété et les règles métier.
 */
import { http } from '@/services/http';
import type { Recommendation } from '@/types';

export const recommendationsApi = {
  listMine: () => http.get<Recommendation[]>('/recommendations/me'),
  markRead: (id: string) => http.patch<Recommendation>(`/recommendations/${id}/read`, {}),
  markAllRead: () =>
    http.patch<{ updated: number }>('/recommendations/read-all', {}),
};
