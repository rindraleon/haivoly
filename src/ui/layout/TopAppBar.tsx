import { ArrowLeft } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconButton } from '../components/IconButton';
import { Text } from '../primitives';
import { useTheme } from '../theme';

export interface TopAppBarProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  backLabel: string;
  right?: ReactNode;
}

/** Barre supérieure d'un écran empilé : retour prévisible, titre, actions. */
export function TopAppBar({ title, subtitle, onBack, backLabel, right }: TopAppBarProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.barre,
        {
          paddingTop: insets.top + theme.espace.sm,
          paddingHorizontal: theme.espace.md,
          backgroundColor: theme.couleurs.fond,
        },
      ]}
    >
      {onBack ? <IconButton icon={ArrowLeft} accessibilityLabel={backLabel} onPress={onBack} variant="ghost" /> : null}
      <View style={styles.textes}>
        <Text variant="h2" accessibilityRole="header" numberOfLines={2}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="bodySmall" color="texteSecondaire" numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  barre: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 8 },
  textes: { flex: 1, gap: 2, paddingHorizontal: 4 },
});
