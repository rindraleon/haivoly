import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react-native';
import { useForgotPassword } from '@/hooks';
import { messageErreur } from '@/utils/erreur';
import { colors } from '@/theme';
import { Button } from '@/components/CommonComponent/Button';
import { Input } from '@/components/CommonComponent/Input';

import { styles } from './ForgotPasswordScreen.styles';
import { estEmailValide } from '@/utils/email';
import { i18n } from '@/i18n/instance';
type State = 'idle' | 'loading' | 'success' | 'error';

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [state, setState] = useState<State>('idle');

  const demandeReinitialisation = useForgotPassword();

  const validate = (): boolean => {
    const norm = email.trim();
    if (!norm) {
      setError(i18n.t('auth.lAdresseEmailObligatoire'));
      return false;
    }
    if (!estEmailValide(norm)) {
      setError('Adresse email invalide.');
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    setGeneralError(undefined);
    if (!validate()) return;
    setState('loading');
    try {
      await demandeReinitialisation.mutateAsync(email.trim());
      setState('success');
    } catch (error) {
      setGeneralError(
        messageErreur(
          error,
          t('auth.forgot.echec'),
        ),
      );
      setState('error');
    }
  };

  if (state === 'success') {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollSuccess} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={32} color={colors.success[600]} strokeWidth={2} />
            </View>
            <Text style={styles.successTitle}>{t('auth.forgot.emailEnvoye')}</Text>
            <Text style={styles.successDesc}>
              Si un compte est associé à <Text style={{ fontWeight: '700', color: colors.neutral[900] }}>{email.trim()}</Text>, vous
              recevrez un lien de réinitialisation. Pensez à vérifier vos spams.
            </Text>

            <View style={{ gap: 10, alignSelf: 'stretch', marginTop: 8 }}>
              <Button onPress={() => router.replace('/(auth)/login' as any)} fullWidth>
                Retour à la connexion
              </Button>
              <Pressable
                onPress={() => {
                  setState('idle');
                  setGeneralError(undefined);
                }}
                style={styles.linkBtn}
              >
                <Text style={styles.linkText}>{t('auth.forgot.renvoyer')}</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Pressable onPress={() => router.replace('/(auth)/login' as any)} style={styles.backBtn} hitSlop={8}>
            <ArrowLeft size={18} color={colors.neutral[700]} />
            <Text style={styles.backText}>{t('auth.retourConnexion')}</Text>
          </Pressable>

          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Mail size={22} color={colors.primary[600]} strokeWidth={1.9} />
              </View>
              <Text style={styles.title}>{t('auth.forgot.titre')}</Text>
              <Text style={styles.subtitle}>
                Entrez votre adresse email pour recevoir un lien permettant de réinitialiser votre mot de passe.
              </Text>
            </View>

            {generalError && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color={colors.error[600]} />
                <Text style={styles.errorText}>{generalError}</Text>
              </View>
            )}

            <View style={styles.form}>
              <Input
                label="Adresse email"
                placeholder="exemple@email.com"
                value={email}
                onChangeText={(v) => {
                  setEmail(v);
                  if (error) setError(undefined);
                  if (generalError) setGeneralError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="email"
                editable={state !== 'loading'}
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                error={error}
                required
                leftIcon={<Mail size={18} color={colors.neutral[500]} />}
              />

              <Button
                onPress={handleSubmit}
                loading={state === 'loading'}
                fullWidth
                size="lg"
                leftIcon={!state || state === 'idle' ? <Send size={18} color="#FFFFFF" strokeWidth={2} /> : undefined}
              >
                {state === 'loading' ? 'Envoi...' : 'Envoyer le lien'}
              </Button>

              <View style={styles.helpBox}>
                <Text style={styles.helpTitle}>{t('auth.forgot.aideTitre')}</Text>
                <Text style={styles.helpText}>{t('auth.forgot.aideTexte')}</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} Haivoly</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

