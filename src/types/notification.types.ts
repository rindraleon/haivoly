import type { Recommendation as RecommendationApi } from '@/types';

export type RecommendationType = RecommendationApi['type'];
export type Priority = RecommendationApi['priority'];

/**
 * Recommandation affichée dans l'application.
 *
 * Même contrat que la réponse de l'API (`GET /recommendations/me`) : le type est
 * dérivé de `src/types/domain.ts` pour qu'un champ ajouté côté backend ne
 * puisse pas désynchroniser le mobile.
 */
export type Recommendation = RecommendationApi;

export interface NotificationState {
  unreadCount: number;
  recommendations: Recommendation[];
}
