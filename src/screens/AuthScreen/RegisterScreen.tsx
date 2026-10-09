 

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


export default function RegisterScreen() {


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
        return 'Créez un mot de passe sécurisé';
      }

      if (passwordScore <= 1) {
        return 'Mot de passe faible';
      }

      if (passwordScore === 2) {
        return 'Mot de passe moyen';
      }

      if (passwordScore === 3) {
        return 'Presque sécurisé';
      }

      return 'Mot de passe sécurisé';

    }, [
      password,
      passwordScore,
    ]);


  const validate = (): boolean => {

    const e: Errors = {};

    const clean = (
      value: string,
    ) =>
      value.trim();


    if (!clean(nom)) {

      e.nom =
        'Le nom est obligatoire.';

    } else if (
      !/^[A-Za-zÀ-ÿ\s'-]+$/.test(
        clean(nom),
      )
    ) {

      e.nom =
        'Nom invalide.';
    }


    if (
      clean(prenom) &&
      !/^[A-Za-zÀ-ÿ\s'-]+$/.test(
        clean(prenom),
      )
    ) {

      e.prenom =
        'Prénom invalide.';
    }


    if (!clean(email)) {

      e.email =
        "L'email est obligatoire.";

    } else if (
      !estEmailValide(
        clean(email),
      )
    ) {

      e.email =
        'Email invalide.';
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
          'Téléphone invalide.';

      } else if (
        phone
          .replace('+', '')
          .length < 8
      ) {

        e.telephone =
          'Téléphone trop court.';
      }
    }


    if (!password) {

      e.password =
        'Le mot de passe est obligatoire.';

    } else if (
      !pwdChecks.len
    ) {

      e.password =
        'Au moins 8 caractères.';

    } else if (
      !pwdChecks.upper ||
      !pwdChecks.lower ||
      !pwdChecks.number
    ) {

      e.password =
        'Ajoutez majuscule, minuscule et chiffre.';
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
        onSuccess: () => {

          router.replace(
            '/(auth)/login' as any,
          );
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
                ? 'Cette adresse email est déjà utilisée.'
                : undefined),
            telephone: erreursServeur.telephone,
            password: erreursServeur.password,
            general: messageErreur(
              err,
              'Impossible de créer le compte.',
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

      {/* =================================================
          BACKGROUND DECORATIF
      ================================================= */}

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

      {/* =================================================
          KEYBOARD
      ================================================= */}

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



