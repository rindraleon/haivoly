import { useTranslation } from 'react-i18next';

import { useMemo, useState } from 'react';

import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';

import { router } from 'expo-router';

import { ArrowLeft } from 'lucide-react-native';

import { useRegister } from '@/hooks/auth/useRegister';

import { styles } from './RegisterScreen.styles';
import {
  Errors,
  cleErreurPseudoServeur,
  langueAPI,
} from '@/screens/AuthScreen/RegisterScreen.helpers';

import { MarqueHaivoly } from '@/components/AuthComponent/MarqueHaivoly';
import { RegisterForm } from '@/components/AuthComponent/RegisterForm';
import { estEmailValide } from '@/utils/email';
import { codeErreur, erreursParChamp, estErreurDe, messageErreur } from '@/utils/erreur';
import { CLE_ERREUR_PSEUDO, normaliserPseudo, validerPseudo } from '@/utils/pseudo';
import { i18n } from '@/i18n/instance';
import type { Role } from '@/types';

export default function RegisterScreen() {
  const { t } = useTranslation();

  const [nom, setNom] = useState('');

  const [prenom, setPrenom] = useState('');

  const [email, setEmail] = useState('');

  const [username, setUsername] = useState('');

  const [telephone, setTelephone] = useState('');

  const [password, setPassword] = useState('');

  const [role, setRole] = useState<Role>('PROPRIETAIRE');

  const [errors, setErrors] = useState<Errors>({});

  const mutation = useRegister();

  const pwdChecks = useMemo(() => {
    return {
      len: password.length >= 8,

      upper: /[A-Z]/.test(password),

      lower: /[a-z]/.test(password),

      number: /\d/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    return [pwdChecks.len, pwdChecks.upper, pwdChecks.lower, pwdChecks.number].filter(Boolean)
      .length;
  }, [pwdChecks]);

  const passwordLabel = useMemo(() => {
    if (!password) {
      return t('auth.register.securite.titre');
    }

    if (passwordScore <= 1) {
      return t('auth.register.securite.faible');
    }

    if (passwordScore === 2) {
      return t('auth.register.securite.moyen');
    }

    if (passwordScore === 3) {
      return t('auth.register.securite.presque');
    }

    return t('auth.register.securite.fort');

    // `t` doit figurer dans les dépendances : sans lui, le libellé resterait
    // figé dans la langue active au moment du premier rendu.
  }, [password, passwordScore, t]);

  const validate = (): boolean => {
    const e: Errors = {};

    const clean = (value: string) => value.trim();

    if (!clean(nom)) {
      e.nom = i18n.t('divers.nomObligatoire');
    } else if (!/^[A-Za-zÀ-ÿ\s'-]+$/.test(clean(nom))) {
      e.nom = t('auth.register.nomInvalide');
    }

    if (clean(prenom) && !/^[A-Za-zÀ-ÿ\s'-]+$/.test(clean(prenom))) {
      e.prenom = t('auth.register.prenomInvalide');
    }

    if (!clean(email)) {
      e.email = i18n.t('auth.lEmailObligatoire');
    } else if (!estEmailValide(clean(email))) {
      e.email = t('auth.register.emailInvalide');
    }

    if (clean(username)) {
      const verdict = validerPseudo(username);

      if (!verdict.valide && verdict.motif) {
        e.username = t(CLE_ERREUR_PSEUDO[verdict.motif]);
      }
    }

    if (clean(telephone)) {
      const phone = clean(telephone).replace(/[\s()-]/g, '');

      if (!/^\+?\d+$/.test(phone)) {
        e.telephone = t('auth.register.telephoneInvalide');
      } else if (phone.replace('+', '').length < 8) {
        e.telephone = t('auth.register.telephoneCourt');
      }
    }

    if (!password) {
      e.password = i18n.t('auth.motPasseObligatoire');
    } else if (!pwdChecks.len) {
      e.password = t('auth.register.motDePasseCourt');
    } else if (!pwdChecks.upper || !pwdChecks.lower || !pwdChecks.number) {
      e.password = t('auth.register.reglesMotDePasse');
    }

    setErrors(e);

    return Object.keys(e).length === 0;
  };

  const handleRegister = () => {
    setErrors({});

    if (!validate()) {
      return;
    }

    mutation.mutate(
      {
        nom: nom.trim(),

        prenom: prenom.trim(),

        email: email.trim(),

        telephone: telephone.trim() || undefined,

        password,

        username: normaliserPseudo(username) || undefined,

        langue: langueAPI(i18n.language),

        role,
      },

      {
        onSuccess: (response) => {
          router.replace({
            pathname: '/(auth)/verify-email',
            params: {
              email: email.trim(),
              emailEnvoye: response.emailEnvoye === false ? '0' : '1',
            },
          } as never);
        },

        onError: (err: unknown) => {
          // Erreur structurée : le serveur indique le champ fautif
          // (`fields[].path`) ou un code précis (`USER_EMAIL_ALREADY_EXISTS`).
          const erreursServeur = erreursParChamp(err);

          // Un pseudo déjà pris ou réservé peut remonter soit en champ fautif,
          // soit uniquement par son code : les deux chemins sont traités.
          const code = codeErreur(err);

          const clePseudo = code ? cleErreurPseudoServeur(code) : undefined;

          setErrors({
            nom: erreursServeur.nom,
            username: erreursServeur.username ?? (clePseudo ? t(clePseudo) : undefined),
            email:
              erreursServeur.email ??
              (estErreurDe(err, 'USER_EMAIL_ALREADY_EXISTS')
                ? t('auth.register.emailDejaUtilise')
                : undefined),
            telephone: erreursServeur.telephone,
            password: erreursServeur.password,
            general: messageErreur(err, t('auth.register.echecCreation')),
          });
        },
      },
    );
  };

  const isLoading = mutation.isPending;

  const clearFieldError = (
    field: 'nom' | 'prenom' | 'email' | 'telephone' | 'password' | 'username',
  ) => {
    setErrors((previous) => ({
      ...previous,

      [field]: undefined,

      ...(field === 'nom' || field === 'email'
        ? {
            general: undefined,
          }
        : {}),
    }));
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.contenu}>
            {/* Flèche retour identique à l'écran de connexion. */}
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

            {/* En-tête de marque : logo officiel transparent, sans aucun
                cadre blanc, posé à même le fond clair comme sur la connexion. */}
            <View style={styles.headerBloc}>
              <MarqueHaivoly taille={74} testID="register-logo" />
              <Text style={styles.headerTitre}>{t('auth.register.titre')}</Text>
              <Text style={styles.headerSousTitre}>{t('auth.register.sousTitre')}</Text>
            </View>

            <View style={styles.card}>
              <RegisterForm
                clearFieldError={clearFieldError}
                email={email}
                errors={errors}
                handleRegister={handleRegister}
                isLoading={isLoading}
                nom={nom}
                password={password}
                passwordLabel={passwordLabel}
                passwordScore={passwordScore}
                prenom={prenom}
                pwdChecks={pwdChecks}
                setEmail={setEmail}
                setNom={setNom}
                setPassword={setPassword}
                setPrenom={setPrenom}
                setTelephone={setTelephone}
                telephone={telephone}
                setUsername={setUsername}
                username={username}
                role={role}
                setRole={setRole}
              />
            </View>

            <Text style={styles.footer}>
              {t('auth.piedDePage', { annee: new Date().getFullYear() })}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
