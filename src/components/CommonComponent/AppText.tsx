import React from 'react';
import { StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography } from '@/theme';

export type AppTextVariant = 'title' | 'subtitle' | 'body' | 'label' | 'caption';

/** Nuance de couleur, indépendante de la taille. */
export type AppTextTone = 'default' | 'muted' | 'primary' | 'danger' | 'inverse';

export interface AppTextProps extends TextProps {
  variant?: AppTextVariant;
  tone?: AppTextTone;
  weight?: keyof typeof typography.weight;
  center?: boolean;
}

const VARIANTES: Record<AppTextVariant, TextStyle> = {
  title: {
    fontSize: typography.size['3xl'],
    fontWeight: typography.weight.bold,
    color: colors.neutral[900],
  },
  subtitle: {
    fontSize: typography.size.md,
    color: colors.neutral[600],
  },
  body: {
    fontSize: typography.size.base,
    color: colors.neutral[800],
  },
  label: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
    color: colors.neutral[700],
  },
  caption: {
    fontSize: typography.size.xs,
    color: colors.neutral[500],
  },
};

const TEINTES: Record<AppTextTone, TextStyle> = {
  default: {},
  muted: { color: colors.neutral[500] },
  primary: { color: colors.primary[600] },
  danger: { color: colors.error[500] },
  inverse: { color: colors.neutral[0] },
};

export function AppText({
  variant = 'body',
  tone = 'default',
  weight,
  center,
  style,
  children,
  ...props
}: AppTextProps) {
  return (
    <Text
      {...props}
      style={[
        VARIANTES[variant],
        TEINTES[tone],
        weight ? { fontWeight: typography.weight[weight] } : null,
        center ? styles.center : null,
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
});

export default AppText;
