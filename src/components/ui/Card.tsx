import React from 'react';
import { Platform, Pressable, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { colors, radius, shadows } from '@/design/tokens';

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
  default: { ...(Platform.OS === 'web' ? ({ boxShadow: (shadows.card as any).boxShadow } as any) : (shadows.card as any)), borderColor: colors.border.default },
  elevated: { ...(Platform.OS === 'web' ? ({ boxShadow: (shadows.md as any).boxShadow } as any) : (shadows.md as any)), borderColor: 'transparent' },
  outline: { borderColor: colors.border.strong, backgroundColor: '#FFFFFF', boxShadow: 'none', elevation: 0 } as any,
  muted: { backgroundColor: colors.neutral[100], borderColor: colors.border.default },
};
