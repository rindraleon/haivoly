/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { i18n } from '@/i18n/instance';
import { useTranslation } from 'react-i18next';
import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react-native';
import { useResetPassword } from '@/hooks';
import { messageErreur } from '@/utils/erreur';
import { colors } from '@/theme';
import { Button } from '@/components/CommonComponent/Button';
import { PasswordInput } from '@/components/CommonComponent/PasswordInput';

import { styles } from './ResetPasswordScreen.styles';
import { PasswordRuleItem } from '@/components/AuthComponent/PasswordRuleItem';
export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(tokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});
  const [state, setState] = useState<'form' | 'loading' | 'success'>('form');

  const reinitialisation = useResetPassword();

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const checks = useMemo(() => {
    return {
      len: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /\d/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!token.trim()) e.general = i18n.t('divers.lienInvalideOuIncomplet');
    if (!newPassword) e.newPassword = i18n.t('auth.nouveauMotPasseObligatoire');
    else if (!checks.len) e.newPassword = t('auth.reset.motDePasseCourt');
    else if (!checks.upper || !checks.lower || !checks.number) e.newPassword = 'Ajoutez majuscule, minuscule et chiffre.';
    if (!confirmPassword) e.confirmPassword = i18n.t('auth.veuillezConfirmerMotPasse');
    else if (newPassword !== confirmPassword) e.confirmPassword = i18n.t('divers.motsPasseNeCorrespondent');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!validate()) return;
    setState('loading');
    try {
      await reinitialisation.mutateAsync({
        token: token.trim(),
        password: newPassword,
        confirmPassword,
      });
      setState('success');
    } catch (error) {
      setErrors({
        general: messageErreur(error, t('auth.reset.lienInvalide')),
      });
      setState('form');
    }
  };

  if (state === 'success') {
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.scrollSuccess} showsVerticalScrollIndicator={false}>
          <View style={styles.successCard}>
            <View style={styles.successIcon}>
              <CheckCircle2 size={30} color={colors.success[600]} strokeWidth={2} />
            </View>
            <Text style={styles.successTitle}>{t('auth.reset.reinitialise')}</Text>
            <Text style={styles.successDesc}>
              Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter avec vos nouveaux
              identifiants.
            </Text>
            <Button onPress={() => router.replace('/(auth)/login' as any)} fullWidth size="lg" style={{ marginTop: 8 }}>
              Se connecter
            </Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <KeyRound size={22} color={colors.primary[600]} strokeWidth={1.9} />
              </View>
              <Text style={styles.title}>{t('auth.reset.titre')}</Text>
              <Text style={styles.subtitle}>Choisissez un mot de passe robuste que vous n'utilisez nulle part ailleurs.</Text>
            </View>

            {errors.general && (
              <View style={styles.errorBanner}>
                <AlertCircle size={18} color={colors.error[600]} />
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            <View style={styles.form}>
              {/* Token hidden if from URL; allow manual paste for deep-link fallback */}
              {!tokenParam && (
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenLabel}>{t('auth.reset.tokenLabel')}</Text>
                  <Text style={styles.tokenHint}>Collez le token reçu par email si le lien ne s'est pas ouvert automatiquement.</Text>
                </View>
              )}

              <PasswordInput
                label={i18n.t('libelles.nouveauMotDePasse')}
                placeholder={t('auth.reset.placeholderLongueur')}
                value={newPassword}
                onChangeText={(v) => {
                  setNewPassword(v);
                  if (errors.newPassword || errors.general) setErrors((p) => ({ ...p, newPassword: undefined, general: undefined }));
                }}
                error={errors.newPassword}
                editable={state !== 'loading'}
                required
              />

              {newPassword.length > 0 && (
                <View style={styles.checks}>
                  <PasswordRuleItem valid={checks.len} text={t('auth.register.securite.regleLongueur')} />
                  <PasswordRuleItem valid={checks.upper} text={i18n.t('libelles.uneMajuscule')} />
                  <PasswordRuleItem valid={checks.lower} text={i18n.t('libelles.uneMinuscule')} />
                  <PasswordRuleItem valid={checks.number} text={i18n.t('libelles.unChiffre')} />
                </View>
              )}

              <PasswordInput
                label={i18n.t('libelles.confirmerMotDePasse')}
                placeholder={t('auth.reset.confirmer')}
                value={confirmPassword}
                onChangeText={(v) => {
                  setConfirmPassword(v);
                  if (errors.confirmPassword || errors.general) setErrors((p) => ({ ...p, confirmPassword: undefined, general: undefined }));
                }}
                error={errors.confirmPassword}
                editable={state !== 'loading'}
                required
              />

              {confirmPassword.length > 0 && (
                <View style={[styles.matchRow, checks.match ? styles.matchOk : styles.matchKo]}>
                  <ShieldCheck size={14} color={checks.match ? colors.success[600] : colors.neutral[400]} />
                  <Text style={[styles.matchText, checks.match ? styles.matchTextOk : styles.matchTextKo]}>
                    {checks.match ? i18n.t('divers.motsPasseCorrespondent') : 'Les mots de passe ne correspondent pas'}
                  </Text>
                </View>
              )}

              <Button
                onPress={handleSubmit}
                loading={state === 'loading'}
                fullWidth
                size="lg"
                disabled={state === 'loading'}
              >
                {state === 'loading' ? t('auth.reset.enCours') : t('auth.reset.soumettre')}
              </Button>

              <Pressable onPress={() => router.replace('/(auth)/login' as any)} style={styles.link}>
                <Text style={styles.linkText}>{t('auth.retourConnexion')}</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} Haivoly</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

