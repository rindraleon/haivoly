import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';
import type { Dispatch, SetStateAction } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import {
  AlertCircle,
  ArrowRight,
  Leaf,
  LockKeyhole,
  ShieldCheck,
  Sprout,
  User,
} from 'lucide-react-native';
import { i18n } from '@/i18n/instance';
import type { Role } from '@/types';
import { PwdCheck } from '@/components/AuthComponent/PwdCheck';
import { AppSelect } from '@/components/CommonComponent/AppSelect';
import { Button } from '@/components/CommonComponent/Button';
import { Input } from '@/components/CommonComponent/Input';
import { PasswordInput } from '@/components/CommonComponent/PasswordInput';
import { normaliserPseudo } from '@/utils/pseudo';
import { colors } from '@/theme';
import { router } from 'expo-router';

export type RegisterFormProps = {
  clearFieldError: (
    field: 'nom' | 'prenom' | 'email' | 'telephone' | 'password' | 'username',
  ) => void;
  email: string;
  errors: Errors;
  handleRegister: () => void;
  isLoading: boolean;
  nom: string;
  password: string;
  passwordLabel: string;
  passwordScore: number;
  prenom: string;
  pwdChecks: { len: boolean; upper: boolean; lower: boolean; number: boolean };
  setEmail: Dispatch<SetStateAction<string>>;
  setNom: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setPrenom: Dispatch<SetStateAction<string>>;
  setTelephone: Dispatch<SetStateAction<string>>;
  telephone: string;
  /** Nom d'utilisateur public ; facultatif, le serveur le dérive sinon. */
  setUsername: Dispatch<SetStateAction<string>>;
  username: string;
  /** Rôle du compte choisi à l'inscription. */
  role: Role;
  setRole: Dispatch<SetStateAction<Role>>;
};

