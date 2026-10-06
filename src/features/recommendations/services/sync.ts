/**
 * Recommendations sync — Backend → Mobile (polling)
 * Offline-first : stocke localement, affiche même hors connexion
 */

import { api } from '@/api/client';
import { getIsOnline } from '@/hooks/useNetwork';
import {
  getItem,
  setItem,
  StorageKeys,
} from '@/storage/database';
import type { Recommendation } from '@/features/notifications/types';

/**
 * Récupérer les recommandations depuis le backend.
 *
 * Si le téléphone est offline :
 * → retourne uniquement les recommandations locales.
 *
 * Si le téléphone est online :
 * → récupère les recommandations du backend
 * → fusionne avec le stockage local
 * → sauvegarde le résultat localement.
 */
export async function fetchRecommendationsFromBackend(): Promise<
  Recommendation[]
> {
  const online = await getIsOnline();

  // ====================================================
  // OFFLINE
  // ====================================================

  if (!online) {
    return getItem<Recommendation[]>(
      StorageKeys.RECOMMENDATIONS,
      [],
    );
  }

  // ====================================================
  // ONLINE
  // ====================================================

  try {
    const res = await api.get('/recommendations/me');

    const data: Recommendation[] =
      (res.data as any).data ??
      (res.data as any) ??
      [];

    // Récupérer les recommandations déjà présentes
    // sur le téléphone.
    const local = await getItem<Recommendation[]>(
      StorageKeys.RECOMMENDATIONS,
      [],
    );

    const byId = new Map<string, Recommendation>();

    // Ajouter les recommandations locales
    for (const recommendation of local) {
      byId.set(recommendation.id, recommendation);
    }

    // Ajouter / mettre à jour celles du backend
    for (const recommendation of data) {
      const existing = byId.get(recommendation.id);

      if (existing) {
        byId.set(recommendation.id, {
          ...recommendation,

          // Si l'utilisateur a déjà lu localement
          // la recommandation, on conserve cette information.
          readAt:
            existing.readAt ??
            recommendation.readAt ??
            null,
        });
      } else {
        byId.set(recommendation.id, recommendation);
      }
    }

    const merged = Array.from(byId.values()).sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime(),
    );

    await setItem(
      StorageKeys.RECOMMENDATIONS,
      merged,
    );

    return merged;
  } catch {
    // Si le backend est inaccessible,
    // on continue avec les données locales.
    return getItem<Recommendation[]>(
      StorageKeys.RECOMMENDATIONS,
      [],
    );
  }
}

/**
 * Marquer une recommandation comme lue.
 *
 * 1. Mise à jour immédiate du stockage local.
 * 2. Synchronisation avec le backend si Internet est disponible.
 */
export async function markRecommendationReadLocal(
  id: string,
): Promise<void> {
  const recs = await getItem<Recommendation[]>(
    StorageKeys.RECOMMENDATIONS,
    [],
  );

  const updated = recs.map((r) =>
    r.id === id
      ? {
          ...r,
          readAt: new Date().toISOString(),
        }
      : r,
  );

  await setItem(
    StorageKeys.RECOMMENDATIONS,
    updated,
  );

  // Synchronisation backend
  getIsOnline().then((online) => {
    if (online) {
      api
        .patch(`/recommendations/${id}/read`)
        .catch(() => {});
    }
  });
}

/**
 * Démarrer le polling des recommandations.
 */
export function startRecommendationPolling(
  intervalMs = 30000,
) {
  let timer: ReturnType<typeof setInterval> | null = null;

  const tick = async () => {
    await fetchRecommendationsFromBackend().catch(
      () => {},
    );
  };

  // Première récupération immédiatement
  tick();

  // Puis toutes les X secondes
  timer = setInterval(tick, intervalMs);

  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}