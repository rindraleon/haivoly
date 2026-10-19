import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';
import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Text, View } from 'react-native';
import { AlertCircle, ArrowLeft, ArrowRight } from 'lucide-react-native';
import { i18n } from '@/i18n/instance';
import type { Role } from '@/types';
import { MarqueHaivoly } from '@/components/AuthComponent/MarqueHaivoly';
import { PwdCheck } from '@/components/AuthComponent/PwdCheck';
import { AppSelect } from '@/components/CommonComponent/AppSelect';
import { Button } from '@/components/CommonComponent/Button';
import { Card } from '@/components/CommonComponent/Card';
import { Input } from '@/components/CommonComponent/Input';
import { PasswordInput } from '@/components/CommonComponent/PasswordInput';
import { estEmailValide } from '@/utils/email';
import { colors } from '@/theme';

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
}: Readonly<RegisterFormProps>) {
  const [etape, setEtape] = useState<1 | 2>(1);
  const [erreursEtape, setErreursEtape] = useState<{
    nom?: string;
    prenom?: string;
    email?: string;
  }>({});

  const continuer = () => {
    const e: typeof erreursEtape = {};
    if (!nom.trim()) e.nom = i18n.t('auth.register.nomObligatoire');
    if (!prenom.trim()) e.prenom = i18n.t('auth.register.prenomObligatoire');
    const adresse = email.trim();
    if (!adresse) e.email = i18n.t('auth.register.emailObligatoire');
    else if (!estEmailValide(adresse)) e.email = i18n.t('auth.register.emailInvalide');
    setErreursEtape(e);
    if (Object.keys(e).length === 0) setEtape(2);
  };

  return (
    <KeyboardAvoidingView
      style={styles.kav}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
        <View style={styles.sansScroll} testID={`register-etape-${etape}`}>
        <View style={styles.enteteCompacte}>
          
          <View style={styles.progression}>
            <View style={styles.progressionRail}>
              <View style={[styles.progressionTrait, { width: etape === 1 ? '50%' : '100%' }]} />
            </View>
            <Text style={styles.progressText}>
              {i18n.t('auth.register.progression', { current: etape, total: 2 })}
              {' — '}
              {etape === 1
                ? i18n.t('auth.register.etapeIdentite')
                : i18n.t('auth.register.etapeSecurite')}
            </Text>
          </View>
        </View>

        {errors.general && (
          <View style={styles.bannerError}>
            <AlertCircle size={16} color={colors.error[600]} />
            <Text style={styles.bannerText}>{errors.general}</Text>
          </View>
        )}

        {etape === 1 ? (
          <View style={styles.grille}>
            <View style={styles.duo}>
              <View style={styles.duoCol}>
                <Input
                  label={i18n.t('auth.register.champNom')}
                  value={nom}
                  onChangeText={(v) => {
                    setNom(v);
                    setErreursEtape((p) => ({ ...p, nom: undefined }));
                    clearFieldError('nom');
                  }}
                  placeholder="Rakoto"
                  testID="register-nom"
                  error={erreursEtape.nom ?? errors.nom}
                />
              </View>
              <View style={styles.duoCol}>
                <Input
                  label={i18n.t('profil.prenom')}
                  value={prenom}
                  onChangeText={(v) => {
                    setPrenom(v);
                    setErreursEtape((p) => ({ ...p, prenom: undefined }));
                    clearFieldError('prenom');
                  }}
                  placeholder="Jean"
                  testID="register-prenom"
                  error={erreursEtape.prenom ?? errors.prenom}
                />
              </View>
            </View>
            <Input
              label={i18n.t('auth.register.champEmail')}
              value={email}
              onChangeText={(v) => {
                setEmail(v);
                setErreursEtape((p) => ({ ...p, email: undefined }));
                clearFieldError('email');
              }}
              placeholder="jean.rakoto@haivoly.mg"
              keyboardType="email-address"
              autoCapitalize="none"
              testID="register-email"
              error={erreursEtape.email ?? errors.email}
            />
            <Input
              label={i18n.t('pseudo.label')}
              value={username}
              onChangeText={(v) => {
                setUsername(v);
                clearFieldError('username');
              }}
              placeholder="jeanrakoto"
              autoCapitalize="none"
              testID="register-username"
              error={errors.username}
            />
            <Button
              onPress={continuer}
              fullWidth
              rightIcon={<ArrowRight size={16} color="#FFFFFF" />}
              testID="register-continuer"
            >
              {i18n.t('auth.register.continuer')}
            </Button>
          </View>
        ) : (
          <View style={styles.grille}>
            <Input
              label={i18n.t('domaine.telephone')}
              value={telephone}
              onChangeText={(v) => {
                setTelephone(v);
                clearFieldError('telephone');
              }}
              placeholder="+261 34 00 000 00"
              keyboardType="phone-pad"
              testID="register-telephone"
              error={errors.telephone}
            />
            <AppSelect
              label={i18n.t('auth.register.champRole')}
              value={role}
              onChange={setRole}
              disabled={isLoading}
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
            <PasswordInput
              label={passwordLabel}
              value={password}
              onChangeText={(v) => {
                setPassword(v);
                clearFieldError('password');
              }}
              testID="register-password"
              error={errors.password}
            />
            <View style={styles.checkGrid}>
              <PwdCheck valid={pwdChecks.len} text={i18n.t('auth.register.securite.regleLongueur')} />
              <PwdCheck valid={pwdChecks.upper} text={i18n.t('libelles.uneMajuscule')} />
              <PwdCheck valid={pwdChecks.lower} text={i18n.t('libelles.uneMinuscule')} />
              <PwdCheck valid={pwdChecks.number} text={i18n.t('libelles.unChiffre')} />
            </View>
            <View style={styles.duo}>
              <View style={styles.duoCol}>
                <Button
                  onPress={() => setEtape(1)}
                  variant="secondary"
                  fullWidth
                  leftIcon={<ArrowLeft size={16} />}
                  testID="register-retour"
                >
                  {i18n.t('auth.register.retour')}
                </Button>
              </View>
              <View style={styles.duoCol}>
                <Button
                  onPress={handleRegister}
                  fullWidth
                  loading={isLoading}
                  testID="register-submit"
                >
                  {i18n.t('auth.register.soumettre')}
                </Button>
              </View>
            </View>
          </View>
        )}
        </View>
    </KeyboardAvoidingView>
  );
}

export default RegisterForm;
