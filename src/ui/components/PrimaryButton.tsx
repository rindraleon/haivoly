import type { LucideIcon } from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Text, Touchable } from '../primitives';
import { useTheme, type Theme } from '../theme';

export type ButtonVariant = 'primary' | 'secondary' | 'cta' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  accessibilityHint?: string;
  accessibilityLabel?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
}

function couleursVariante(theme: Theme, variante: ButtonVariant) {
  const c = theme.couleurs;
  switch (variante) {
    case 'secondary':
      return { fond: c.primaireConteneur, texte: c.surPrimaireConteneur, bordure: 'transparent' };
    case 'cta':
      return { fond: c.cta, texte: c.surCta, bordure: 'transparent' };
    case 'outline':
      return { fond: 'transparent', texte: c.primaire, bordure: c.primaire };
    case 'ghost':
      return { fond: 'transparent', texte: c.primaire, bordure: 'transparent' };
    case 'danger':
      return { fond: c.erreurFonce, texte: c.surErreurFonce, bordure: 'transparent' };
    default:
      return { fond: c.primaire, texte: c.surPrimaire, bordure: 'transparent' };
  }
}

const HAUTEURS: Record<ButtonSize, number> = { sm: 40, md: 48, lg: 52 };
const PADDINGS: Record<ButtonSize, number> = { sm: 14, md: 18, lg: 20 };

/** Bouton d'action : 6 variantes, 3 tailles, état de chargement accessible. */
export function PrimaryButton({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  icon: Icone,
  iconPosition = 'left',
  loading = false,
  disabled = false,
  fullWidth = false,
  accessibilityHint,
  accessibilityLabel,
  testID,
  style,
}: PrimaryButtonProps) {
  const theme = useTheme();
  const couleurs = couleursVariante(theme, variant);
  const inactif = disabled || loading;
  const tailleIcone = size === 'sm' ? 16 : 18;

  const icone = loading ? (
    <ActivityIndicator size="small" color={couleurs.texte} />
  ) : Icone ? (
    <Icone size={tailleIcone} color={couleurs.texte} strokeWidth={2.2} />
  ) : null;

  return (
    <Touchable
      onPress={onPress}
      disabled={inactif}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      aria-disabled={inactif}
      aria-busy={loading}
      testID={testID}
      style={[
        styles.base,
        {
          minHeight: HAUTEURS[size],
          paddingHorizontal: PADDINGS[size],
          borderRadius: theme.rayon.md,
          backgroundColor: couleurs.fond,
          borderColor: couleurs.bordure,
        },
        fullWidth ? styles.pleineLargeur : null,
        // Un bouton en chargement garde son apparence (pas d'opacité réduite).
        loading ? styles.opaque : null,
        style,
      ]}
    >
      <View style={styles.contenu}>
        {iconPosition === 'left' ? icone : null}
        <Text
          variant={size === 'sm' ? 'label' : 'button'}
          style={{ color: couleurs.texte }}
          numberOfLines={1}
        >
          {label}
        </Text>
        {iconPosition === 'right' ? icone : null}
      </View>
    </Touchable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  pleineLargeur: { alignSelf: 'stretch' },
  opaque: { opacity: 1 },
  contenu: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
