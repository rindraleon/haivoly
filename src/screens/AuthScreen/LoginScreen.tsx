/**
 * LoginScreen — composition de composants
 * Écran orchestre navigation + hooks, UI déléguée aux components
 */
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertCircle } from 'lucide-react-native';
import { useLogin } from '@/hooks/auth/useLogin';
import { saveToken } from '@/storage/authStorage';
import { reinitialiserExpirationSession } from '@/services/http';
import { colors } from '@/theme';
import { LoginHeader } from '@/components/AuthComponent/LoginHeader';
import { LoginForm } from '@/components/AuthComponent/LoginForm';

import { styles } from './LoginScreen.styles';
import { estEmailValide } from '@/utils/email';
import { erreurChamp, messageErreur } from '@/utils/erreur';
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
    else if (!estEmailValide(norm)) e.email = 'Adresse email invalide.';
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
            // Nouvelle session : la prochaine expiration devra de nouveau être
            // signalée à l'utilisateur.
            reinitialiserExpirationSession();
            // Une connexion n'est pas une opération métier : l'API de
            // synchronisation n'accepte que CREATE/UPDATE/DELETE sur une
            // ressource (parcelle, culture…). La journaliser ici ferait échouer
            // la file à chaque session, d'où l'absence volontaire d'enqueue().
            router.replace('/(app)/home' as any);
          } catch {
            setErrors({ general: "Erreur lors de l'enregistrement de la session." });
          }
        },
        onError: (error) => {
          // Le serveur reste la source de vérité : son message est affiché tel
          // quel (repli générique si absent), et les champs qu'il désigne sont
          // soulignés individuellement grâce à l'indexation `fields`.
          setErrors({
            email: erreurChamp(error, 'email'),
            password: erreurChamp(error, 'password'),
            general: messageErreur(error, 'Email ou mot de passe incorrect.'),
          });
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
                <Text style={styles.hSubtitle}>Connectez-vous pour accéder à vos parcelles et cultures.</Text>
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

