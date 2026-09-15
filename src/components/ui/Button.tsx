import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { colors, radius, sizing } from '@/design/tokens';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  disabled,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={({ pressed }) => [
        styles.base,
        stylesBySize[size],
        stylesByVariant[variant].container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator
            color={variant === 'primary' || variant === 'destructive' ? '#FFFFFF' : colors.primary[500]}
            size="small"
          />
          <Text
            style={[
              styles.text,
              stylesBySize[size] && textSizeBySize[size],
              stylesByVariant[variant].text,
              textStyle,
            ]}
          >
            {children}
          </Text>
        </>
      ) : (
        <>
          {leftIcon && <View style={styles.icon}>{leftIcon}</View>}
          <Text
            style={[
              styles.text,
              textSizeBySize[size],
              stylesByVariant[variant].text,
              isDisabled && styles.textDisabled,
              textStyle,
            ]}
          >
            {children}
          </Text>
          {rightIcon && <View style={styles.icon}>{rightIcon}</View>}
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  fullWidth: { alignSelf: 'stretch', width: '100%' },
  disabled: { opacity: 0.52 },
  pressed: { opacity: 0.86, transform: [{ scale: 0.985 }] },
  icon: { alignItems: 'center', justifyContent: 'center' },
  text: { fontWeight: '700', textAlign: 'center' },
  textDisabled: { opacity: 0.9 },
});

const stylesBySize: Record<Size, ViewStyle> = {
  sm: { minHeight: sizing.buttonHeightSm, paddingHorizontal: 14, borderRadius: radius.sm },
  md: { minHeight: sizing.buttonHeight, paddingHorizontal: 18 },
  lg: { minHeight: sizing.buttonHeightLg, paddingHorizontal: 22, borderRadius: radius.lg },
};

const textSizeBySize: Record<Size, TextStyle> = {
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 15, lineHeight: 20 },
  lg: { fontSize: 16, lineHeight: 24 },
};

const stylesByVariant: Record<Variant, { container: ViewStyle; text: TextStyle }> = {
  primary: {
    container: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
    text: { color: '#FFFFFF' },
  },
  secondary: {
    container: { backgroundColor: colors.neutral[900], borderColor: colors.neutral[900] },
    text: { color: '#FFFFFF' },
  },
  outline: {
    container: { backgroundColor: '#FFFFFF', borderColor: colors.border.strong },
    text: { color: colors.neutral[700] },
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderColor: 'transparent' },
    text: { color: colors.primary[500] },
  },
  destructive: {
    container: { backgroundColor: colors.error[500], borderColor: colors.error[500] },
    text: { color: '#FFFFFF' },
  },
};
