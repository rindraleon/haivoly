/* eslint-disable react/no-unescaped-entities */
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { AlertCircle, ArrowLeft, CheckCircle2, Mail, Send } from 'lucide-react-native';
import { forgotPassword } from '@/api/auth';
import { colors, radius } from '@/design/tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type State = 'idle' | 'loading' | 'success' | 'error';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [generalError, setGeneralError] = useState<string | undefined>();
  const [state, setState] = useState<State>('idle');
  const [devToken, setDevToken] = useState<string | undefined>();

  const validate = (): boolean => {
    const norm = email.trim();
    if (!norm) {
      setError("L'adresse email est obligatoire.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(norm)) {
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
      const res = await forgotPassword({ email: email.trim() });
      setState('success');
      if ((res as any)._devToken) setDevToken((res as any)._devToken);
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      let message = 'Une erreur est survenue. Vérifiez votre connexion.';
      if (Array.isArray(msg)) message = msg.join('\n');
      else if (typeof msg === 'string') message = msg;
      setGeneralError(message);
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
            <Text style={styles.successTitle}>Email envoyé</Text>
            <Text style={styles.successDesc}>
              Si un compte est associé à <Text style={{ fontWeight: '700', color: colors.neutral[900] }}>{email.trim()}</Text>, vous
              recevrez un lien de réinitialisation. Pensez à vérifier vos spams.
            </Text>

            {devToken && (
              <View style={styles.devBox}>
                <Text style={styles.devLabel}>Mode développement — token</Text>
                <Text selectable style={styles.devToken}>
                  {devToken}
                </Text>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => router.push(`/(auth)/reset-password?token=${encodeURIComponent(devToken)}` as any)}
                  style={{ marginTop: 8 }}
                >
                  Ouvrir la réinitialisation
                </Button>
              </View>
            )}

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
                <Text style={styles.linkText}>Renvoyer un lien</Text>
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
            <Text style={styles.backText}>Retour à la connexion</Text>
          </Pressable>

          <View style={styles.card}>
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Mail size={22} color={colors.primary[600]} strokeWidth={1.9} />
              </View>
              <Text style={styles.title}>Mot de passe oublié ?</Text>
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
                <Text style={styles.helpTitle}>Vous ne recevez pas l'email ?</Text>
                <Text style={styles.helpText}>• Vérifiez l'orthographe de votre adresse{'\n'}• Consultez vos courriers indésirables{'\n'}• Le lien expire après 60 minutes</Text>
              </View>
            </View>
          </View>

          <Text style={styles.footer}>© {new Date().getFullYear()} Haivoly</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { flexGrow: 1, paddingHorizontal: 20, paddingTop: 24, paddingBottom: 28, gap: 18 },
  scrollSuccess: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 20, paddingVertical: 32 },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  backText: { fontSize: 13, fontWeight: '600', color: colors.neutral[700] },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 22,
    gap: 20,
    boxShadow: '0 8px 32px rgba(16,24,40,.10)',
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
  title: { fontSize: 21, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.4, textAlign: 'center' },
  subtitle: { fontSize: 13.5, lineHeight: 20, color: colors.neutral[500], textAlign: 'center', maxWidth: 320 },
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
  form: { gap: 16 },
  helpBox: {
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: 14,
    gap: 6,
  },
  helpTitle: { fontSize: 12.5, fontWeight: '700', color: colors.neutral[700] },
  helpText: { fontSize: 12.5, lineHeight: 18, color: colors.neutral[500] },
  footer: { textAlign: 'center', fontSize: 11.5, color: colors.neutral[400], marginTop: 4 },
  // success
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    boxShadow: '0 8px 32px rgba(16,24,40,.10)',
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
  devBox: {
    alignSelf: 'stretch',
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.md,
    padding: 12,
    gap: 6,
  },
  devLabel: { fontSize: 11, fontWeight: '700', color: colors.neutral[500], textTransform: 'uppercase', letterSpacing: 0.6 },
  devToken: { fontSize: 11, color: colors.neutral[800], fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  linkBtn: { alignSelf: 'center', paddingVertical: 6 },
  linkText: { fontSize: 13, fontWeight: '700', color: colors.primary[600] },
});
