import React from 'react';
import { Pressable, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { colors, radius, shadows } from '@/theme';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  variant?: 'default' | 'elevated' | 'outline' | 'muted';
  disabled?: boolean;
}

export function Card({ children, onPress, style, padded = true, variant = 'default', disabled }: CardProps) {
  const variantStyle = stylesByVariant[variant];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [styles.base, variantStyle, padded && styles.padded, pressed && styles.pressed, style as any]}
        accessibilityRole="button"
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[styles.base, variantStyle, padded && styles.padded, style as any]}>{children}</View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
    overflow: 'hidden',
  },
  padded: { padding: 16 },
  pressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
});

const stylesByVariant: Record<string, ViewStyle> = {
  default: { ...shadows.card, borderColor: colors.border.default },
  elevated: { ...shadows.md, borderColor: 'transparent' },
  outline: { borderColor: colors.border.strong, backgroundColor: '#FFFFFF', shadowOpacity: 0, elevation: 0 },
  muted: { backgroundColor: colors.neutral[100], borderColor: colors.border.default },
};
