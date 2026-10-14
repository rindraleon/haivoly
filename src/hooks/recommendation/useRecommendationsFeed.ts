import { useCallback, useEffect, useState } from 'react';

import { recommendationsApi } from '@/services';
import { useNetworkStatus } from '@/hooks/common/useNetwork';
import {
  fetchRecommendationsFromBackend,
  markRecommendationReadLocal,
} from '@/services/offline/recommendationSync';
import { getActiveAccountId } from '@/storage/authStorage';
import { accountStorageKey, getItem, setItem, StorageKeys } from '@/storage/database';
import type { Recommendation } from '@/types/notification.types';

/** Lecture locale, sans exposer les recommandations d'un autre compte. */
async function lireRecommandations(): Promise<Recommendation[]> {
  const accountId = await getActiveAccountId();
  if (!accountId) return [];
  return getItem<Recommendation[]>(accountStorageKey(accountId, StorageKeys.RECOMMENDATIONS), []);
}

/**
 * Flux de recommandations (offline-first) partagé par le tableau de bord et
 * l'écran de notifications : le compteur de non-lues suit la même source.
 */
export function useRecommendationsFeed(intervalMs = 10000) {
  const isOnline = useNetworkStatus();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const relire = useCallback(async () => {
    const data = await lireRecommandations();
    setRecommendations(data);
    return data;
  }, []);

  const refresh = useCallback(async () => {
    if (isOnline) {
      await fetchRecommendationsFromBackend().catch(() => {});
    }
    await relire();
  }, [isOnline, relire]);

  useEffect(() => {
    let actif = true;
    (async () => {
      if (isOnline) await fetchRecommendationsFromBackend().catch(() => {});
      if (!actif) return;
      await relire();
      if (actif) setLoading(false);
    })();
    return () => {
      actif = false;
    };
  }, [isOnline, relire]);

  useEffect(() => {
    const id = setInterval(() => void relire(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, relire]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const markRead = useCallback(
    async (id: string) => {
      setRecommendations((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, readAt: item.readAt ?? new Date().toISOString() } : item,
        ),
      );
      try {
        await markRecommendationReadLocal(id);
      } catch (error) {
        await relire();
        throw error;
      }
    },
    [relire],
  );

  const markAllRead = useCallback(async () => {
    await recommendationsApi.markAllRead();
    const accountId = await getActiveAccountId();
    if (!accountId) return;
    const readAt = new Date().toISOString();
    const updated = (await lireRecommandations()).map((item) => ({
      ...item,
      readAt: item.readAt ?? readAt,
    }));
    await setItem(accountStorageKey(accountId, StorageKeys.RECOMMENDATIONS), updated);
    setRecommendations(updated);
  }, []);

  const unreadCount = recommendations.filter((item) => !item.readAt).length;

  return {
    recommendations,
    unreadCount,
    loading,
    refreshing,
    refresh: onRefresh,
    reload: relire,
    markRead,
    markAllRead,
  };
}
