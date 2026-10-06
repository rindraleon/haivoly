import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { colors } from '@/theme';
import { SyncBanner } from '@/components/SyncComponent/SyncBanner';

/**
 * Layout du groupe (app) — routes protégées.
 *
 * Les providers globaux sont déjà montés par le layout racine
 * (`@/providers/AppProviders`) : ce fichier ne fait plus que :
 *   • afficher `SyncBanner` — actions en attente, échecs, conflits
 *     (« Échec de synchronisation / Réessayer ») ;
 *   • `SyncBanner`   → visibilité sur les actions en attente, les échecs et
 *     les conflits (« Échec de synchronisation / Réessayer »).
 *
 * Tous les écrans conservent le fond de l'application (`colors.background.app`)
 * via `contentStyle`, ce qui évite le fond blanc observé sur l'écran de
 * modification de parcelle.
 */
export default function AppLayout() {
  return (
    <View style={styles.container}>
        <SyncBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background.app },
            animation: 'slide_from_right',
          }}
        />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.app },
});
