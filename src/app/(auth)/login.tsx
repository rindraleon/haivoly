/**
 * LoginScreen — composition de composants
 * Écran orchestre navigation + hooks, UI déléguée aux components
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { useLogin } from '@/hooks/useLogin';
import { saveToken } from '@/storage/authStorage';
import { colors, radius } from '@/design/tokens';
import { LoginHeader } from '@/features/auth/components/LoginHeader';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { enqueue } from '@/features/sync/services/queue';

type FieldErrors = { email?: string; password?: string; general?: string };

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const loginMutation = useLogin();

  const validate = (): boolean => {
    const e: FieldErrors = {};
    const norm = email.trim();
    if (!norm) e.email = "L'adresse email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) e.email = 'Adresse email invalide.';
    if (!password) e.password = 'Le mot de passe est obligatoire.';
    else if (password.length < 6) e.password = 'Au moins 6 caractères.';
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
            // Historique offline : log action LOGIN pour suivi web
            await enqueue({
              actionType: 'OTHER' as any,
              entityType: 'UTILISATEUR',
              entityId: (data.utilisateur as any)?.id ?? null,
              payload: { action: 'LOGIN', email: email.trim(), timestamp: new Date().toISOString() },
            }).catch(() => {});
            router.replace('/(app)/home' as any);
          } catch {
            setErrors({ general: "Erreur lors de l'enregistrement de la session." });
          }
        },
        onError: (error: any) => {
          const msg = error?.response?.data?.message;
          let message = 'Email ou mot de passe incorrect.';
          if (Array.isArray(msg)) message = msg.join('\n');
          else if (typeof msg === 'string') message = msg;
          setErrors({ general: message });
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
                <Text style={styles.hTitle}>Bienvenue</Text>
                <Text style={styles.hSubtitle}>Connectez-vous pour accéder à vos vos exploitations.</Text>
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

            <Text style={styles.footer}>© {new Date().getFullYear()} Haivoly — Tous droits réservés</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  cardWrap: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 14, marginTop: -12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 20,
    gap: 18,
    boxShadow: '0 8px 32px rgba(16,24,40,.10)',
    elevation: 4,
  },
  header: { gap: 6 },
  hTitle: { fontSize: 22, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.5 },
  hSubtitle: { fontSize: 13.5, lineHeight: 19, color: colors.neutral[500] },
  bannerError: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: radius.md,
    padding: 12,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.error[700], fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 11.5, color: colors.neutral[400], marginTop: 2 },
});
