import React, { useEffect, useMemo, useState } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';

import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';

import { ConfirmProvider } from '@/components/CommonComponent/ConfirmProvider';
import { VersionUiProvider, initialiserVersionUi } from '@/features/shell/versionUi';
import { definirPolicesChargees } from '@/ui/tokens/typographie';
import { initialiserI18n } from '@/i18n';
import { ThemeProvider, initialiserTheme } from '@/theme/ThemeProvider';
import { ToastProvider } from '@/ui';
import { i18n } from '@/i18n/instance';
import { setUnauthorizedHandler } from '@/services/http';
import { startRecommendationPolling } from '@/services/offline/recommendationSync';
import { useNetworkStatus } from '@/hooks/common/useNetwork';
import {
  getSyncState,
  onSyncState,
  retryFailed,
  setSyncCompletionHandler,
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
  invalidCount: 0,
  conflictCount: 0,
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
    setSyncCompletionHandler(async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['parcelles'] }),
        queryClient.invalidateQueries({ queryKey: ['cultures'] }),
        queryClient.invalidateQueries({ queryKey: ['cultures-parcelle'] }),
        queryClient.invalidateQueries({ queryKey: ['interventions'] }),
        queryClient.invalidateQueries({ queryKey: ['observations'] }),
        queryClient.invalidateQueries({ queryKey: ['recoltes'] }),
        queryClient.invalidateQueries({ queryKey: ['dashboard'] }),
      ]);
    });
    return () => setSyncCompletionHandler(null);
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

/** Graisses d'Inter utilisées par le design system V2 (sous-chemins : 4 fichiers, pas 18). */
const POLICES_INTER = { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold };

/** Au-delà, l'app démarre avec la police système plutôt que d'attendre. */
const DELAI_MAX_POLICES_MS = 4000;

function PreferencesBootstrap({ children }: { children: React.ReactNode }) {
  const [pret, setPret] = useState(false);
  const [delaiPolicesEcoule, setDelaiPolicesEcoule] = useState(false);
  const [policesChargees, erreurPolices] = useFonts(POLICES_INTER);

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
      initialiserVersionUi().catch(() => {
        // Même règle : on retombe sur la version par défaut.
      }),
    ]).finally(() => {
      if (actif) setPret(true);
    });
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => {
    const minuteur = setTimeout(() => setDelaiPolicesEcoule(true), DELAI_MAX_POLICES_MS);
    return () => clearTimeout(minuteur);
  }, []);

  const policesPretes = policesChargees || Boolean(erreurPolices) || delaiPolicesEcoule;
  if (!pret || !policesPretes) return null;

  // Inter indisponible : la typographie V2 retombe sur la police système.
  definirPolicesChargees(policesChargees);
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <PreferencesBootstrap>
      <ThemeProvider>
        <VersionUiProvider>
          <GestureHandlerRootView style={styles.root}>
            <SafeAreaProvider>
              <QueryClientProvider client={queryClient}>
                <ToastProvider>
                  <ConfirmProvider>
                    <SyncProvider>{children}</SyncProvider>
                  </ConfirmProvider>
                </ToastProvider>
              </QueryClientProvider>
            </SafeAreaProvider>
          </GestureHandlerRootView>
        </VersionUiProvider>
      </ThemeProvider>
    </PreferencesBootstrap>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});

export { queryClient };
