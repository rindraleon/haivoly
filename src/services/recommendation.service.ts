import { http } from '@/services/http';
import type { Recommendation } from '@/types';

export const recommendationsApi = {
  listMine: () => http.get<Recommendation[]>('/recommendations/me'),
  markRead: (id: string) => http.patch<Recommendation>(`/recommendations/${id}/read`, {}),
  markAllRead: () =>
    http.patch<{ updated: number }>('/recommendations/read-all', {}),
};
