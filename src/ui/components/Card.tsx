import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

import { Touchable } from '../primitives';
import { useTheme } from '../theme';
import type { CleEspace } from '../tokens';

export interface CardProps {
  children: ReactNode;
  /** `elevated` : ombre douce · `outlined` : bordure seule · `tonal` : fond teinté. */
  variant?: 'elevated' | 'outlined' | 'tonal';
  padding?: CleEspace;
  radius?: 'lg' | 'xl';
  onPress?: () => void;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

/** Surface de base : radius 16–20, bordure fine, ombre douce. */
export function Card({
  children,
  variant = 'elevated',
  padding = 'lg',
  radius = 'lg',
  onPress,
  accessibilityLabel,
  accessibilityHint,
  testID,
  style,
}: CardProps) {
  const theme = useTheme();
  const { couleurs } = theme;

  const apparence: ViewStyle = {
    backgroundColor: variant === 'tonal' ? couleurs.surfaceAlt : couleurs.surface,
    borderRadius: theme.rayon[radius],
    borderWidth: variant === 'tonal' ? 0 : 1,
    borderColor: couleurs.bordure,
    padding: theme.espace[padding],
    boxShadow: variant === 'elevated' ? theme.ombres.carte : undefined,
  };

  if (!onPress) {
    return (
      <View style={[apparence, style]} testID={testID} accessibilityLabel={accessibilityLabel}>
        {children}
      </View>
    );
  }

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={[apparence, style]}
    >
      {children}
    </Touchable>
  );
}
