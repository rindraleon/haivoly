import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { couleursDeTon, type Ton } from '../tokens';

export interface BadgeProps {
  label: string;
  tone?: Ton;
  icon?: LucideIcon;
  size?: 'sm' | 'md';
  testID?: string;
}

/** Pastille d'état : toujours icône ou texte, jamais la couleur seule. */
export function Badge({ label, tone = 'neutre', icon: Icone, size = 'md', testID }: BadgeProps) {
  const theme = useTheme();
  const couleurs = couleursDeTon(theme.couleurs, tone);

  return (
    <View
      testID={testID}
      accessibilityRole="text"
      style={[
        styles.badge,
        size === 'sm' ? styles.petit : styles.moyen,
        { backgroundColor: couleurs.conteneur, borderRadius: theme.rayon.pill },
      ]}
    >
      {Icone ? (
        <Icone size={size === 'sm' ? 12 : 14} color={couleurs.surConteneur} strokeWidth={2.4} />
      ) : null}
      <Text
        variant={size === 'sm' ? 'micro' : 'caption'}
        style={{ color: couleurs.surConteneur }}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
  },
  petit: { paddingHorizontal: 8, paddingVertical: 2 },
  moyen: { paddingHorizontal: 10, paddingVertical: 4 },
});
