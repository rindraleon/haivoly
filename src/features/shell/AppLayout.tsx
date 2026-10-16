import { Stack, router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View , AppState } from 'react-native';
import { SafeAreaInsetsContext, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';
import { SyncBanner } from '@/components/SyncComponent/SyncBanner';
import { queryClient, useSyncContext } from '@/providers/AppProviders';
import { getToken } from '@/storage/authStorage';
import { colors } from '@/theme';
import { BarreBasContext, useTheme } from '@/ui';

import { BanniereSynchro } from './BanniereSynchro';
import { BarreNavigation } from './BarreNavigation';
import { etatBanniereSynchro } from './etatSynchro';
import { useVersionUi } from './versionUi';

/** Les détails et formulaires s'empilent au-dessus des onglets (retour prévisible). */
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

/**
 * Pile de l'espace connecté (logique déplacée depuis `src/app/(app)/_layout.tsx`,
 * inchangée) : vérification de session toutes les 15 s et bandeau de
 * synchronisation.
 *
 * Barre du bas affichée en permanence, sur toutes les pages : elle est rendue
 * ici, une seule fois, SOUS la pile (et non par le groupe `(tabs)`), donc aussi
 * sous les détails, formulaires et écrans communs. V1 : ancienne barre,
 * inchangée. V2 : `BarreNavigation` ; la zone sûre du bas lui revient et les
 * pieds collants des écrans ne la réappliquent pas (`BarreBasContext`).
 *
 * Bannière de synchronisation : V1 inchangée. En V2, la bannière porte la zone
 * sûre du haut et les écrans en dessous ne la réappliquent pas (insets
 * surchargés) ; elle est masquée sur l'accueil, dont la carte de
 * synchronisation offre déjà les mêmes informations et actions.
 */
export default function AppLayout() {
  const { version } = useVersionUi();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const sync = useSyncContext();
  const chemin = usePathname();
  const etatBanniere = version === 'v2' && chemin !== '/home' ? etatBanniereSynchro(sync) : null;
  const fond = version === 'v2' ? theme.couleurs.fond : colors.background.app;

  useEffect(() => {
    let checking = false;
    const verifySession = async () => {
      if (checking) return;
      checking = true;
      try {
        const token = await getToken().catch(() => null);
        if (!token) {
          queryClient.clear();
          router.replace('/(auth)/login' as never);
        }
      } finally {
        checking = false;
      }
    };
    void verifySession();
    const timer = setInterval(() => void verifySession(), 15000);
    // Retour au premier plan : aucune session révoquée ne doit survivre.
    const abonnement = AppState.addEventListener('change', (etat) => {
      if (etat === 'active') void verifySession();
    });
    return () => {
      clearInterval(timer);
      abonnement.remove();
    };
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: fond }]}>
      {version === 'v1' ? <SyncBanner /> : null}
      {etatBanniere ? <BanniereSynchro etat={etatBanniere} margeHaut={insets.top} /> : null}
      <SafeAreaInsetsContext.Provider value={etatBanniere ? { ...insets, top: 0 } : insets}>
        <BarreBasContext.Provider value={version === 'v2'}>
          <View style={styles.stack}>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: fond },
                animation: 'slide_from_right',
              }}
            />
          </View>
        </BarreBasContext.Provider>
      </SafeAreaInsetsContext.Provider>
      {version === 'v1' ? <AppBottomBar /> : <BarreNavigation />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  stack: { flex: 1 },
});
