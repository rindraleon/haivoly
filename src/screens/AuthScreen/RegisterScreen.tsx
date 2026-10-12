 
import { useTranslation } from 'react-i18next';

import { useMemo, useState } from 'react';

import { View } from 'react-native';

import { router } from 'expo-router';

import { Leaf } from 'lucide-react-native';

import { useRegister } from '@/hooks/auth/useRegister';


import { styles } from './RegisterScreen.styles';
import { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';

import { Keyboard } from '@/components/AuthComponent/Keyboard';
import { estEmailValide } from '@/utils/email';
import { erreursParChamp, estErreurDe, messageErreur } from '@/utils/erreur';
import { i18n } from '@/i18n/instance';


export default function RegisterScreen() {
  const { t } = useTranslation();


  const [nom, setNom] =
    useState('');

  const [prenom, setPrenom] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [telephone, setTelephone] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [errors, setErrors] =
    useState<Errors>({});


  const mutation =
    useRegister();


  const pwdChecks =
    useMemo(() => {
      return {
        len:
          password.length >= 8,

        upper:
          /[A-Z]/.test(password),

        lower:
          /[a-z]/.test(password),

        number:
          /\d/.test(password),
      };
    }, [
      password,
    ]);

  const passwordScore =
    useMemo(() => {
      return [
        pwdChecks.len,
        pwdChecks.upper,
        pwdChecks.lower,
        pwdChecks.number,
      ].filter(Boolean).length;
    }, [
      pwdChecks,
    ]);

  const passwordLabel =
    useMemo(() => {

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
    }, [
      password,
      passwordScore,
      t,
    ]);


  const validate = (): boolean => {

    const e: Errors = {};

    const clean = (
      value: string,
    ) =>
      value.trim();


    if (!clean(nom)) {

      e.nom =
        i18n.t('divers.nomObligatoire');

    } else if (
      !/^[A-Za-zÀ-ÿ\s'-]+$/.test(
        clean(nom),
      )
    ) {

      e.nom =
        t('auth.register.nomInvalide');
    }


    if (
      clean(prenom) &&
      !/^[A-Za-zÀ-ÿ\s'-]+$/.test(
        clean(prenom),
      )
    ) {

      e.prenom =
        t('auth.register.prenomInvalide');
    }


    if (!clean(email)) {

      e.email =
        i18n.t('auth.lEmailObligatoire');

    } else if (
      !estEmailValide(
        clean(email),
      )
    ) {

      e.email =
        t('auth.register.emailInvalide');
    }


    if (
      clean(telephone)
    ) {

      const phone =
        clean(
          telephone,
        ).replace(
          /[\s()-]/g,
          '',
        );

      if (
        !/^\+?\d+$/.test(
          phone,
        )
      ) {

        e.telephone =
          t('auth.register.telephoneInvalide');

      } else if (
        phone
          .replace('+', '')
          .length < 8
      ) {

        e.telephone =
          t('auth.register.telephoneCourt');
      }
    }


    if (!password) {

      e.password =
        i18n.t('auth.motPasseObligatoire');

    } else if (
      !pwdChecks.len
    ) {

      e.password =
        t('auth.register.motDePasseCourt');

    } else if (
      !pwdChecks.upper ||
      !pwdChecks.lower ||
      !pwdChecks.number
    ) {

      e.password =
        t('auth.register.reglesMotDePasse');
    }

    setErrors(e);

    return (
      Object.keys(e)
        .length === 0
    );
  };


  const handleRegister = () => {

    setErrors({});

    if (!validate()) {
      return;
    }

    mutation.mutate(
      {
        nom:
          nom.trim(),

        prenom:
          prenom.trim(),

        email:
          email.trim(),

        telephone:
          telephone.trim() ||
          undefined,

        password,
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

        onError: (
          err: unknown,
        ) => {

          // Erreur structurée : le serveur indique le champ fautif
          // (`fields[].path`) ou un code précis (`USER_EMAIL_ALREADY_EXISTS`).
          const erreursServeur =
            erreursParChamp(err);

          setErrors({
            nom: erreursServeur.nom,
            email:
              erreursServeur.email ??
              (estErreurDe(err, 'USER_EMAIL_ALREADY_EXISTS')
                ? t('auth.register.emailDejaUtilise')
                : undefined),
            telephone: erreursServeur.telephone,
            password: erreursServeur.password,
            general: messageErreur(
              err,
              t('auth.register.echecCreation'),
            ),
          });
        },
      },
    );
  };


  const isLoading =
    mutation.isPending;


  const clearFieldError = (
    field:
      | 'nom'
      | 'prenom'
      | 'email'
      | 'telephone'
      | 'password',
  ) => {

    setErrors(
      (
        previous,
      ) => ({
        ...previous,

        [field]:
          undefined,

        ...(field === 'nom' ||
        field === 'email'
          ? {
              general:
                undefined,
            }
          : {}),
      }),
    );
  };


  return (

    <View
      style={
        styles.root
      }
    >

      {}

      <View
        pointerEvents="none"
        style={
          styles.backgroundDecor
        }
      >

        <View
          style={
            styles.decorCircleLarge
          }
        />

        <View
          style={
            styles.decorCircleMedium
          }
        />

        <View
          style={
            styles.decorCircleSmall
          }
        />

        <Leaf
          size={190}
          color="rgba(255,255,255,0.06)"
          strokeWidth={1}
          style={
            styles.decorLeafOne
          }
        />

        <Leaf
          size={135}
          color="rgba(255,255,255,0.05)"
          strokeWidth={1}
          style={
            styles.decorLeafTwo
          }
        />

      </View>

      {}

      <Keyboard
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
      />

    </View>
  );
}


