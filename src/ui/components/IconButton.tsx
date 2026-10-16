import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';

export interface IconButtonProps {
  icon: LucideIcon;
  /** Obligatoire : un bouton icône doit avoir un nom accessible. */
  accessibilityLabel: string;
  onPress?: () => void;
  /** Compteur affiché en pastille (masqué à 0). */
  badge?: number;
  variant?: 'surface' | 'ghost';
  testID?: string;
}

export function IconButton({ icon: Icone, accessibilityLabel, onPress, badge = 0, variant = 'surface', testID }: IconButtonProps) {
  const theme = useTheme();
  const { couleurs } = theme;

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      testID={testID}
      feedback="opacity"
      style={[
        styles.bouton,
        variant === 'surface'
          ? { backgroundColor: couleurs.surface, borderColor: couleurs.bordure, borderWidth: 1 }
          : null,
      ]}
    >
      <Icone size={22} color={couleurs.texte} strokeWidth={2} />
      {badge > 0 ? (
        <View style={[styles.pastille, { backgroundColor: couleurs.erreurFonce, borderColor: couleurs.surface }]}>
          <Text variant="micro" style={{ color: couleurs.surErreurFonce }} tabular>
            {badge > 99 ? '99+' : badge}
          </Text>
        </View>
      ) : null}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  bouton: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  pastille: {
    position: 'absolute',
    top: 4,
    right: 2,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
