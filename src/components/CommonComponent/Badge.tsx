import { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewStyle, type TextStyle } from 'react-native';
import { radius } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  dot?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  size?: 'sm' | 'md';
}

export function Badge({ label, variant = 'neutral', dot, style, textStyle, size = 'sm' }: BadgeProps) {
  const { jetons } = useTheme();
  const cfg = useMemo(() => variantMapPour(jetons)[variant], [jetons, variant]);
  return (
    <View style={[styles.base, size === 'sm' ? styles.sm : styles.md, { backgroundColor: cfg.bg, borderColor: cfg.border }, style]}>
      {dot && <View style={[styles.dot, { backgroundColor: cfg.dot }]} />}
      <Text style={[styles.text, { color: cfg.text }, size === 'sm' ? styles.textSm : styles.textMd, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: radius.full,
    borderWidth: 1,
    paddingHorizontal: 9,
  },
  sm: { paddingVertical: 3, minHeight: 22 },
  md: { paddingVertical: 5, minHeight: 26, paddingHorizontal: 11 },
  text: { fontWeight: '600', letterSpacing: -0.1 },
  textSm: { fontSize: 11.5, lineHeight: 14 },
  textMd: { fontSize: 12.5, lineHeight: 16 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});

type BadgeCfg = { bg: string; border: string; text: string; dot: string };

/** Teinte atténuée pour les bordures de badge (couleur pleine trop forte). */
function alpha(hex: string, opacite: number): string {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!m) return hex;
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 0xff;
  const g = (n >> 8) & 0xff;
  const b = n & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${opacite})`;
}

function variantMapPour(jetons: Jetons): Record<BadgeVariant, BadgeCfg> {
  return {
    neutral: {
      bg: jetons.fond.attenue,
      border: jetons.bordure.defaut,
      text: jetons.texte.secondaire,
      dot: jetons.texte.discret,
    },
    success: {
      bg: jetons.succes.fond,
      border: alpha(jetons.succes.base, 0.4),
      text: jetons.succes.texte,
      dot: jetons.succes.base,
    },
    warning: {
      bg: jetons.alerte.fond,
      border: alpha(jetons.alerte.base, 0.4),
      text: jetons.alerte.texte,
      dot: jetons.alerte.base,
    },
    error: {
      bg: jetons.erreur.fond,
      border: alpha(jetons.erreur.base, 0.4),
      text: jetons.erreur.texte,
      dot: jetons.erreur.base,
    },
    info: {
      bg: jetons.info.fond,
      border: alpha(jetons.info.base, 0.4),
      text: jetons.info.texte,
      dot: jetons.info.base,
    },
    primary: {
      bg: jetons.primaire.clair,
      border: alpha(jetons.primaire.base, 0.45),
      text: jetons.primaire.base,
      dot: jetons.primaire.base,
    },
  };
}
