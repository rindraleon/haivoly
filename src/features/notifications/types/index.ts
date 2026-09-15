export type RecommendationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface Recommendation {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: RecommendationType;
  priority: Priority;
  readAt?: string | null;
  expiresAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown> | null;
}

export interface NotificationState {
  unreadCount: number;
  recommendations: Recommendation[];
}
