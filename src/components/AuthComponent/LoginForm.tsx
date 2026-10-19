import { View, Text, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/CommonComponent/Input';
import { PasswordInput } from '@/components/CommonComponent/PasswordInput';
import { Button } from '@/components/CommonComponent/Button';
import { colors, radius } from '@/theme';

type Props = {
  email: string;
  password: string;
  errors: { email?: string; password?: string; general?: string };
  loading: boolean;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onSubmit: () => void;
};

export function LoginForm({
  email,
  password,
  errors,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.form}>
      <Input
        testID="login-email"
        label={t('auth.login.emailLabel')}
        placeholder={t('auth.login.emailPlaceholder')}
        value={email}
        onChangeText={onEmailChange}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        editable={!loading}
        returnKeyType="next"
        error={errors.email}
        required
      />

      <View style={{ gap: 6 }}>
        <PasswordInput
          testID="login-password"
          label={t('libelles.motDePasse')}
          placeholder={t('libelles.votreMotDePasse')}
          value={password}
          onChangeText={onPasswordChange}
          editable={!loading}
          returnKeyType="done"
          onSubmitEditing={onSubmit}
          error={errors.password}
          required
        />
        <Pressable
          onPress={() => router.push('/(auth)/forgot-password' as never)}
          hitSlop={8}
          style={styles.forgotWrap}
        >
          <Text style={styles.forgotText}>{t('auth.login.motDePasseOublie')}</Text>
        </Pressable>
      </View>

      <Button testID="login-submit" onPress={onSubmit} loading={loading} fullWidth size="lg">
        {loading ? t('auth.login.connexionEnCours') : t('auth.login.seConnecter')}
      </Button>

      <View style={styles.divider}>
        <View style={styles.line} />
        <Text style={styles.or}>{t('auth.login.ou')}</Text>
        <View style={styles.line} />
      </View>

      <View style={styles.registerBox}>
        <Text style={styles.registerHint}>{t('auth.login.pasDeCompte')}</Text>
        <Pressable
          onPress={() => router.push('/(auth)/register' as never)}
          disabled={loading}
          style={({ pressed }) => [styles.registerBtn, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.registerBtnText}>{t('libelles.creerCompte')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 15 },
  forgotWrap: { alignSelf: 'flex-end', paddingVertical: 2 },
  forgotText: { fontSize: 13, fontWeight: '600', color: colors.primary[600] },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 2 },
  line: { flex: 1, height: 1, backgroundColor: '#E7EBE7' },
  or: { fontSize: 12, color: '#98A29A', fontWeight: '600' },
  registerBox: { alignItems: 'center', gap: 10, marginTop: 2 },
  registerHint: { fontSize: 13, color: colors.neutral[500] },
  registerBtn: {
    alignSelf: 'stretch',
    minHeight: 48,
    borderRadius: radius.full,
    borderWidth: 1.25,
    borderColor: '#D8E0DA',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: { fontSize: 14, fontWeight: '700', color: '#1B4E1F' },
});