export function RegisterForm({
  clearFieldError,
  email,
  errors,
  handleRegister,
  isLoading,
  nom,
  password,
  passwordLabel,
  passwordScore,
  prenom,
  pwdChecks,
  setEmail,
  setNom,
  setPassword,
  setPrenom,
  setTelephone,
  setUsername,
  telephone,
  username,
  role,
  setRole,
}: RegisterFormProps) {
  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.heroTopRow}>
            <View style={styles.logoCircle}>
              <Sprout size={13} color="#FFFFFF" strokeWidth={2} />

              <Text style={styles.brandTitle}>Haivoly</Text>
            </View>

            <View style={styles.heroBadge}>
              <Leaf size={13} color="#FFFFFF" strokeWidth={2} />

              <Text style={styles.heroBadgeText}>AGRICULTURE</Text>
            </View>
          </View>

          <View style={styles.heroCopy}>
            <Text style={styles.heroTitle}>{i18n.t('auth.register.heroTitre')}</Text>

            <Text style={styles.heroSubtitle}>{i18n.t('auth.register.heroSousTitre')}</Text>
          </View>

          <View style={styles.heroBottomHint}>
            <View style={styles.heroDot} />

            <Text style={styles.heroHintText}>{i18n.t('auth.register.heroAstuce')}</Text>
          </View>
        </View>

        <View style={styles.cardWrap}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.eyebrowRow}>
                <View style={styles.eyebrowDot} />

                <Text style={styles.eyebrow}>{i18n.t('auth.register.surtitre')}</Text>
              </View>

              <Text style={styles.cardTitle}>{i18n.t('auth.register.carteTitre')}</Text>

              <Text style={styles.cardSubtitle}>{i18n.t('auth.register.carteSousTitre')}</Text>
            </View>

            {errors.general && (
              <View style={styles.banner}>
                <View style={styles.bannerIcon}>
                  <AlertCircle size={17} color={colors.error[600]} strokeWidth={2.3} />
                </View>

                <Text style={styles.bannerText}>{errors.general}</Text>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <User size={16} color={colors.primary[700]} strokeWidth={2.2} />
                </View>

                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>{i18n.t('auth.register.sectionInfos')}</Text>

                  <Text style={styles.sectionSubtitle}>Dites-nous comment vous appeler.</Text>
                </View>
              </View>

              <View style={styles.form}>
                <Input
                  label={i18n.t('auth.register.champNom')}

                  placeholder="Rakoto"
                  value={nom}
                  onChangeText={(value) => {
                    setNom(value);

                    if (errors.nom || errors.general) {
                      clearFieldError('nom');
                    }
                  }}
                  error={errors.nom}
                  editable={!isLoading}
                  required
                />

                <Input
                  label={i18n.t('profil.prenom')}
                  placeholder="Hery"
                  value={prenom}
                  onChangeText={(value) => {
                    setPrenom(value);

                    if (errors.prenom) {
                      clearFieldError('prenom');
                    }
                  }}
                  error={errors.prenom}
                  editable={!isLoading}
                />

                <Input
                  label={i18n.t('auth.register.champEmail')}

                  placeholder="exemple@email.com"
                  value={email}
                  onChangeText={(value) => {
                    setEmail(value);

                    if (errors.email || errors.general) {
                      clearFieldError('email');
                    }
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  error={errors.email}
                  required
                />

                <Input
                  label={i18n.t('pseudo.label')}
                  placeholder={i18n.t('pseudo.placeholder')}
                  value={username}
                  hint={
                    username.trim()
                      ? i18n.t('pseudo.apercu', {
                          pseudo: normaliserPseudo(username),
                        })
                      : i18n.t('pseudo.aide')
                  }
                  onChangeText={(value) => {
                    setUsername(value);

                    if (errors.username || errors.general) {
                      clearFieldError('username');
                    }
                  }}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                  error={errors.username}
                />

                <View style={styles.optionalField}>
                  <Input
                    label={i18n.t('domaine.telephone')}
                    placeholder="+261 34 00 000 00"
                    value={telephone}
                    onChangeText={(value) => {
                      setTelephone(value);

                      if (errors.telephone) {
                        clearFieldError('telephone');
                      }
                    }}
                    keyboardType="phone-pad"
                    editable={!isLoading}
                    hint="Optionnel"
                    error={errors.telephone}
                  />
                </View>

                <AppSelect<Role>
                  label={i18n.t('auth.register.champRole')}
                  value={role}
                  onChange={setRole}
                  disabled={isLoading}
                  hint={i18n.t('auth.register.roleAide')}
                  required
                  options={[
                    {
                      value: 'PROPRIETAIRE',
                      label: i18n.t('profil.roleProprietaire'),
                      description: i18n.t('auth.register.roleProprietaireAide'),
                    },
                    {
                      value: 'AGRICULTEUR',
                      label: i18n.t('profil.roleAgriculteur'),
                      description: i18n.t('auth.register.roleAgriculteurAide'),
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIcon}>
                  <LockKeyhole size={16} color={colors.primary[700]} strokeWidth={2.2} />
                </View>

                <View style={styles.sectionHeaderText}>
                  <Text style={styles.sectionTitle}>{i18n.t('auth.register.sectionSecurite')}</Text>

                  <Text style={styles.sectionSubtitle}>
                    Utilisez un mot de passe difficile à deviner.
                  </Text>
                </View>
              </View>

              <PasswordInput
                label={i18n.t('libelles.motDePasse')}
                placeholder={i18n.t('auth.register.motDePasseCourt')}
                value={password}
                onChangeText={(value) => {
                  setPassword(value);

                  if (errors.password) {
                    clearFieldError('password');
                  }
                }}
                editable={!isLoading}
                error={errors.password}
                required
              />

              {password.length > 0 && (
                <View style={styles.passwordPanel}>
                  <View style={styles.passwordHeader}>
                    <Text style={styles.passwordLabel}>{i18n.t('auth.register.reglesTitre')}</Text>

                    <Text
                      style={[
                        styles.passwordScoreText,
                        passwordScore === 4 && styles.passwordScoreStrong,
                      ]}
                    >
                      {passwordLabel}
                    </Text>
                  </View>

                  <View style={styles.passwordProgress}>
                    {[0, 1, 2, 3].map((index) => (
                      <View
                        key={index}
                        style={[
                          styles.passwordSegment,
                          index < passwordScore && styles.passwordSegmentActive,
                        ]}
                      />
                    ))}
                  </View>

                  <View style={styles.checkGrid}>
                    <PwdCheck
                      valid={pwdChecks.len}
                      text={i18n.t('auth.register.securite.regleLongueur')}
                    />

                    <PwdCheck valid={pwdChecks.upper} text={i18n.t('libelles.uneMajuscule')} />

                    <PwdCheck valid={pwdChecks.lower} text={i18n.t('libelles.uneMinuscule')} />

                    <PwdCheck valid={pwdChecks.number} text={i18n.t('libelles.unChiffre')} />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.trustBox}>
              <View style={styles.trustIcon}>
                <ShieldCheck size={19} color={colors.primary[700]} strokeWidth={2.1} />
              </View>

              <View style={styles.trustContent}>
                <Text style={styles.trustTitle}>{i18n.t('auth.register.reglesTexte')}</Text>

                <Text style={styles.trustText}>
                  Haivoly utilise vos informations uniquement pour gérer votre espace agricole.
                </Text>
              </View>
            </View>

            <Button onPress={handleRegister} loading={isLoading} fullWidth size="lg">
              {isLoading ? i18n.t('auth.register.creation') : i18n.t('auth.register.soumettre')}
            </Button>

            <View style={styles.loginRow}>
              <Text style={styles.loginHint}>Vous avez déjà un compte ?</Text>

              <Pressable
                onPress={() => router.replace('/(auth)/login' as any)}
                disabled={isLoading}
                hitSlop={8}
              >
                <View style={styles.loginLinkContainer}>
                  <Text style={styles.loginLink}>{i18n.t('auth.register.lienConnexion')}</Text>

                  <ArrowRight size={14} color={colors.primary[700]} strokeWidth={2.5} />
                </View>
              </Pressable>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.footerBrand}>
              <Sprout size={13} color="rgba(255,255,255,0.80)" strokeWidth={2} />

              <Text style={styles.footerText}>Haivoly</Text>
            </View>

            <Text style={styles.footerCopy}>© {new Date().getFullYear()} · Gestion agricole</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
