/**
 * Recommendations sync — Backend → Mobile (polling)
 * Offline-first : stocke localement, affiche même hors connexion
 */
import { api } from '@/api/client';
import { getIsOnline } from '@/hooks/useNetwork';
import { getItem, setItem, StorageKeys } from '@/storage/database';
import type { Recommendation } from '@/features/notifications/types';

export async function fetchRecommendationsFromBackend(userId?: string): Promise<Recommendation[]> {
  const online = await getIsOnline();
  if (!online) {
    return getItem<Recommendation[]>(StorageKeys.RECOMMENDATIONS, []);
  }
  try {
    const res = await api.get('/recommendations/me', { params: { userId } });
    const data: Recommendation[] = (res.data as any).data ?? (res.data as any) ?? [];
    // Merge avec local : garder lu/non-lu local si déjà existant
    const local = await getItem<Recommendation[]>(StorageKeys.RECOMMENDATIONS, []);
    const byId = new Map(local.map((r) => [r.id, r]));
    for (const r of data) {
      if (!byId.has(r.id)) byId.set(r.id, r);
    }
    const merged = Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    await setItem(StorageKeys.RECOMMENDATIONS, merged);
    return merged;
  } catch {
    return getItem<Recommendation[]>(StorageKeys.RECOMMENDATIONS, []);
  }
}

export async function markRecommendationReadLocal(id: string): Promise<void> {
  const recs = await getItem<Recommendation[]>(StorageKeys.RECOMMENDATIONS, []);
  const updated = recs.map((r) => (r.id === id ? { ...r, readAt: new Date().toISOString() } : r));
  await setItem(StorageKeys.RECOMMENDATIONS, updated);
  // fire-and-forget backend
  getIsOnline().then((online) => {
    if (online) api.patch(`/recommendations/${id}/read`).catch(() => {});
  });
}

export function startRecommendationPolling(intervalMs = 30000) {
  let timer: ReturnType<typeof setInterval> | null = null;
  const tick = async () => {
    await fetchRecommendationsFromBackend().catch(() => {});
  };
  tick();
  timer = setInterval(tick, intervalMs);
  return () => {
    if (timer) clearInterval(timer);
  };
}
