import { StyleSheet, Text, View, type ViewStyle, type TextStyle } from 'react-native';
import { colors, radius } from '@/theme';

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
  const cfg = variantMap[variant];
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

const variantMap: Record<BadgeVariant, { bg: string; border: string; text: string; dot: string }> = {
  neutral: { bg: colors.neutral[100], border: colors.neutral[200], text: colors.neutral[700], dot: colors.neutral[500] },
  success: { bg: colors.success[50], border: '#ABEFC6', text: colors.success[700], dot: colors.success[500] },
  warning: { bg: colors.warning[50], border: '#FEDF89', text: '#B54708', dot: colors.warning[500] },
  error: { bg: colors.error[50], border: colors.error[200], text: colors.error[700], dot: colors.error[500] },
  info: { bg: colors.info[50], border: colors.info[100], text: colors.info[600], dot: colors.info[500] },
  primary: { bg: colors.primary[50], border: '#ABEFC6', text: colors.primary[700], dot: colors.primary[500] },
};
