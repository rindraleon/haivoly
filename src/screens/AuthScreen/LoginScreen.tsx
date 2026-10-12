import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { useLogin } from '@/hooks/auth/useLogin';
import { saveToken } from '@/storage/authStorage';
import { reinitialiserExpirationSession } from '@/services/http';
import { colors } from '@/theme';
import { LoginHeader } from '@/components/AuthComponent/LoginHeader';
import { LoginForm } from '@/components/AuthComponent/LoginForm';

import { styles } from './LoginScreen.styles';
import { estEmailValide } from '@/utils/email';
import { erreurChamp, messageErreur } from '@/utils/erreur';
type FieldErrors = { email?: string; password?: string; general?: string };

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const loginMutation = useLogin();

  const validate = (): boolean => {
    const e: FieldErrors = {};
    const norm = email.trim();
    if (!norm) e.email = t('auth.login.emailObligatoire');
    else if (!estEmailValide(norm)) e.email = t('auth.login.emailInvalide');
    if (!password) e.password = t('auth.login.motDePasseObligatoire');
    else if (password.length < 6) e.password = t('auth.login.motDePasseCourt');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = () => {
    setErrors({});
    if (!validate()) return;

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: async (data) => {
          try {
            await saveToken(data.access_token);
            // Nouvelle session : la prochaine expiration devra de nouveau être
            // signalée à l'utilisateur.
            reinitialiserExpirationSession();
            router.replace('/(app)/home' as any);
          } catch {
            setErrors({ general: t('auth.login.echecSession') });
          }
        },
        onError: (error) => {
          setErrors({
            email: erreurChamp(error, 'email'),
            password: erreurChamp(error, 'password'),
            general: messageErreur(error, t('auth.login.identifiantsInvalides')),
          });
        },
      },
    );
  };

  const isLoading = loginMutation.isPending;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <LoginHeader />

          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.hTitle}>{t('auth.login.bienvenue')}</Text>
                <Text style={styles.hSubtitle}>{t('auth.login.sousTitre')}</Text>
              </View>

              {errors.general && (
                <View style={styles.bannerError}>
                  <AlertCircle size={18} color={colors.error[600]} />
                  <Text style={styles.bannerText}>{errors.general}</Text>
                </View>
              )}

              <LoginForm
                email={email}
                password={password}
                errors={errors}
                loading={isLoading}
                onEmailChange={(v) => {
                  setEmail(v);
                  if (errors.email || errors.general) setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                }}
                onPasswordChange={(v) => {
                  setPassword(v);
                  if (errors.password || errors.general) setErrors((p) => ({ ...p, password: undefined, general: undefined }));
                }}
                onSubmit={handleLogin}
              />
            </View>

            <Text style={styles.footer}>{t('auth.piedDePage', { annee: new Date().getFullYear() })}</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

