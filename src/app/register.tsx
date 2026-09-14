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
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  User,
  UserPlus,
} from 'lucide-react-native';

import { useRegister } from '@/hooks/useRegister';

type FieldErrors = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  general?: string;
};

type RegisterField = 'nom' | 'prenom' | 'email' | 'telephone' | 'password';

const validateTextField = (
  value: string,
  requiredMessage: string,
  invalidMessage: string,
): string | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return requiredMessage;
  }

  return /^[A-Za-zÀ-ÿ\s'-]+$/.test(normalizedValue)
    ? undefined
    : invalidMessage;
};

const validateEmailField = (
  value: string,
  requiredMessage: string,
  invalidMessage: string,
): string | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return requiredMessage;
  }

  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)
    ? undefined
    : invalidMessage;
};

const validatePhoneField = (
  value: string,
): string | undefined => {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const phone = normalizedValue.replace(/[\s()-]/g, '');

  if (!/^\+?[0-9]+$/.test(phone)) {
    return 'Le numéro de téléphone contient des caractères invalides.';
  }

  if (phone.replace('+', '').length < 8) {
    return 'Le numéro de téléphone semble trop court.';
  }

  return undefined;
};

const validatePasswordField = (
  value: string,
): string | undefined => {
  if (!value) {
    return 'Le mot de passe est obligatoire.';
  }

  if (value.length < 8) {
    return 'Le mot de passe doit contenir au moins 8 caractères.';
  }

  return undefined;
};

const buildServerError = (error: any): string => {
  const serverMessage = error?.response?.data?.message;

  if (Array.isArray(serverMessage)) {
    return serverMessage.join('\n');
  }

  if (typeof serverMessage === 'string') {
    return serverMessage;
  }

  return "Une erreur est survenue lors de l'inscription. Veuillez réessayer.";
};

const getInputContainerStyle = (
  field: RegisterField,
  focusedField: RegisterField | null,
  hasError: boolean,
): any[] => [
  styles.inputContainer,
  focusedField === field && styles.inputFocused,
  hasError && styles.inputError,
];

const getInputIconColor = (
  field: RegisterField,
  focusedField: RegisterField | null,
  hasError: boolean,
): string =>
  hasError
    ? '#D92D20'
    : focusedField === field
      ? '#2E7D32'
      : '#667085';

