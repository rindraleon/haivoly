import React from 'react';
import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

export type IconButtonSize = 'sm' | 'md' | 'lg';

export interface IconButtonProps {
  /** Icône Lucide déjà dimensionnée par l'appelant. */
  children: React.ReactNode;
  onPress?: () => void;
  size?: IconButtonSize;
  variant?: 'solid' | 'outline' | 'ghost';
  disabled?: boolean;
  loading?: boolean;
  /** Obligatoire : une icône seule doit rester accessible. */
  accessibilityLabel: string;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

const DIMENSIONS: Record<
  IconButtonSize,
  { box: number; hitSlop: number }
> = {
  sm: { box: 36, hitSlop: 8 },
  md: { box: 44, hitSlop: 4 },
  lg: { box: 52, hitSlop: 0 },
};

export function IconButton({
  children,
  onPress,
  size = 'md',
  variant = 'outline',
  disabled,
  loading,
  accessibilityLabel,
  accessibilityHint,
  style,
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  const { box, hitSlop } = DIMENSIONS[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      hitSlop={hitSlop}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        { width: box, height: box },
        VARIANTES[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: radius.md,
  },
  disabled: { opacity: 0.45 },
  pressed: { opacity: 0.8, transform: [{ scale: 0.94 }] },
});

const VARIANTES: Record<'solid' | 'outline' | 'ghost', ViewStyle> = {
  solid: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  outline: { backgroundColor: '#FFFFFF', borderColor: colors.border.strong },
  ghost: { backgroundColor: 'transparent', borderColor: 'transparent' },
};
