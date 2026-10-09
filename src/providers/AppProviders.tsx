import React, { useEffect, useMemo, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';

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
    setUnauthorizedHandler(() => {
      queryClient.clear();

      router.replace('/(auth)/login' as never);

      Alert.alert(
        'Session expirée',
        'Votre session a expiré. Veuillez vous reconnecter pour continuer.',
        [{ text: 'Se reconnecter' }],
      );
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