export default function Register() {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<RegisterField | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});

  const registerMutation = useRegister();

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {
      prenom: validateTextField(
        prenom,
        'Le prénom est obligatoire.',
        'Le prénom contient des caractères invalides.',
      ),
      nom: validateTextField(
        nom,
        'Le nom est obligatoire.',
        'Le nom contient des caractères invalides.',
      ),
      email: validateEmailField(
        email,
        "L'adresse email est obligatoire.",
        'Veuillez saisir une adresse email valide.',
      ),
      telephone: validatePhoneField(telephone),
      password: validatePasswordField(password),
    };

    const cleanedErrors = Object.fromEntries(
      Object.entries(newErrors).filter(([, value]) => value !== undefined),
    ) as FieldErrors;

    setErrors(cleanedErrors);

    return Object.keys(cleanedErrors).length === 0;
  };

  const handleRegister = () => {
    setErrors({});

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate(
      {
        nom: nom.trim(),
        prenom: prenom.trim(),
        email: email.trim().toLowerCase(),
        telephone: telephone.trim() || undefined,
        password,
      },
      {
        onSuccess: () => {
          router.replace('/login');
        },

        onError: (error: any) => {
          console.log('REGISTER ERROR:', error?.response?.data);
          setErrors({ general: buildServerError(error) });
        },
      },
    );
  };

  const clearFieldError = (field: keyof FieldErrors) => {
    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
      general: undefined,
    }));
  };

  const handlePrenomChange = (value: string) => {
    setPrenom(value);
    clearFieldError('prenom');
  };

  const handleNomChange = (value: string) => {
    setNom(value);
    clearFieldError('nom');
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    clearFieldError('email');
  };

  const handleTelephoneChange = (value: string) => {
    setTelephone(value);
    clearFieldError('telephone');
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    clearFieldError('password');
  };

  const isLoading = registerMutation.isPending;

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const passwordChecks = [
    { valid: hasMinLength, text: 'Au moins 8 caractères' },
    { valid: hasUppercase, text: 'Une lettre majuscule' },
    { valid: hasLowercase, text: 'Une lettre minuscule' },
    { valid: hasNumber, text: 'Un chiffre' },
  ];

  return (
    <View style={styles.container}>
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
              
              <Text style={styles.title}>HaiVoly</Text>
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                Créer votre compte
              </Text>
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

            <View style={styles.form}>
              {/* Prénom */}
              <View style={styles.field}>
                <Text style={styles.label}>Prénom</Text>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'prenom' &&
                      styles.inputFocused,
                    errors.prenom && styles.inputError,
                  ]}
                >
                  <User
                    size={20}
                    color={
                      errors.prenom
                        ? '#D92D20'
                        : focusedField === 'prenom'
                          ? '#2E7D32'
                          : '#667085'
                    }
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Votre prénom"
                    placeholderTextColor="#98A2B3"
                    value={prenom}
                    onChangeText={handlePrenomChange}
                    onFocus={() => setFocusedField('prenom')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="given-name"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>

                {errors.prenom && (
                  <FieldError message={errors.prenom} />
                )}
              </View>

              {/* Nom */}
              <View style={styles.field}>
                <Text style={styles.label}>Nom</Text>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'nom' && styles.inputFocused,
                    errors.nom && styles.inputError,
                  ]}
                >
                  <User
                    size={20}
                    color={
                      errors.nom
                        ? '#D92D20'
                        : focusedField === 'nom'
                          ? '#2E7D32'
                          : '#667085'
                    }
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Votre nom"
                    placeholderTextColor="#98A2B3"
                    value={nom}
                    onChangeText={handleNomChange}
                    onFocus={() => setFocusedField('nom')}
                    onBlur={() => setFocusedField(null)}
                    autoCapitalize="words"
                    autoCorrect={false}
                    autoComplete="family-name"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>

                {errors.nom && <FieldError message={errors.nom} />}
              </View>

              {/* Email */}
              <View style={styles.field}>
                <Text style={styles.label}>Adresse email</Text>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'email' &&
                      styles.inputFocused,
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

                {errors.email && <FieldError message={errors.email} />}
              </View>

              {/* Téléphone */}
              <View style={styles.field}>
                <View style={styles.labelRow}>
                  <Text style={styles.label}>Téléphone</Text>

                  <Text style={styles.optional}>
                    Facultatif
                  </Text>
                </View>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'telephone' &&
                      styles.inputFocused,
                    errors.telephone && styles.inputError,
                  ]}
                >
                  <Phone
                    size={20}
                    color={
                      errors.telephone
                        ? '#D92D20'
                        : focusedField === 'telephone'
                          ? '#2E7D32'
                          : '#667085'
                    }
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="+261 XX XX XXX XX"
                    placeholderTextColor="#98A2B3"
                    value={telephone}
                    onChangeText={handleTelephoneChange}
                    onFocus={() =>
                      setFocusedField('telephone')
                    }
                    onBlur={() => setFocusedField(null)}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    editable={!isLoading}
                    returnKeyType="next"
                  />
                </View>

                {errors.telephone && (
                  <FieldError message={errors.telephone} />
                )}
              </View>

              {/* Password */}
              <View style={styles.field}>
                <Text style={styles.label}>Mot de passe</Text>

                <View
                  style={[
                    styles.inputContainer,
                    focusedField === 'password' &&
                      styles.inputFocused,
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
                  />

                  <TextInput
                    style={styles.input}
                    placeholder="Créer un mot de passe"
                    placeholderTextColor="#98A2B3"
                    value={password}
                    onChangeText={handlePasswordChange}
                    onFocus={() =>
                      setFocusedField('password')
                    }
                    onBlur={() => setFocusedField(null)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="new-password"
                    editable={!isLoading}
                    returnKeyType="done"
                    onSubmitEditing={handleRegister}
                  />

                  <Pressable
                    onPress={() =>
                      setShowPassword((previous) => !previous)
                    }
                    disabled={isLoading}
                    hitSlop={8}
                  >
                    {showPassword ? (
                      <EyeOff size={20} color="#667085" />
                    ) : (
                      <Eye size={20} color="#667085" />
                    )}
                  </Pressable>
                </View>

                {errors.password && (
                  <FieldError message={errors.password} />
                )}

                {/* Password strength */}
                {password.length > 0 && (
                  <View style={styles.passwordRequirements}>
                    <PasswordRequirement
                      valid={hasMinLength}
                      text="Au moins 8 caractères"
                    />

                    <PasswordRequirement
                      valid={hasUppercase}
                      text="Une lettre majuscule"
                    />

                    <PasswordRequirement
                      valid={hasLowercase}
                      text="Une lettre minuscule"
                    />

                    <PasswordRequirement
                      valid={hasNumber}
                      text="Un chiffre"
                    />
                  </View>
                )}
              </View>

              {/* Register button */}
              <Pressable
                style={({ pressed }) => [
                  styles.button,
                  isLoading && styles.buttonDisabled,
                  pressed && !isLoading && styles.buttonPressed,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <ActivityIndicator
                      color="#FFFFFF"
                      size="small"
                    />

                    <Text style={styles.buttonText}>
                      Création du compte...
                    </Text>
                  </>
                ) : (
                  <>
                    <UserPlus
                      size={20}
                      color="#FFFFFF"
                      strokeWidth={2.3}
                    />

                    <Text style={styles.buttonText}>
                      Créer mon compte
                    </Text>
                  </>
                )}
              </Pressable>
            </View>

            {/* Login */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginDescription}>
                Vous avez déjà un compte ?
              </Text>

              <Pressable
                onPress={() => router.replace('/login')}
                disabled={isLoading}
                style={styles.loginButton}
              >
                <Text style={styles.loginText}>
                  Se connecter
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
    </View>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <View style={styles.fieldError}>
      <AlertCircle size={14} color="#D92D20" />

      <Text style={styles.fieldErrorText}>{message}</Text>
    </View>
  );
}

function PasswordRequirement({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <View style={styles.requirement}>
      <View
        style={[
          styles.requirementIcon,
          valid && styles.requirementIconValid,
        ]}
      >
        <Check
          size={11}
          color={valid ? '#2E7D32' : '#98A2B3'}
          strokeWidth={3}
        />
      </View>

      <Text
        style={[
          styles.requirementText,
          valid && styles.requirementTextValid,
        ]}
      >
        {text}
      </Text>
    </View>
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
    paddingVertical: 38,
  },

  /* Brand */

  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },

  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    marginBottom: 15,
  },

  title: {
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.8,
  },

  subtitle: {
    marginTop: 5,
    fontSize: 15,
    color: '#667085',
  },

  /* Header */

  headerContainer: {
    marginBottom: 22,
  },

  headerTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 7,
  },

  headerDescription: {
    fontSize: 14,
    lineHeight: 21,
    color: '#667085',
  },

  /* Error */

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
    gap: 18,
  },

  field: {
    gap: 8,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  label: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: '#344054',
  },

  optional: {
    fontSize: 12,
    color: '#98A2B3',
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

  /* Password */

  passwordRequirements: {
    marginTop: 4,
    gap: 5,
  },

  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  requirementIcon: {
    width: 17,
    height: 17,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F4F7',
  },

  requirementIconValid: {
    backgroundColor: '#E8F5E9',
  },

  requirementText: {
    fontSize: 12,
    color: '#667085',
  },

  requirementTextValid: {
    color: '#2E7D32',
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
    marginTop: 5,
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

  /* Login */

  loginContainer: {
    alignItems: 'center',
    marginTop: 28,
  },

  loginDescription: {
    fontSize: 13,
    color: '#667085',
    marginBottom: 7,
  },

  loginButton: {
    paddingVertical: 4,
  },

  loginText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2E7D32',
  },

  /* Footer */

  footer: {
    textAlign: 'center',
    fontSize: 12,
    color: '#98A2B3',
    marginTop: 30,
  },
});
