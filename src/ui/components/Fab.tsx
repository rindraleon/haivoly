import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';

export interface FabProps {
  label: string;
  icon: LucideIcon;
  onPress: () => void;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * Bouton d'action flottant étendu (icône + libellé visible) : l'action
 * principale d'une liste en un tap, posé au-dessus de la barre d'onglets.
 * Le libellé reste affiché — une icône seule ne suffit pas à tous les publics.
 */
export function Fab({ label, icon: Icone, onPress, accessibilityHint, testID, style }: FabProps) {
  const theme = useTheme();
  const { couleurs } = theme;

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[
        styles.fab,
        {
          borderRadius: theme.rayon.lg,
          backgroundColor: couleurs.primaire,
          boxShadow: theme.ombres.elevee,
        },
        style,
      ]}
    >
      <Icone size={20} color={couleurs.surPrimaire} strokeWidth={2.4} />
      <Text variant="label" style={{ color: couleurs.surPrimaire }}>
        {label}
      </Text>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  fab: {
    minHeight: 56,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
