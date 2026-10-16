import { recommendationsApi } from '@/services';
import { getActiveAccountId } from '@/storage/authStorage';
import { accountStorageKey, getItem, setItem, StorageKeys } from '@/storage/database';
import type { Recommendation } from '@/types/notification.types';

type EcouteurRecommandations = () => void;
const ecouteurs = new Set<EcouteurRecommandations>();

/**
 * Prévient les lecteurs du cache local (badge de la barre d'onglets) que les
 * recommandations du compte ont changé : nouvelle réception, lecture.
 */
export function signalerRecommandationsModifiees(): void {
  for (const ecouteur of ecouteurs) {
    try {
      ecouteur();
    } catch {
      // Un lecteur défaillant ne bloque ni les autres ni la synchronisation.
    }
  }
}

/** Abonnement aux changements du cache local ; renvoie la fonction de désabonnement. */
export function ecouterRecommandations(ecouteur: EcouteurRecommandations): () => void {
  ecouteurs.add(ecouteur);
  return () => {
    ecouteurs.delete(ecouteur);
  };
}

async function recommendationKey(): Promise<string | null> {
  const accountId = await getActiveAccountId();
  return accountId ? accountStorageKey(accountId, StorageKeys.RECOMMENDATIONS) : null;
}

export async function fetchRecommendationsFromBackend(): Promise<Recommendation[]> {
  const key = await recommendationKey();
  if (!key) return [];

  // Tentative réseau systématique : `getIsOnline()` (expo-network) peut
  // signaler « hors ligne » sur un réseau local alors que l'API reste
  // joignable. On ne se fie donc pas à cet état pour décider d'appeler le
  // serveur. En cas d'échec, l'erreur remonte : l'appelant retombe sur le
  // cache du compte et peut la signaler à l'utilisateur.
  const data = await recommendationsApi.listMine();
  // Le statut de lecture vient du serveur; aucune réussite distante n'est
  // extrapolée à partir d'une valeur locale non confirmée.
  await setItem(key, data);
  signalerRecommandationsModifiees();
  return data;
}

/** Marque comme lue uniquement après une réponse API valide. */
export async function markRecommendationReadLocal(id: string): Promise<void> {
  const key = await recommendationKey();
  if (!key) throw new Error('Une session valide est requise.');

  await recommendationsApi.markRead(id);
  const recommendations = await getItem<Recommendation[]>(key, []);
  await setItem(key, recommendations.map((item) =>
    item.id === id ? { ...item, readAt: new Date().toISOString() } : item,
  ));
  signalerRecommandationsModifiees();
}

export function startRecommendationPolling(intervalMs = 15000) {
  const tick = async () => {
    await fetchRecommendationsFromBackend().catch(() => {});
  };
  void tick();
  const timer = setInterval(() => void tick(), intervalMs);
  return () => clearInterval(timer);
}
