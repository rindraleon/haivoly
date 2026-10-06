import React, { useEffect, useMemo, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { StyleSheet } from 'react-native';

import { ConfirmProvider } from '@/components/CommonComponent/ConfirmProvider';
import { setUnauthorizedHandler } from '@/services/http';
import { startRecommendationPolling } from '@/services/offline/recommendationSync';
import { useNetworkStatus } from '@/hooks/common/useNetwork';
import {
  getSyncState,
  onSyncState,
  retryFailed,
  startAutoSync,
  syncOnce,
  type SyncState,
} from '@/services/offline/syncEngine';

/**
 * Composition unique des providers de l'application.
 *
 * `src/app/_layout.tsx` ne fait que monter ce composant : les écrans de route
 * restent ainsi de simples redirections, sans logique d'infrastructure.
 *
 *   • `GestureHandlerRootView` / `SafeAreaProvider` : socle natif ;
 *   • TanStack Query est **la seule couche d'état serveur** (un seul client,
 *     partagé avec `src/services/http.ts` pour la purge sur session expirée) ;
 *   • `ConfirmProvider` : dialogues de confirmation globaux ;
 *   • `SyncProvider` : file hors-ligne (en attente, échecs, dernière synchro)
 *     et synchronisation immédiate au retour du réseau.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: { retry: 0 },
  },
});

export interface SyncContextValue extends SyncState {
  isOnline: boolean;
  syncNow: () => Promise<void>;
  retry: () => Promise<void>;
}

export const SyncContext = React.createContext<SyncContextValue>({
  isSyncing: false,
  pendingCount: 0,
  failedCount: 0,
  isOnline: true,
  syncNow: async () => {},
  retry: async () => {},
});

export function useSyncContext(): SyncContextValue {
  return React.useContext(SyncContext);
}

function SyncProvider({ children }: { children: React.ReactNode }) {
  const isOnline = useNetworkStatus();
  const [state, setState] = useState<SyncState>(getSyncState);

  useEffect(() => onSyncState(setState), []);

  useEffect(() => {
    // Session expirée : on purge le cache pour éviter d'afficher des données
    // appartenant à un compte déconnecté.
    setUnauthorizedHandler(() => {
      queryClient.clear();
    });
    return () => setUnauthorizedHandler(null);
  }, []);

  useEffect(() => {
    // Un seul moteur de synchronisation pour toute l'application : les écrans
    // ne démarrent plus leurs propres boucles (elles se coupaient entre elles).
    const stopSync = startAutoSync();
    const stopRecos = startRecommendationPolling();
    return () => {
      stopSync();
      stopRecos();
    };
  }, []);

  // Retour de la connexion → synchronisation immédiate.
  useEffect(() => {
    if (isOnline) {
      void syncOnce();
    }
  }, [isOnline]);

  const value = useMemo<SyncContextValue>(
    () => ({
      ...state,
      isOnline,
      syncNow: async () => {
        await syncOnce();
      },
      retry: async () => {
        await retryFailed();
      },
    }),
    [state, isOnline],
  );

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ConfirmProvider>
            <SyncProvider>{children}</SyncProvider>
          </ConfirmProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export { queryClient };
