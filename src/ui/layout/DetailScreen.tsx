import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { useTheme } from '../theme';
import { StickyFooter } from './StickyFooter';
import { TopAppBar } from './TopAppBar';

export interface DetailScreenProps {
  title: string;
  subtitle?: string;
  onBack: () => void;
  backLabel: string;
  /** Actions secondaires de l'en-tête (boutons icônes). */
  right?: ReactNode;
  /** Actions principales, toujours visibles en pied d'écran. */
  footer?: ReactNode;
  refreshing?: boolean;
  onRefresh?: () => void;
  gap?: number;
  children: ReactNode;
  testID?: string;
}

/**
 * Gabarit d'écran de détail : en-tête avec retour, contenu défilant
 * (tirer pour rafraîchir), actions principales collées en bas, au-dessus de
 * la zone sûre. Aucun champ de saisie ici : les formulaires utilisent `FormScreen`.
 */
export function DetailScreen({
  title,
  subtitle,
  onBack,
  backLabel,
  right,
  footer,
  refreshing = false,
  onRefresh,
  gap = 20,
  children,
  testID,
}: DetailScreenProps) {
  const theme = useTheme();

  return (
    <View style={[styles.racine, { backgroundColor: theme.couleurs.fond }]} testID={testID}>
      <TopAppBar title={title} subtitle={subtitle} onBack={onBack} backLabel={backLabel} right={right} />
      <ScrollView
        style={styles.racine}
        contentContainerStyle={{
          paddingHorizontal: theme.dimensions.margeEcran,
          paddingTop: theme.espace.xs,
          paddingBottom: theme.espace.xxl,
          gap,
        }}
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
      {footer ? <StickyFooter>{footer}</StickyFooter> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
});
