import { recommendationsApi } from '@/services';
import { getIsOnline } from '@/hooks/common/useNetwork';
import { getActiveAccountId } from '@/storage/authStorage';
import { accountStorageKey, getItem, setItem, StorageKeys } from '@/storage/database';
import type { Recommendation } from '@/types/notification.types';

async function recommendationKey(): Promise<string | null> {
  const accountId = await getActiveAccountId();
  return accountId ? accountStorageKey(accountId, StorageKeys.RECOMMENDATIONS) : null;
}

export async function fetchRecommendationsFromBackend(): Promise<Recommendation[]> {
  const key = await recommendationKey();
  if (!key) return [];
  const online = await getIsOnline();

  if (!online) return getItem<Recommendation[]>(key, []);

  try {
    const data = await recommendationsApi.listMine();
    // Le statut de lecture vient du serveur; aucune réussite distante n'est
    // extrapolée à partir d'une valeur locale non confirmée.
    await setItem(key, data);
    return data;
  } catch {
    return getItem<Recommendation[]>(key, []);
  }
}

/** Marque comme lue uniquement après une réponse API valide. */
export async function markRecommendationReadLocal(id: string): Promise<void> {
  const key = await recommendationKey();
  if (!key) throw new Error('Une session valide est requise.');
  if (!(await getIsOnline())) {
    throw new Error('Cette action nécessite une connexion; elle n’a pas été enregistrée.');
  }

  await recommendationsApi.markRead(id);
  const recommendations = await getItem<Recommendation[]>(key, []);
  await setItem(key, recommendations.map((item) =>
    item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
  ));
}

export function startRecommendationPolling(intervalMs = 15000) {
  const tick = async () => {
    await fetchRecommendationsFromBackend().catch(() => {});
  };
  void tick();
  const timer = setInterval(() => void tick(), intervalMs);
  return () => clearInterval(timer);
}
