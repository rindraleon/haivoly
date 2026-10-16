import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';
import { useBarreBasPresente } from './BarreBasContext';
import { useClavier } from './useClavier';

export interface StickyFooterProps {
  children: ReactNode;
}

/**
 * Pied d'action collant. Placé dans le `KeyboardAvoidingView` d'un
 * `FormScreen`, il reste juste au-dessus du clavier ; clavier fermé, il
 * respecte la zone sûre du bas (barre de gestes, indicateur d'accueil), sauf
 * si la barre d'onglets permanente la porte déjà juste en dessous.
 */
export function StickyFooter({ children }: StickyFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const clavier = useClavier();
  const barreEnDessous = useBarreBasPresente();
  const zoneSureBas = clavier.visible || barreEnDessous ? 0 : insets.bottom;

  return (
    <View
      style={[
        styles.pied,
        {
          backgroundColor: theme.couleurs.surface,
          borderTopColor: theme.couleurs.bordure,
          boxShadow: theme.ombres.barre,
          paddingHorizontal: theme.dimensions.margeEcran,
          paddingBottom: Math.max(zoneSureBas, theme.espace.md),
        },
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  pied: { borderTopWidth: 1, paddingTop: 12, gap: 8 },
});
