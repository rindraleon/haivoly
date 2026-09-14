import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import {
  AlertCircle,
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
  UserPlus,
} from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useLogin } from '@/hooks/useLogin';
import { saveToken } from '@/storage/authStorage';

type FieldErrors = {
  email?: string;
  password?: string;
  general?: string;
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<
    'email' | 'password' | null
  >(null);
  const [errors, setErrors] = useState<FieldErrors>({});

  const loginMutation = useLogin();

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      newErrors.email = "L'adresse email est obligatoire.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      newErrors.email = 'Veuillez saisir une adresse email valide.';
    }

    if (!password) {
      newErrors.password = 'Le mot de passe est obligatoire.';
    } else if (password.length < 6) {
      newErrors.password =
        'Le mot de passe doit contenir au moins 6 caractères.';
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    setErrors({});

    if (!validateForm()) {
      return;
    }

    loginMutation.mutate(
      {
        email: email.trim(),
        password,
      },
      {
        onSuccess: async (data) => {
          try {
            await saveToken(data.access_token);

            router.replace('/');
          } catch {
            setErrors({
              general:
                "La connexion a réussi, mais une erreur est survenue lors de l'enregistrement de la session.",
            });
          }
        },

        onError: (error: any) => {
          const serverMessage = error?.response?.data?.message;

          let message = 'Email ou mot de passe incorrect.';

          if (Array.isArray(serverMessage)) {
            message = serverMessage.join('\n');
          } else if (typeof serverMessage === 'string') {
            message = serverMessage;
          }

          setErrors({
            general: message,
          });
        },
      },
    );
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (errors.email || errors.general) {
      setErrors((previous) => ({
        ...previous,
        email: undefined,
        general: undefined,
      }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);

    if (errors.password || errors.general) {
      setErrors((previous) => ({
        ...previous,
        password: undefined,
        general: undefined,
      }));
    }
  };

  const isLoading = loginMutation.isPending;

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Brand */}
            <View style={styles.brandContainer}>
              

              <ThemedText type="title" style={styles.title}>
                HaiVoly
              </ThemedText>

              <ThemedText style={styles.subtitle}>
                Gestion agricole
              </ThemedText>
            </View>

            {/* Welcome */}
            <View style={styles.welcomeContainer}>
              <ThemedText style={styles.welcomeTitle}>
                Bienvenue
              </ThemedText>

              <ThemedText style={styles.welcomeText}>
                Connectez-vous à votre compte pour continuer.
              </ThemedText>
            </View>

            {/* General error */}
            {errors.general && (
              <View style={styles.errorBanner}>
                <AlertCircle
                  size={20}
                  color="#B42318"
                  strokeWidth={2}
                />

                <Text style={styles.errorBannerText}>
                  {errors.general}
                </Text>
              </View>
            )}

            {/* Form */}
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Adresse email</Text>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'email' && styles.inputFocused,
                    errors.email && styles.inputError,
                  ]}
                >
                  <Mail
                    size={20}
                    color={
                      errors.email
                        ? '#D92D20'
                        : focusedField === 'email'
                          ? '#2E7D32'
                          : '#667085'
                    }
                    strokeWidth={2}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="exemple@email.com"
                    placeholderTextColor="#98A2B3"
                    value={email}
                    onChangeText={handleEmailChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoCorrect={false}
                    autoComplete="email"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>

                {errors.email && (
                  <View style={styles.fieldError}>
                    <AlertCircle size={14} color="#D92D20" />

                    <Text style={styles.fieldErrorText}>
                      {errors.email}
                    </Text>
                  </View>
                )}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <View style={styles.passwordLabelRow}>
                  <Text style={styles.label}>Mot de passe</Text>

                  <Pressable
                    onPress={() => router.push('/forgot-password')}
                    disabled={isLoading}
                    hitSlop={8}
                  >
                    <Text style={styles.forgotPassword}>
                      Mot de passe oublié ?
                    </Text>
                  </Pressable>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'password' && styles.inputFocused,
                    errors.password && styles.inputError,
                  ]}
                >
                  <LockKeyhole
                    size={20}
                    color={
                      errors.password
                        ? '#D92D20'
                        : focusedField === 'password'
                          ? '#2E7D32'
                          : '#667085'
                    }
                    strokeWidth={2}
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Votre mot de passe"
                    placeholderTextColor="#98A2B3"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="password"
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleLogin}
                  />

                  <Pressable
                    onPress={() => setShowPassword((previous) => !previous)}
                    disabled={isLoading}
                    hitSlop={8}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#667085" />
                    ) : (
                      <Eye size={20} color="#667085" />
                    )}
                  </Pressable>
                </View>

                {errors.password && (
                  <View style={styles.fieldError}>
                    <AlertCircle size={14} color="#D92D20" />

                    <Text style={styles.fieldErrorText}>
                      {errors.password}
                    </Text>
                  </View>
                )}
              </View>

              {/* Login button */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  isLoading && styles.buttonDisabled,
                  pressed && !isLoading && styles.buttonPressed,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator color="#FFFFFF" size="small" />

                    <Text style={styles.buttonText}>
                      Connexion...
                    </Text>
                  </>
                ) : (
                  <>
                    <LogIn
                      size={20}
                      color="#FFFFFF"
                      strokeWidth={2.3}
                    />

                    <Text style={styles.buttonText}>
                      Se connecter
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Register */}
            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Vous n'avez pas encore de compte ?
              </Text>

              <Pressable
                onPress={() => router.push('/register')}
                disabled={isLoading}
                style={styles.registerButton}
              >
                <UserPlus
                  size={18}
                  color="#2E7D32"
                  strokeWidth={2}
                />

                <Text style={styles.registerLink}>
                  Créer un compte
                </Text>
              </Pressable>
            </View>

            {/* Footer */}
            <Text style={styles.footer}>
              © {new Date().getFullYear()} HaiVoly
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF8',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },

  content: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },

  /* Brand */

  brandContainer: {
    alignItems: 'center',
    marginBottom: 34,
  },

  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    marginBottom: 16,
  },

  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: '#667085',
  },

  /* Welcome */

  welcomeContainer: {
    marginBottom: 24,
  },

  welcomeTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    marginBottom: 7,
  },

  welcomeText: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },

  /* General error */

  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 13,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDA29B',
    backgroundColor: '#FEF3F2',
    marginBottom: 20,
  },

  errorBannerText: {
    flex: 1,
    color: '#B42318',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500',
  },

  /* Form */

  form: {
    gap: 20,
  },

  field: {
    gap: 8,
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#344054',
  },

  passwordLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  forgotPassword: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2E7D32',
  },

  inputContainer: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0D5DD',
    backgroundColor: '#FFFFFF',
  },

  inputFocused: {
    borderColor: '#2E7D32',
    borderWidth: 1.5,
  },

  inputError: {
    borderColor: '#D92D20',
  },

  input: {
    flex: 1,
    minHeight: 52,
    paddingVertical: 0,
    fontSize: 15,
    color: '#101828',
  },

  passwordToggle: {
    padding: 3,
  },

  fieldError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  fieldErrorText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: '#D92D20',
  },

  /* Button */

  button: {
    minHeight: 54,
    borderRadius: 12,
    backgroundColor: '#2E7D32',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    marginTop: 4,
    paddingHorizontal: 20,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  /* Register */

  registerContainer: {
    alignItems: 'center',
    marginTop: 30,
  },

  registerText: {
    fontSize: 13,
    color: '#667085',
    textAlign: 'center',
    marginBottom: 8,
  },

  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
  },

  registerLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  /* Footer */

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#98A2B3',
    marginTop: 34,
  },
});
