import { StyleSheet, View } from 'react-native';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';

export interface AvatarProps {
  /** Prénom et nom : les initiales en sont tirées. */
  nom: string;
  onPress?: () => void;
  accessibilityLabel?: string;
  size?: number;
}

export function initiales(nom: string): string {
  const morceaux = nom.trim().split(/\s+/).filter(Boolean);
  const lettres = morceaux.length > 1 ? morceaux[0][0] + morceaux[morceaux.length - 1][0] : (morceaux[0] ?? '?').slice(0, 2);
  return lettres.toUpperCase();
}

export function Avatar({ nom, onPress, accessibilityLabel, size = 48 }: AvatarProps) {
  const theme = useTheme();
  const contenu = (
    <View
      style={[
        styles.cercle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.couleurs.primaire },
      ]}
    >
      <Text variant="label" style={{ color: theme.couleurs.surPrimaire }}>
        {initiales(nom)}
      </Text>
    </View>
  );

  if (!onPress) return contenu;
  return (
    <Touchable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel ?? nom} feedback="opacity">
      {contenu}
    </Touchable>
  );
}

const styles = StyleSheet.create({
  cercle: { alignItems: 'center', justifyContent: 'center' },
});
