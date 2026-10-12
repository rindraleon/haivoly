import React, { useEffect, useMemo, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { ConfirmProvider } from '@/components/CommonComponent/ConfirmProvider';
import { initialiserI18n } from '@/i18n';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { initialiserTheme } from '@/theme/ThemeProvider';
import { i18n } from '@/i18n/instance';
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
        i18n.t('auth.sessionExpiree'),
        i18n.t('auth.sessionExpireVeuillezReconnecter'),
        [{ text: i18n.t('auth.seReconnecter') }],
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

/**
 * Lit les préférences persistées (langue, thème) avant le premier rendu.
 *
 * Le rendu est suspendu tant que la lecture n'a pas abouti : c'est ce qui
 * évite le flash — sans cette attente, un utilisateur en thème sombre verrait
 * l'interface s'afficher en clair puis basculer.
 */
function PreferencesBootstrap({ children }: { children: React.ReactNode }) {
  const [pret, setPret] = useState(false);

  useEffect(() => {
    let actif = true;
    Promise.all([
      initialiserI18n().catch(() => {
        // Un echec de lecture du choix persiste ne doit pas bloquer l'app :
        // i18next retombe sur la langue par defaut.
      }),
      initialiserTheme().catch(() => {
        // Même règle : on retombe sur `system`.
      }),
    ]).finally(() => {
      if (actif) setPret(true);
    });
    return () => {
      actif = false;
    };
  }, []);

  if (!pret) return null;
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesBootstrap>
      <ThemeProvider>
        <GestureHandlerRootView style={styles.root}>
          <SafeAreaProvider>
            <QueryClientProvider client={queryClient}>
              <ConfirmProvider>
                <SyncProvider>{children}</SyncProvider>
              </ConfirmProvider>
            </QueryClientProvider>
          </SafeAreaProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </PreferencesBootstrap>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export { queryClient };
