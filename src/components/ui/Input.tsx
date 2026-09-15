import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { colors, radius } from '@/design/tokens';
import { AlertCircle } from 'lucide-react-native';

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
}

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  required,
  editable = true,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);
  const hasError = !!error;

  return (
    <View style={[styles.wrapper, containerStyle]}>
      {label && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
          {hint && !hasError && <Text style={styles.hint}>{hint}</Text>}
        </View>
      )}

      <View
        style={[
          styles.container,
          focused && styles.focused,
          hasError && styles.errorBorder,
          !editable && styles.disabled,
        ]}
      >
        {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
        <TextInput
          style={[styles.input, !editable && styles.inputDisabled]}
          placeholderTextColor={colors.neutral[400]}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          editable={editable}
          {...props}
        />
        {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
      </View>

      {hasError && (
        <View style={styles.errorRow}>
          <AlertCircle size={13} color={colors.error[500]} strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { fontSize: 13.5, fontWeight: '600', color: colors.neutral[700], letterSpacing: -0.1 },
  required: { color: colors.error[500] },
  hint: { fontSize: 12, color: colors.neutral[500] },
  container: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.25,
    borderColor: colors.border.strong,
    backgroundColor: '#FFFFFF',
  },
  focused: { borderColor: colors.primary[500], borderWidth: 1.5, backgroundColor: '#FFFFFF' },
  errorBorder: { borderColor: colors.error[500] },
  disabled: { backgroundColor: colors.neutral[100], borderColor: colors.neutral[200], opacity: 0.9 },
  leftIcon: { alignItems: 'center', justifyContent: 'center' },
  rightIcon: { alignItems: 'center', justifyContent: 'center' },
  input: { flex: 1, fontSize: 15, color: colors.neutral[900], paddingVertical: 12, minHeight: 50 },
  inputDisabled: { color: colors.neutral[500] },
  errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  errorText: { flex: 1, fontSize: 12.5, lineHeight: 17, color: colors.error[600], fontWeight: '500' },
});
