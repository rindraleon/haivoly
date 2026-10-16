import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '../theme';

export interface ScreenProps {
  children: ReactNode;
  /** Contenu défilant (défaut) ou fixe. */
  scroll?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Espacement vertical entre les sections. */
  gap?: number;
  contentStyle?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * Écran de base : fond du thème, zone sûre du haut (encoche, barre d'état),
 * marges latérales de 20 px et tirer-pour-rafraîchir.
 */
export function Screen({ children, scroll = true, refreshing = false, onRefresh, gap = 20, contentStyle, testID }: ScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const remplissage: ViewStyle = {
    paddingTop: insets.top + theme.espace.md,
    paddingHorizontal: theme.dimensions.margeEcran,
    paddingBottom: theme.espace.xxl,
    gap,
  };

  if (!scroll) {
    return (
      <View style={[styles.racine, { backgroundColor: theme.couleurs.fond }, remplissage, contentStyle]} testID={testID}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      testID={testID}
      style={[styles.racine, { backgroundColor: theme.couleurs.fond }]}
      contentContainerStyle={[remplissage, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.couleurs.primaire}
            colors={[theme.couleurs.primaire]}
            progressBackgroundColor={theme.couleurs.surface}
          />
        ) : undefined
      }
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
});
