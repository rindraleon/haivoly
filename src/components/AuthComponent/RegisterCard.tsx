


import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';


import { Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { Text, View } from 'react-native';

import { RegisterFormFields } from '@/components/AuthComponent/RegisterFormFields';
type Props = {
  clearFieldError: (field: "nom" | "prenom" | "email" | "telephone" | "password") => void;
  email: string;
  errors: Errors;
  handleRegister: () => void;
  isLoading: boolean;
  nom: string;
  password: string;
  /** Libellé affiché : `string`, pas une union de littéraux français (i18n). */
  passwordLabel: string;
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

export function RegisterCard({
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
<View
                  style={
                    styles.cardWrap
                  }
                >

                  <RegisterFormFields
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

                  {}

                  <View
                    style={
                      styles.footer
                    }
                  >

                    <View
                      style={
                        styles.footerBrand
                      }
                    >

                      <Sprout
                        size={13}
                        color="rgba(255,255,255,0.80)"
                        strokeWidth={2}
                      />

                      <Text
                        style={
                          styles.footerText
                        }
                      >
                        Haivoly
                      </Text>

                    </View>

                    <Text
                      style={
                        styles.footerCopy
                      }
                    >
                      © {new Date().getFullYear()} ·
                      Gestion agricole
                    </Text>

                  </View>

                </View>
  );
}
