/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { AlertCircle, Check, CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react-native';
import { resetPassword } from '@/api/auth';
import { colors, radius } from '@/design/tokens';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';

export default function ResetPasswordScreen() {
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [token, setToken] = useState(tokenParam || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ newPassword?: string; confirmPassword?: string; general?: string }>({});
  const [state, setState] = useState<'form' | 'loading' | 'success'>('form');

  useEffect(() => {
    if (tokenParam) setToken(tokenParam);
  }, [tokenParam]);

  const checks = useMemo(() => {
    return {
      len: newPassword.length >= 8,
      upper: /[A-Z]/.test(newPassword),
      lower: /[a-z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      match: newPassword.length > 0 && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!token.trim()) e.general = 'Le lien est invalide ou incomplet. Veuillez refaire une demande.';
    if (!newPassword) e.newPassword = 'Le nouveau mot de passe est obligatoire.';
    else if (!checks.len) e.newPassword = 'Au moins 8 caractères.';
    else if (!checks.upper || !checks.lower || !checks.number) e.newPassword = 'Ajoutez majuscule, minuscule et chiffre.';
    if (!confirmPassword) e.confirmPassword = 'Veuillez confirmer le mot de passe.';
    else if (newPassword !== confirmPassword) e.confirmPassword = 'Les mots de passe ne correspondent pas.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setErrors({});
    if (!validate()) return;
    setState('loading');
    try {
      await resetPassword({ token: token.trim(), newPassword, confirmPassword });
      setState('success');
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      let message = 'Le lien est invalide ou a expiré.';
      if (Array.isArray(msg)) message = msg.join('\n');
      else if (typeof msg === 'string') message = msg;
      setErrors({ general: message });
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
            <Text style={styles.successTitle}>Mot de passe réinitialisé</Text>
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
              <Text style={styles.title}>Réinitialiser votre mot de passe</Text>
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
                  <Text style={styles.tokenLabel}>Token (depuis l'email)</Text>
                  <Text style={styles.tokenHint}>Collez le token reçu par email si le lien ne s'est pas ouvert automatiquement.</Text>
                </View>
              )}

              <PasswordInput
                label="Nouveau mot de passe"
                placeholder="Au moins 8 caractères"
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
                  <CheckItem valid={checks.len} text="Au moins 8 caractères" />
                  <CheckItem valid={checks.upper} text="Une majuscule" />
                  <CheckItem valid={checks.lower} text="Une minuscule" />
                  <CheckItem valid={checks.number} text="Un chiffre" />
                </View>
              )}

              <PasswordInput
                label="Confirmer le mot de passe"
                placeholder="Répétez le mot de passe"
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
                    {checks.match ? 'Les mots de passe correspondent' : 'Les mots de passe ne correspondent pas'}
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
                {state === 'loading' ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
              </Button>

              <Pressable onPress={() => router.replace('/(auth)/login' as any)} style={styles.link}>
                <Text style={styles.linkText}>Retour à la connexion</Text>
              </Pressable>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} Haivoly</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function CheckItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkIcon, valid && styles.checkIconValid]}>
        <Check size={11} color={valid ? colors.primary[700] : colors.neutral[400]} strokeWidth={3} />
      </View>
      <Text style={[styles.checkText, valid && styles.checkTextValid]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 28, paddingBottom: 28, gap: 16 },
  scrollSuccess: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 22,
    gap: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  header: { alignItems: 'center', gap: 10 },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: '#D1FADF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.4, textAlign: 'center' },
  subtitle: { fontSize: 13.5, lineHeight: 19, color: colors.neutral[500], textAlign: 'center', maxWidth: 320 },
  errorBanner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: radius.md,
    padding: 12,
  },
  errorText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.error[700], fontWeight: '600' },
  form: { gap: 14 },
  tokenBox: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: 12,
    gap: 4,
  },
  tokenLabel: { fontSize: 12, fontWeight: '700', color: colors.neutral[700] },
  tokenHint: { fontSize: 12, lineHeight: 16, color: colors.neutral[500] },
  checks: { gap: 6 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconValid: { backgroundColor: colors.primary[50], borderWidth: 1, borderColor: colors.primary[200] },
  checkText: { fontSize: 12, color: colors.neutral[500] },
  checkTextValid: { color: colors.primary[700], fontWeight: '600' },
  matchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderRadius: radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  matchOk: { backgroundColor: colors.success[50], borderColor: '#ABEFC6' },
  matchKo: { backgroundColor: colors.neutral[100], borderColor: colors.border.default },
  matchText: { fontSize: 12.5, fontWeight: '600' },
  matchTextOk: { color: colors.success[700] },
  matchTextKo: { color: colors.neutral[500] },
  link: { alignSelf: 'center', paddingVertical: 6 },
  linkText: { fontSize: 13, fontWeight: '700', color: colors.primary[600] },
  footer: { textAlign: 'center', fontSize: 11.5, color: colors.neutral[400] },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  successIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.success[50],
    borderWidth: 1,
    borderColor: '#ABEFC6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 20, fontWeight: '800', color: colors.neutral[900] },
  successDesc: { fontSize: 13.5, lineHeight: 20, color: colors.neutral[600], textAlign: 'center', maxWidth: 340 },
});
