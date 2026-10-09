
import { recommendationsApi } from '@/services';
import { getIsOnline } from '@/hooks/common/useNetwork';
import {
  getItem,
  setItem,
  StorageKeys,
} from '@/storage/database';
import type { Recommendation } from '@/types/notification.types';

export async function fetchRecommendationsFromBackend(): Promise<
  Recommendation[]
> {
  const online = await getIsOnline();


  if (!online) {
    return getItem<Recommendation[]>(
      StorageKeys.RECOMMENDATIONS,
      [],
    );
  }


  try {
    // Client typé unique (`src/services/api.ts`) : l'enveloppe `{success,data}`
    // est déjà déballée par `src/services/http.ts`.
    const data: Recommendation[] = await recommendationsApi.listMine();

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
      recommendationsApi
        .markRead(id)
        .catch(() => {});
    }
  });
}

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