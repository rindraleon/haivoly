import { Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { styleTypo, type Couleurs, type VarianteTexte } from '../tokens';
import { useTheme } from '../theme';

export interface TextProps extends RNTextProps {
  /** Niveau de l'échelle typographique (défaut : `body`). */
  variant?: VarianteTexte;
  /** Couleur sémantique du thème (défaut : `texte`). */
  color?: keyof Couleurs;
  align?: 'auto' | 'left' | 'center' | 'right';
  /** Chiffres à chasse fixe (montants, quantités, KPI). */
  tabular?: boolean;
}

/** Les très grands textes plafonnent plus tôt pour ne pas casser la mise en page. */
const PLAFOND_ECHELLE: Partial<Record<VarianteTexte, number>> = {
  display: 1.4,
  kpi: 1.4,
  h1: 1.6,
};

export function Text({
  variant = 'body',
  color = 'texte',
  align,
  tabular,
  style,
  maxFontSizeMultiplier,
  ...rest
}: TextProps) {
  const { couleurs } = useTheme();

  return (
    <RNText
      maxFontSizeMultiplier={maxFontSizeMultiplier ?? PLAFOND_ECHELLE[variant] ?? 2}
      {...rest}
      style={[
        styleTypo(variant),
        { color: couleurs[color] },
        align ? { textAlign: align } : null,
        tabular ? { fontVariant: ['tabular-nums'] } : null,
        style,
      ]}
    />
  );
}
