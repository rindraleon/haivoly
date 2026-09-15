/* eslint-disable react/no-unescaped-entities */
import { useMemo, useState } from 'react';
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
import { AlertCircle, Check, Sprout } from 'lucide-react-native';
import { useRegister } from '@/hooks/useRegister';
import { colors, radius } from '@/design/tokens';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';

type Errors = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  general?: string;
};

export default function RegisterScreen() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Errors>({});

  const mutation = useRegister();

  const pwdChecks = useMemo(() => {
    return {
      len: password.length >= 8,
      upper: /[A-Z]/.test(password),
      lower: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    };
  }, [password]);

  const validate = (): boolean => {
    const e: Errors = {};
    const clean = (v: string) => v.trim();
    if (!clean(nom)) e.nom = 'Le nom est obligatoire.';
    else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(clean(nom))) e.nom = 'Nom invalide.';
    if (!clean(prenom)) e.prenom = 'Le prénom est obligatoire.';
    else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(clean(prenom))) e.prenom = 'Prénom invalide.';
    if (!clean(email)) e.email = "L'email est obligatoire.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(email))) e.email = 'Email invalide.';
    if (clean(telephone)) {
      const phone = clean(telephone).replace(/[\s()-]/g, '');
      if (!/^\+?[0-9]+$/.test(phone)) e.telephone = 'Téléphone invalide.';
      else if (phone.replace('+', '').length < 8) e.telephone = 'Téléphone trop court.';
    }
    if (!password) e.password = 'Le mot de passe est obligatoire.';
    else if (!pwdChecks.len) e.password = 'Au moins 8 caractères.';
    else if (!pwdChecks.upper || !pwdChecks.lower || !pwdChecks.number) e.password = 'Ajoutez majuscule, minuscule et chiffre.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    setErrors({});
    if (!validate()) return;
    mutation.mutate(
      { nom: nom.trim(), prenom: prenom.trim(), email: email.trim(), telephone: telephone.trim() || undefined, password },
      {
        onSuccess: () => router.replace('/(auth)/login' as any),
        onError: (err: any) => {
          const msg = err?.response?.data?.message;
          let message = "Impossible de créer le compte.";
          if (Array.isArray(msg)) message = msg.join('\n');
          else if (typeof msg === 'string') message = msg;
          setErrors({ general: message });
        },
      },
    );
  };

  const isLoading = mutation.isPending;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <View style={styles.brandBand}>
            <View style={styles.logoCircle}>
              <Sprout size={26} color="#FFFFFF" strokeWidth={2.2} />
            </View>
            <Text style={styles.brandTitle}>Haivoly</Text>
            <Text style={styles.brandSubtitle}>Créez votre espace agricole</Text>
          </View>

          <View style={styles.cardWrap}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.hTitle}>Créer un compte</Text>
                <Text style={styles.hSubtitle}>Rejoignez des milliers d'agriculteurs qui pilotent leurs parcelles avec Haivoly.</Text>
              </View>

              {errors.general && (
                <View style={styles.banner}>
                  <AlertCircle size={18} color={colors.error[600]} />
                  <Text style={styles.bannerText}>{errors.general}</Text>
                </View>
              )}

              <View style={styles.form}>
                <View style={styles.row}>
                  <Input
                    label="Nom"
                    placeholder="Rakoto"
                    value={nom}
                    onChangeText={(v) => {
                      setNom(v);
                      if (errors.nom || errors.general) setErrors((p) => ({ ...p, nom: undefined, general: undefined }));
                    }}
                    error={errors.nom}
                    containerStyle={{ flex: 1 }}
                    editable={!isLoading}
                    required
                  />
                  <Input
                    label="Prénom"
                    placeholder="Hery"
                    value={prenom}
                    onChangeText={(v) => {
                      setPrenom(v);
                      if (errors.prenom || errors.general) setErrors((p) => ({ ...p, prenom: undefined, general: undefined }));
                    }}
                    error={errors.prenom}
                    containerStyle={{ flex: 1 }}
                    editable={!isLoading}
                    required
                  />
                </View>

                <Input
                  label="Adresse email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChangeText={(v) => {
                    setEmail(v);
                    if (errors.email || errors.general) setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  error={errors.email}
                  required
                />

                <Input
                  label="Téléphone"
                  placeholder="+261 34 00 000 00"
                  value={telephone}
                  onChangeText={(v) => {
                    setTelephone(v);
                    if (errors.telephone) setErrors((p) => ({ ...p, telephone: undefined }));
                  }}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                  hint="Optionnel"
                  error={errors.telephone}
                />

                <PasswordInput
                  label="Mot de passe"
                  placeholder="Au moins 8 caractères"
                  value={password}
                  onChangeText={(v) => {
                    setPassword(v);
                    if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                  }}
                  editable={!isLoading}
                  error={errors.password}
                  required
                />

                {password.length > 0 && (
                  <View style={styles.pwdChecks}>
                    <PwdCheck valid={pwdChecks.len} text="Au moins 8 caractères" />
                    <PwdCheck valid={pwdChecks.upper} text="Une majuscule" />
                    <PwdCheck valid={pwdChecks.lower} text="Une minuscule" />
                    <PwdCheck valid={pwdChecks.number} text="Un chiffre" />
                  </View>
                )}

                <Button onPress={handleRegister} loading={isLoading} fullWidth size="lg">
                  {isLoading ? 'Création...' : 'Créer mon compte'}
                </Button>

                <View style={styles.loginRow}>
                  <Text style={styles.loginHint}>Déjà un compte ?</Text>
                  <Pressable onPress={() => router.replace('/(auth)/login' as any)} disabled={isLoading}>
                    <Text style={styles.loginLink}>Se connecter</Text>
                  </Pressable>
                </View>
              </View>
            </View>

            <Text style={styles.footer}>© {new Date().getFullYear()} Haivoly</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function PwdCheck({ valid, text }: { valid: boolean; text: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkIcon, valid && styles.checkValid]}>
        <Check size={11} color={valid ? colors.primary[700] : colors.neutral[400]} strokeWidth={3} />
      </View>
      <Text style={[styles.checkText, valid && styles.checkTextValid]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { flexGrow: 1 },
  brandBand: {
    backgroundColor: colors.primary[500],
    paddingTop: 48,
    paddingBottom: 22,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 6,
  },
  logoCircle: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: { fontSize: 28, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.6 },
  brandSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.92)', fontWeight: '500' },
  cardWrap: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 24, gap: 12, marginTop: -10 },
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
  hTitle: { fontSize: 21, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.4 },
  hSubtitle: { fontSize: 13.5, lineHeight: 19, color: colors.neutral[500] },
  banner: {
    flexDirection: 'row',
    gap: 10,
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: radius.md,
    padding: 12,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.error[700], fontWeight: '600' },
  form: { gap: 14 },
  row: { flexDirection: 'row', gap: 12 },
  pwdChecks: { gap: 6, marginTop: 2 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkValid: { backgroundColor: colors.primary[50], borderWidth: 1, borderColor: colors.primary[200] },
  checkText: { fontSize: 12, color: colors.neutral[500] },
  checkTextValid: { color: colors.primary[700], fontWeight: '600' },
  loginRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 4 },
  loginHint: { fontSize: 13, color: colors.neutral[500] },
  loginLink: { fontSize: 13, fontWeight: '700', color: colors.primary[600] },
  footer: { textAlign: 'center', fontSize: 11.5, color: colors.neutral[400] },
});
