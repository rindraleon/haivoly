import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { radius, sizing } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps {
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
  testID?: string;
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
  testID,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      
      testID={testID}style={({ pressed }) => [
        styles.base,
        stylesBySize[size],
        styles.parVariante[variant].container,
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <>
          <ActivityIndicator
            color={
              variant === 'primary' || variant === 'destructive'
                ? jetons.primaire.contraste
                : jetons.primaire.base
            }
            size="small"
          />
          <Text
            style={[
              styles.text,
              textSizeBySize[size],
              styles.parVariante[variant].text,
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
              styles.parVariante[variant].text,
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

/** Toutes les tailles héritent du rayon `md` du style de base : rayon unique
    des boutons du mobile (connexion, inscriptions, wizards, listes…). */
const stylesBySize: Record<Size, ViewStyle> = {
  sm: { minHeight: sizing.buttonHeightSm, paddingHorizontal: 14 },
  md: { minHeight: sizing.buttonHeight, paddingHorizontal: 18 },
  lg: { minHeight: sizing.buttonHeightLg, paddingHorizontal: 22 },
};

const textSizeBySize: Record<Size, TextStyle> = {
  sm: { fontSize: 13, lineHeight: 18 },
  md: { fontSize: 15, lineHeight: 20 },
  lg: { fontSize: 16, lineHeight: 24 },
};

function creerStyles(jetons: Jetons) {
  return {
    ...StyleSheet.create({
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
    }),
    parVariante: {
      primary: {
        container: { backgroundColor: jetons.primaire.base, borderColor: jetons.primaire.base },
        text: { color: jetons.primaire.contraste },
      },
      secondary: {
        container: { backgroundColor: jetons.texte.principal, borderColor: jetons.texte.principal },
        text: { color: jetons.texte.inverse },
      },
      outline: {
        container: { backgroundColor: jetons.fond.carte, borderColor: jetons.bordure.appuyee },
        text: { color: jetons.texte.principal },
      },
      ghost: {
        container: { backgroundColor: 'transparent', borderColor: 'transparent' },
        text: { color: jetons.primaire.base },
      },
      destructive: {
        container: { backgroundColor: jetons.erreur.base, borderColor: jetons.erreur.base },
        text: { color: jetons.primaire.contraste },
      },
    } as Record<Variant, { container: ViewStyle; text: TextStyle }>,
  };
}
