import React, { useState } from 'react';
import { Pressable } from 'react-native';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import { Input } from './Input';
import { colors } from '@/theme';
import type { TextInputProps, ViewStyle } from 'react-native';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  label?: string;
  error?: string;
  hint?: string;
  containerStyle?: ViewStyle;
  required?: boolean;
  showIcon?: boolean;
}

export function PasswordInput({
  label = 'Mot de passe',
  error,
  hint,
  containerStyle,
  required,
  showIcon = true,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <Input
      label={label}
      error={error}
      hint={hint}
      containerStyle={containerStyle}
      required={required}
      secureTextEntry={!visible}
      autoCapitalize="none"
      autoCorrect={false}
      textContentType="password"
      onFocus={(e) => {
        setFocused(true);
        props.onFocus?.(e as any);
      }}
      onBlur={(e) => {
        setFocused(false);
        props.onBlur?.(e as any);
      }}
      leftIcon={
        showIcon ? (
          <LockKeyhole
            size={19}
            color={error ? colors.error[500] : focused ? colors.primary[500] : colors.neutral[500]}
            strokeWidth={1.9}
          />
        ) : undefined
      }
      rightIcon={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          style={{ padding: 4 }}
          accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
          accessibilityRole="button"
        >
          {visible ? <EyeOff size={19} color={colors.neutral[500]} /> : <Eye size={19} color={colors.neutral[500]} />}
        </Pressable>
      }
      {...props}
    />
  );
}
