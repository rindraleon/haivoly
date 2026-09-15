import React from 'react';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';
import { colors, radius } from '@/design/tokens';

type Variant = 'filled' | 'outline' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface IconButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: ViewStyle;
  accessibilityLabel?: string;
}

export function IconButton({
  children,
  onPress,
  variant = 'outline',
  size = 'md',
  disabled,
  style,
  accessibilityLabel,
}: IconButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.base,
        sizeMap[size],
        variantMap[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderRadius: radius.md },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.96 }] },
});

const sizeMap: Record<Size, ViewStyle> = {
  sm: { width: 36, height: 36, borderRadius: 10 },
  md: { width: 42, height: 42, borderRadius: 12 },
  lg: { width: 48, height: 48, borderRadius: 14 },
};

const variantMap: Record<Variant, ViewStyle> = {
  filled: { backgroundColor: colors.neutral[900], borderColor: colors.neutral[900] },
  outline: { backgroundColor: '#FFFFFF', borderColor: colors.border.default },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
};
