import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { LogIn, Mail } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Button } from '@/components/ui/Button';
import { colors, radius } from '@/design/tokens';

type Props = {
  email: string;
  password: string;
  errors: { email?: string; password?: string; general?: string };
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
};

export function LoginForm({ email, password, errors, loading, onEmailChange, onPasswordChange, onSubmit }: Props) {
  return (
    <View style={styles.form}>
      <Input
        label="Email"
        placeholder="Adresse email"
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!loading}
        returnKeyType="next"
        error={errors.email}
        leftIcon={<Mail size={18} color="#98A2B3" />}
      />

      <View style={{ gap: 6 }}>
        <PasswordInput
          label="Password"
          placeholder="Mot de passe"
          value={password}
          onChangeText={onPasswordChange}
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={errors.password}
        />
        <Pressable onPress={() => router.push('/(auth)/forgot-password' as any)} hitSlop={8} style={styles.forgotWrap}>
          <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
        </Pressable>
      </View>

      <Button onPress={onSubmit} loading={loading} fullWidth size="lg" leftIcon={<LogIn size={18} color="white" />}>
        {loading ? 'Connexion...' : 'Se connecter'}
      </Button>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>ou</Text>
        <View style={styles.line} />
      </View>

      <Pressable
        onPress={() => router.push('/(auth)/register' as any)}
        disabled={loading}
        style={({ pressed }) => [styles.outlineBtn, pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] }]}
      >
        <Text style={styles.outlineText}>Créer un compte</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 14 },
  forgotWrap: { alignSelf: 'flex-end', paddingVertical: 2, marginTop: 2 },
  forgotText: { fontSize: 13, fontWeight: '600', color: '#2E7D32' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4 },
  line: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  or: { fontSize: 12.5, color: '#9CA3AF', fontWeight: '600' },
  outlineBtn: {
    minHeight: 52,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#2E7D32',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineText: { fontSize: 15, fontWeight: '700', color: '#2E7D32' },
});
