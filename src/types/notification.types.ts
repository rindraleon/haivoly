import type { Recommendation as RecommendationApi } from '@/types';

export type RecommendationType = RecommendationApi['type'];
export type Priority = RecommendationApi['priority'];

export type Recommendation = RecommendationApi;

export interface NotificationState {
  unreadCount: number;
  recommendations: Recommendation[];
}
