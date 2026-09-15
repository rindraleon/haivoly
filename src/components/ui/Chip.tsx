import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius } from '@/design/tokens';

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
}

export function Chip({ label, selected, onPress, disabled }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        selected ? styles.selected : styles.unselected,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
      ]}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
    >
      <Text style={[styles.text, selected ? styles.textSelected : styles.textUnselected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1.25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary[500], borderColor: colors.primary[500] },
  unselected: { backgroundColor: '#FFFFFF', borderColor: colors.border.strong },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.85, transform: [{ scale: 0.97 }] },
  text: { fontSize: 12.5, fontWeight: '600', letterSpacing: -0.1 },
  textSelected: { color: '#FFFFFF' },
  textUnselected: { color: colors.neutral[700] },
});
