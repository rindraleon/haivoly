import { useState } from 'react';
import { i18n } from '@/i18n/instance';
import { Pressable } from 'react-native';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react-native';
import { Input } from './Input';
import { useTheme } from '@/hooks/common/useTheme';
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
  label = i18n.t('libelles.motDePasse'),
  error,
  hint,
  containerStyle,
  required,
  showIcon = true,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);
  const { jetons } = useTheme();

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
            color={error ? jetons.erreur.base : focused ? jetons.primaire.base : jetons.texte.secondaire}
            strokeWidth={1.9}
          />
        ) : undefined
      }
      rightIcon={
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          style={{ padding: 4 }}
          accessibilityLabel={visible ? i18n.t('auth.masquerMotPasse') : 'Afficher le mot de passe'}
          accessibilityRole="button"
        >
          {visible ? <EyeOff size={19} color={jetons.texte.secondaire} /> : <Eye size={19} color={jetons.texte.secondaire} />}
        </Pressable>
      }
      {...props}
    />
  );
}
