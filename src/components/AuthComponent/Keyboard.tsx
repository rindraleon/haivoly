/**
 * Section `Keyboard` extraite de `RegisterScreen`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */




import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';



import type { Dispatch, SetStateAction } from 'react';
import { KeyboardAvoidingView, Platform } from 'react-native';

import { Keyboard1 } from '@/components/AuthComponent/Keyboard1';
type Props = {
  clearFieldError: (field: "nom" | "prenom" | "email" | "telephone" | "password") => void;
  email: string;
  errors: Errors;
  handleRegister: () => void;
  isLoading: boolean;
  nom: string;
  password: string;
  passwordLabel: "Créez un mot de passe sécurisé" | "Mot de passe faible" | "Mot de passe moyen" | "Presque sécurisé" | "Mot de passe sécurisé";
  passwordScore: number;
  prenom: string;
  pwdChecks: { len: boolean; upper: boolean; lower: boolean; number: boolean; };
  setEmail: Dispatch<SetStateAction<string>>;
  setNom: Dispatch<SetStateAction<string>>;
  setPassword: Dispatch<SetStateAction<string>>;
  setPrenom: Dispatch<SetStateAction<string>>;
  setTelephone: Dispatch<SetStateAction<string>>;
  telephone: string;
};

export function Keyboard({
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
  telephone,
}: Props) {
  return (
<KeyboardAvoidingView
          style={
            styles.keyboard
          }
          behavior={
            Platform.OS === 'ios'
              ? 'padding'
              : undefined
          }
        >

          <Keyboard1
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

        </KeyboardAvoidingView>
  );
}
