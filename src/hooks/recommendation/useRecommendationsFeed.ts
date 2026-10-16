import { useCallback, useEffect, useState } from 'react';

import { recommendationsApi, toApiError } from '@/services';
import { useNetworkStatus } from '@/hooks/common/useNetwork';
import {
  ecouterRecommandations,
  fetchRecommendationsFromBackend,
  markRecommendationReadLocal,
  signalerRecommandationsModifiees,
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
 * Résumé lisible d'une erreur de synchronisation, pour le bandeau de
 * diagnostic affiché en développement. Distingue explicitement une erreur
 * réseau (`0 ·`) d'un refus HTTP (code, statut).
 */
function decrireErreur(error: unknown): string {
  const e = toApiError(error);
  const statut = e.status > 0 ? String(e.status) : 'réseau';
  return `${statut} · ${e.code} · ${e.message}`;
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
  const [erreur, setErreur] = useState(false);
  const [derniereErreur, setDerniereErreur] = useState<string | null>(null);

  const relire = useCallback(async () => {
    const data = await lireRecommandations();
    setRecommendations(data);
    return data;
  }, []);

  /**
   * Tente toujours le serveur : `getIsOnline()` (expo-network) peut indiquer
   * « hors ligne » sur un réseau local alors que l'API reste joignable. En cas
   * d'échec, le cache du compte reste la source et l'erreur est exposée pour
   * être signalée quand aucune donnée locale n'est disponible.
   */
  const synchroniser = useCallback(async () => {
    try {
      await fetchRecommendationsFromBackend();
      setErreur(false);
      setDerniereErreur(null);
      return true;
    } catch (error) {
      setErreur(true);
      setDerniereErreur(decrireErreur(error));
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await synchroniser();
    await relire();
  }, [synchroniser, relire]);

  useEffect(() => {
    let actif = true;
    (async () => {
      await synchroniser();
      if (!actif) return;
      await relire();
      if (actif) setLoading(false);
    })();
    return () => {
      actif = false;
    };
  }, [isOnline, synchroniser, relire]);

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
    signalerRecommandationsModifiees();
  }, []);

  const unreadCount = recommendations.filter((item) => !item.readAt).length;

  return {
    recommendations,
    unreadCount,
    loading,
    refreshing,
    erreur,
    derniereErreur,
    refresh: onRefresh,
    reload: relire,
    markRead,
    markAllRead,
  };
}

/**
 * Nombre de recommandations non lues, lu dans le cache local du compte (aucun
 * appel réseau : le polling d'`AppProviders` alimente déjà ce cache toutes les
 * 15 s au premier plan). Relu dès que ce cache change (réception, lecture,
 * « tout lu »), à chaque changement de `cleRelecture` (ex. : le chemin
 * courant) et, par sécurité, à intervalle régulier.
 */
export function useNombreNonLues(cleRelecture?: string, intervalMs = 10000): number {
  const [nonLues, setNonLues] = useState(0);

  useEffect(() => {
    let actif = true;
    const relire = async () => {
      const liste = await lireRecommandations().catch(() => [] as Recommendation[]);
      if (actif) setNonLues(liste.filter((item) => !item.readAt).length);
    };
    void relire();
    const desabonner = ecouterRecommandations(() => void relire());
    const id = setInterval(() => void relire(), intervalMs);
    return () => {
      actif = false;
      desabonner();
      clearInterval(id);
    };
  }, [cleRelecture, intervalMs]);

  return nonLues;
}
