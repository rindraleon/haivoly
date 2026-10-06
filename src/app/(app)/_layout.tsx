import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { colors } from '@/theme';
import { SyncBanner } from '@/components/SyncComponent/SyncBanner';

/**
 * Layout du groupe `(app)` — routes protégées.
 *
 * Ce fichier reste **nécessaire**, pour deux raisons vérifiables :
 *
 *   1. `SyncBanner` n'est monté nulle part ailleurs. Il rend visibles la file
 *      hors-ligne, les échecs et les conflits (« Échec de synchronisation /
 *      Réessayer ») au-dessus des écrans protégés. Il s'affiche **dans le
 *      flux** (et non en position absolue) : le `View` qui l'enveloppe avec la
 *      pile est donc ce qui lui réserve sa place et pousse les écrans vers le
 *      bas.
 *   2. il déclare la pile du groupe : le layout racine référence le groupe
 *      `(app)` par son nom, et c'est ici que ses écrans enfants sont regroupés
 *      sous un navigateur unique (animation et fond communs).
 *
 * Les providers globaux, eux, sont montés une seule fois par le layout racine
 * (`@/providers/AppProviders`) : rien n'est dupliqué ici.
 *
 * Tous les écrans conservent le fond de l'application
 * (`colors.background.app`) via `contentStyle`, ce qui évite le fond blanc
 * observé sur l'écran de modification de parcelle.
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
