import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { MailCheck, ShieldCheck } from 'lucide-react-native';

import { authApi } from '@/services';
import { estEmailValide } from '@/utils/email';
import { messageErreur } from '@/utils/erreur';
import { colors, radius } from '@/theme';

function premier(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? '' : value ?? '';
}

export default function VerifyEmailScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    token?: string | string[];
    email?: string | string[];
    emailEnvoye?: string | string[];
  }>();
  const token = premier(params.token);
  const [email, setEmail] = useState(premier(params.email));
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendAccepted, setResendAccepted] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const timer = cooldown > 0
      ? setTimeout(() => setCooldown((seconds) => Math.max(0, seconds - 1)), 1000)
      : undefined;
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [cooldown]);

  const confirmAddress = async () => {
    if (!token) {
      setError(t('auth.verify.jetonManquant'));
      return;
    }
    setIsVerifying(true);
    setError('');
    try {
      await authApi.verifyEmail(token);
      setIsVerified(true);
    } catch (cause) {
      setError(messageErreur(cause, t('auth.verify.echecConfirmation')));
    } finally {
      setIsVerifying(false);
    }
  };

  const resend = async () => {
    const normalized = email.trim();
    if (!estEmailValide(normalized)) {
      setError(t('auth.verify.emailInvalide'));
      return;
    }
    setIsResending(true);
    setError('');
    setResendAccepted(false);
    try {
      await authApi.resendVerification(normalized);
      // L'API renvoie volontairement une réponse générique pour ne pas révéler
      // si l'adresse correspond à un compte.
      setResendAccepted(true);
      setCooldown(60);
    } catch (cause) {
      setError(messageErreur(cause, t('auth.verify.echecRenvoi')));
    } finally {
      setIsResending(false);
    }
  };

  const retourConnexion = () => router.replace('/(auth)/login' as never);

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            {isVerified ? (
              <ShieldCheck size={28} color={colors.primary[700]} />
            ) : (
              <MailCheck size={28} color={colors.primary[700]} />
            )}
          </View>
          <Text style={styles.title}>{t('auth.verify.titre')}</Text>
          <Text style={styles.subtitle}>{t('auth.verify.sousTitre')}</Text>

          {params.emailEnvoye === '0' && !isVerified && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>{t('auth.verify.envoiInitialEchoue')}</Text>
            </View>
          )}

          {!!error && (
            <View style={styles.error} accessibilityRole="alert">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {isVerified ? (
            <View style={styles.success} accessibilityLiveRegion="polite">
              <Text style={styles.successText}>{t('auth.verify.confirmationSucces')}</Text>
              <Pressable
                accessibilityRole="button"
                onPress={retourConnexion}
                style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
              >
                <Text style={styles.primaryText}>{t('auth.verify.retourConnexion')}</Text>
              </Pressable>
            </View>
          ) : (
            <>
              {!!token && (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => void confirmAddress()}
                  disabled={isVerifying}
                  style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
                >
                  {isVerifying ? (
                    <ActivityIndicator color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryText}>{t('auth.verify.confirmer')}</Text>
                  )}
                </Pressable>
              )}

              <View style={styles.divider} />
              <Text style={styles.sectionTitle}>{t('auth.verify.renvoyerTitre')}</Text>
              <Text style={styles.sectionSubtitle}>{t('auth.verify.renvoyerSousTitre')}</Text>
              <Text style={styles.fieldLabel}>{t('auth.verify.email')}</Text>
              <TextInput
                value={email}
                onChangeText={(value) => {
                  setEmail(value);
                  setError('');
                  setResendAccepted(false);
                }}
                style={styles.input}
                placeholder={t('auth.verify.emailPlaceholder')}
                placeholderTextColor={colors.neutral[400]}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                accessibilityLabel={t('auth.verify.email')}
                returnKeyType="send"
                onSubmitEditing={() => void resend()}
              />
              <Pressable
                accessibilityRole="button"
                onPress={() => void resend()}
                disabled={isResending || cooldown > 0}
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.pressed,
                  (isResending || cooldown > 0) && styles.disabled,
                ]}
              >
                {isResending ? (
                  <ActivityIndicator color={colors.primary[700]} />
                ) : (
                  <Text style={styles.secondaryText}>
                    {cooldown > 0
                      ? t('auth.verify.renvoiDans', { count: cooldown })
                      : t('auth.verify.renvoyer')}
                  </Text>
                )}
              </Pressable>
              {resendAccepted && (
                <Text style={styles.successText} accessibilityLiveRegion="polite">
                  {t('auth.verify.renvoiAccepte')}
                </Text>
              )}
            </>
          )}

          <Pressable accessibilityRole="link" onPress={retourConnexion} style={styles.backLink}>
            <Text style={styles.backText}>{t('auth.verify.retourConnexion')}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = {
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { flexGrow: 1, justifyContent: 'center' as const, padding: 20 },
  card: {
    width: '100%' as const,
    maxWidth: 480,
    alignSelf: 'center' as const,
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 22,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.primary[50],
  },
  title: { fontSize: 23, fontWeight: '800' as const, color: colors.neutral[900] },
  subtitle: { fontSize: 14, lineHeight: 20, color: colors.neutral[600] },
  notice: { padding: 12, borderRadius: radius.md, backgroundColor: colors.warning[50] },
  noticeText: { color: colors.warning[600], fontSize: 13, lineHeight: 18 },
  error: {
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error[200],
    backgroundColor: colors.error[50],
  },
  errorText: { color: colors.error[700], fontSize: 13, lineHeight: 18 },
  success: { gap: 14 },
  successText: { color: colors.primary[700], fontSize: 13, lineHeight: 19, fontWeight: '600' as const },
  primaryButton: {
    minHeight: 48,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
  },
  primaryText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' as const },
  secondaryButton: {
    minHeight: 46,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingHorizontal: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
    backgroundColor: colors.primary[50],
  },
  secondaryText: { color: colors.primary[700], fontSize: 13.5, fontWeight: '700' as const },
  pressed: { opacity: 0.78 },
  disabled: { opacity: 0.55 },
  divider: { height: 1, backgroundColor: colors.border.default, marginVertical: 4 },
  sectionTitle: { color: colors.neutral[800], fontSize: 16, fontWeight: '800' as const },
  sectionSubtitle: { color: colors.neutral[500], fontSize: 13, lineHeight: 18 },
  fieldLabel: { color: colors.neutral[700], fontSize: 13, fontWeight: '700' as const, marginBottom: -8 },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    color: colors.neutral[900],
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  backLink: { minHeight: 44, justifyContent: 'center' as const, alignItems: 'center' as const },
  backText: { color: colors.primary[700], fontSize: 13, fontWeight: '700' as const },
};
