import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { AlertCircle, ArrowLeft } from 'lucide-react-native';
import { useLogin } from '@/hooks/auth/useLogin';
import { authApi } from '@/services';
import { saveSession } from '@/storage/authStorage';
import {
  correspondAuCoffre,
  lireCoffre,
  marquerSessionEnLigne,
  ouvrirSessionHorsLigne,
  scellerCoffre,
} from '@/storage/coffreAuth';
import { getIsOnline } from '@/hooks/common/useNetwork';
import { reinitialiserExpirationSession } from '@/services/http';
import { colors } from '@/theme';
import { LoginHeaderSimple } from '@/components/AuthComponent/LoginHeaderSimple';
import { LoginForm } from '@/components/AuthComponent/LoginForm';

import { styles } from './LoginScreen.styles';
import { estEmailValide } from '@/utils/email';
import { erreurChamp, estErreurDe, messageErreur } from '@/utils/erreur';
type FieldErrors = { email?: string; password?: string; general?: string };

export default function LoginScreen() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [verificationRequise, setVerificationRequise] = useState(false);
  const [renvoiEnCours, setRenvoiEnCours] = useState(false);
  const [renvoiAccepte, setRenvoiAccepte] = useState(false);
  const [secondesAvantRenvoi, setSecondesAvantRenvoi] = useState(0);
  const loginMutation = useLogin();

  useEffect(() => {
    if (secondesAvantRenvoi <= 0) return;
    const timer = setTimeout(
      () => setSecondesAvantRenvoi((secondes) => Math.max(0, secondes - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [secondesAvantRenvoi]);

  const validate = (): boolean => {
    const e: FieldErrors = {};
    const norm = email.trim();
    if (!norm) e.email = t('auth.login.emailObligatoire');
    else if (!estEmailValide(norm)) e.email = t('auth.login.emailInvalide');
    if (!password) e.password = t('auth.login.motDePasseObligatoire');
    else if (password.length < 6) e.password = t('auth.login.motDePasseCourt');
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleResendVerification = async () => {
    const adresse = email.trim();
    if (!estEmailValide(adresse)) {
      setErrors((previous) => ({ ...previous, email: t('auth.login.emailInvalide') }));
      return;
    }

    setRenvoiEnCours(true);
    setRenvoiAccepte(false);
    try {
      await authApi.resendVerification(adresse);
      setRenvoiAccepte(true);
      setSecondesAvantRenvoi(60);
    } catch (error) {
      setErrors((previous) => ({
        ...previous,
        general: messageErreur(error, t('auth.verify.echecRenvoi')),
      }));
    } finally {
      setRenvoiEnCours(false);
    }
  };

  const handleLogin = () => {
    setErrors({});
    if (!validate()) return;

    loginMutation.mutate(
      { email: email.trim(), password },
      {
        onSuccess: async (data) => {
          try {
            await saveSession(
              data.access_token,
              data.utilisateur.id,
              data.expires_at,
            );
            try {
              const syncEngine = await import('@/services/offline/syncEngine');
              await syncEngine.refreshCounters();
              void syncEngine.syncOnce();
            } catch {
              // La connexion reste valide même si la lecture de la file locale échoue.
            }
            // Coffre hors ligne : une empreinte scellée permettra de rouvrir
            // une session locale si le réseau manque plus tard.
            try {
              await scellerCoffre({ email: email.trim(), password, profil: data.utilisateur });
              await marquerSessionEnLigne();
            } catch {
              // Le coffre est un confort : jamais bloquant pour la session.
            }
            // Nouvelle session : la prochaine expiration devra de nouveau être
            // signalée à l'utilisateur.
            reinitialiserExpirationSession();
            router.replace('/(app)/home' as any);
          } catch {
            setErrors({ general: t('auth.login.echecSession') });
          }
        },
        onError: (error) => {
          // Sans réseau, une combinaison déjà scellée rouvre une session
          // locale : toute action reste possible hors ligne.
          void (async () => {
            try {
              const enLigne = await getIsOnline();
              if (!enLigne && (await correspondAuCoffre(email, password))) {
                const coffre = await lireCoffre();
                if (coffre) {
                  await ouvrirSessionHorsLigne(coffre.profil);
                  reinitialiserExpirationSession();
                  router.replace('/(app)/home' as any);
                  return;
                }
              }
            } catch {
              // repli impossible : on affiche l'erreur classique ci-dessous.
            }
            const nonVerifie = estErreurDe(error, 'AUTH_EMAIL_NOT_VERIFIED');
          setVerificationRequise(nonVerifie);
          setRenvoiAccepte(false);
            setErrors({
              email: erreurChamp(error, 'email'),
              password: erreurChamp(error, 'password'),
              general: messageErreur(error, t('auth.login.identifiantsInvalides')),
            });
          })();
        },
      },
    );
  };

  const isLoading = loginMutation.isPending;

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contenu}>
            <View style={styles.backWrap}>
              {router.canGoBack() ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('commun.actions.retour')}
                  onPress={() => router.back()}
                  style={({ pressed }) => [styles.back, pressed && { opacity: 0.75 }]}
                >
                  <ArrowLeft size={19} color="#1B2B20" strokeWidth={2.2} />
                </Pressable>
              ) : null}
            </View>

            <LoginHeaderSimple />

            <View style={styles.cardWrap}>
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.hTitle}>{t('auth.login.bienvenue')}</Text>
                <Text style={styles.hSubtitle}>{t('auth.login.sousTitre')}</Text>
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
                  setVerificationRequise(false);
                  setRenvoiAccepte(false);
                  setSecondesAvantRenvoi(0);
                  if (errors.email || errors.general) setErrors((p) => ({ ...p, email: undefined, general: undefined }));
                }}
                onPasswordChange={(v) => {
                  setPassword(v);
                  if (errors.password || errors.general) setErrors((p) => ({ ...p, password: undefined, general: undefined }));
                }}
                onSubmit={handleLogin}
              />

              {verificationRequise && (
                <View style={styles.verificationPanel}>
                  <Text style={styles.verificationHint}>
                    {t('auth.login.emailNonVerifie')}
                  </Text>
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => void handleResendVerification()}
                    disabled={renvoiEnCours || secondesAvantRenvoi > 0}
                    style={({ pressed }) => [
                      styles.verificationButton,
                      (pressed || renvoiEnCours || secondesAvantRenvoi > 0) &&
                        styles.verificationButtonDisabled,
                    ]}
                  >
                    <Text style={styles.verificationButtonText}>
                      {renvoiEnCours
                        ? t('auth.verify.renvoiEnCours')
                        : secondesAvantRenvoi > 0
                          ? t('auth.verify.renvoiDans', { count: secondesAvantRenvoi })
                          : t('auth.login.verificationAction')}
                    </Text>
                  </Pressable>
                  {renvoiAccepte && (
                    <Text accessibilityLiveRegion="polite" style={styles.verificationSuccess}>
                      {t('auth.verify.renvoiAccepte')}
                    </Text>
                  )}
                  <Pressable
                    accessibilityRole="link"
                    onPress={() =>
                      router.push({
                        pathname: '/(auth)/verify-email',
                        params: { email: email.trim() },
                      } as never)
                    }
                    style={styles.verificationLink}
                  >
                    <Text style={styles.verificationLinkText}>
                      {t('auth.login.ouvrirEcranVerification')}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Text style={styles.footer}>{t('auth.piedDePage', { annee: new Date().getFullYear() })}</Text>
          </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

