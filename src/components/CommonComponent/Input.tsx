import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { radius } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';
import { AlertCircle } from 'lucide-react-native';

export type InputSize = 'sm' | 'md';

interface InputProps extends TextInputProps {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerStyle?: ViewStyle;
  required?: boolean;
  size?: InputSize;
}

/** Hauteurs et corps de texte par variante — centralisés, jamais redéfinis par écran. */
const DIMENSIONS: Record<
  InputSize,
  { containerMinHeight: number; inputMinHeight: number; fontSize: number; paddingVertical: number; labelSize: number; gap: number }
> = {
  sm: { containerMinHeight: 42, inputMinHeight: 40, fontSize: 14, paddingVertical: 8, labelSize: 12.5, gap: 5 },
  md: { containerMinHeight: 52, inputMinHeight: 50, fontSize: 15, paddingVertical: 12, labelSize: 13.5, gap: 7 },
};

export function Input({
  label,
  hint,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  required,
  size = 'md',
  editable = true,
  ...props
}: InputProps) {
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);
  const [focused, setFocused] = useState(false);
  const hasError = !!error;
  const d = DIMENSIONS[size];

  const containerStyleParTaille: ViewStyle = {
    minHeight: d.containerMinHeight,
    gap: size === 'sm' ? 8 : 10,
  };

  const inputStyleParTaille: TextStyle = {
    fontSize: d.fontSize,
    paddingVertical: d.paddingVertical,
    minHeight: d.inputMinHeight,
  };

  return (
    <View style={[styles.wrapper, { gap: d.gap }, containerStyle]}>
      {label ? (
        <View style={styles.labelRow}>
          {/* Le label reste au-dessus du champ : il ne disparaît jamais,
              même lorsque l'utilisateur saisit (contrairement au placeholder). */}
          <Text style={[styles.label, { fontSize: d.labelSize }]}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
          {hint && !hasError ? <Text style={styles.hint}>{hint}</Text> : null}
        </View>
      ) : null}

      <View
        style={[
          styles.container,
          containerStyleParTaille,
          focused && styles.focused,
          hasError && styles.errorBorder,
          !editable && styles.disabled,
        ]}
      >
        {leftIcon ? <View style={styles.leftIcon}>{leftIcon}</View> : null}
        <TextInput
          style={[styles.input, inputStyleParTaille, !editable && styles.inputDisabled]}
          placeholderTextColor={jetons.texte.discret}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          editable={editable}
          accessibilityLabel={label}
          {...props}
        />
        {rightIcon ? <View style={styles.rightIcon}>{rightIcon}</View> : null}
      </View>

      {hasError ? (
        <View style={styles.errorRow}>
          <AlertCircle size={13} color={jetons.erreur.base} strokeWidth={2} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

function creerStyles(jetons: Jetons) {
  return StyleSheet.create({
    wrapper: { gap: 7 },
    labelRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    // Label toujours visible et contrasté, en thème clair comme sombre.
    label: {
      fontSize: 13.5,
      fontWeight: '600',
      color: jetons.texte.principal,
      letterSpacing: -0.1,
    },
    required: { color: jetons.erreur.base },
    hint: { fontSize: 12, color: jetons.texte.secondaire },
    container: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      borderWidth: 1.25,
      borderColor: jetons.bordure.appuyee,
      backgroundColor: jetons.fond.carte,
    },
    focused: {
      borderColor: jetons.bordure.focus,
      borderWidth: 1.5,
      backgroundColor: jetons.fond.carte,
    },
    errorBorder: { borderColor: jetons.erreur.base },
    disabled: {
      backgroundColor: jetons.fond.attenue,
      borderColor: jetons.bordure.defaut,
      opacity: 0.9,
    },
    leftIcon: { alignItems: 'center', justifyContent: 'center' },
    rightIcon: { alignItems: 'center', justifyContent: 'center' },
    input: {
      flex: 1,
      fontSize: 15,
      color: jetons.texte.principal,
      paddingVertical: 12,
      minHeight: 50,
    },
    inputDisabled: { color: jetons.texte.secondaire },
    errorRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    errorText: {
      flex: 1,
      fontSize: 12.5,
      lineHeight: 17,
      color: jetons.erreur.texte,
      fontWeight: '500',
    },
  });
}
