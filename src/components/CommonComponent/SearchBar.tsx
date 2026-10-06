import React from 'react';
import { Pressable, StyleSheet, TextInput, View, type ViewStyle } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { colors, radius } from '@/theme';

interface SearchBarProps {
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  onClear?: () => void;
  style?: ViewStyle;
  autoFocus?: boolean;
}

export function SearchBar({ value, onChangeText, placeholder = 'Rechercher...', onClear, style, autoFocus }: SearchBarProps) {
  return (
    <View style={[styles.container, style]}>
      <Search size={18} color={colors.neutral[500]} strokeWidth={2} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[400]}
        style={styles.input}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        autoFocus={autoFocus}
      />
      {value.length > 0 && (
        <Pressable onPress={() => (onClear ? onClear() : onChangeText(''))} hitSlop={8} style={styles.clear}>
          <X size={16} color={colors.neutral[500]} strokeWidth={2.2} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
    paddingHorizontal: 13,
    borderRadius: radius.md,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
  },
  input: { flex: 1, fontSize: 14.5, color: colors.neutral[900], paddingVertical: 10 },
  clear: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
