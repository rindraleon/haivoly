import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '../primitives';
import { useTheme } from '../theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Libellé du voile pour les lecteurs d'écran (ex. « Fermer »). */
  closeLabel: string;
  title?: string;
  /** `false` pendant un envoi : le voile et le retour Android ne ferment plus la feuille. */
  dismissible?: boolean;
  children: ReactNode;
  testID?: string;
}

/**
 * Feuille modale ancrée en bas (zone du pouce). Fermeture au tap sur le voile
 * et au bouton retour Android ; zone sûre basse respectée ; montée animée
 * (Reanimated, qui suit le réglage « réduire les animations » du système).
 */
export function BottomSheet({
  visible,
  onClose,
  closeLabel,
  title,
  dismissible = true,
  children,
  testID,
}: BottomSheetProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const fermer = () => {
    if (dismissible) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={fermer}>
      <View style={styles.racine}>
        <Pressable
          style={[StyleSheet.absoluteFill, { backgroundColor: theme.couleurs.superposition }]}
          onPress={fermer}
          accessibilityRole="button"
          accessibilityLabel={closeLabel}
          testID={testID ? `${testID}-voile` : undefined}
        />
        <Animated.View
          entering={SlideInDown.duration(240)}
          accessibilityViewIsModal
          testID={testID}
          style={[
            styles.feuille,
            {
              backgroundColor: theme.couleurs.surface,
              borderTopLeftRadius: theme.rayon.xxl,
              borderTopRightRadius: theme.rayon.xxl,
              paddingBottom: Math.max(insets.bottom, theme.espace.lg) + theme.espace.sm,
              boxShadow: theme.ombres.elevee,
            },
          ]}
        >
          <View style={[styles.poignee, { backgroundColor: theme.couleurs.bordureForte }]} />
          {title ? (
            <Text variant="h3" accessibilityRole="header">
              {title}
            </Text>
          ) : null}
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1, justifyContent: 'flex-end' },
  feuille: { paddingHorizontal: 20, paddingTop: 10, gap: 14, width: '100%', maxWidth: 640, alignSelf: 'center' },
  poignee: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, marginBottom: 2 },
});
