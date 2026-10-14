import React, { useMemo } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle, type StyleProp } from 'react-native';
import { radius, shadows } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  variant?: 'default' | 'elevated' | 'outline' | 'muted';
  disabled?: boolean;
}

export function Card({ children, onPress, style, padded = true, variant = 'default', disabled }: CardProps) {
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);
  const variantStyle = styles.parVariante[variant];

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

function creerStyles(jetons: Jetons) {
  return {
    ...StyleSheet.create({
      base: {
        borderRadius: radius.lg,
        backgroundColor: jetons.fond.carte,
        borderWidth: 1,
        borderColor: jetons.bordure.defaut,
        overflow: 'hidden',
      },
      padded: { padding: 16 },
      pressed: { opacity: 0.96, transform: [{ scale: 0.99 }] },
    }),
    parVariante: {
      default: { ...shadows.card, borderColor: jetons.bordure.defaut },
      elevated: { ...shadows.md, borderColor: 'transparent' },
      outline: {
        borderColor: jetons.bordure.appuyee,
        backgroundColor: jetons.fond.carte,
        shadowOpacity: 0,
        elevation: 0,
      },
      muted: {
        backgroundColor: jetons.fond.attenue,
        borderColor: jetons.bordure.defaut,
      },
    } as Record<CardProps['variant'] & string, ViewStyle>,
  };
}
