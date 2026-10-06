/**
 * Section `Keyboard1` extraite de `Keyboard`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */




import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';


import { Leaf, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/AuthComponent/Card';
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

export function Keyboard1({
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
<ScrollView
              contentContainerStyle={
                styles.scroll
              }
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="on-drag"
              showsVerticalScrollIndicator={false}
            >

              {/* =============================================
                  HERO
              ============================================= */}

              <View
                style={
                  styles.hero
                }
              >

                <View
                  style={
                    styles.heroTopRow
                  }
                >

                  <View
                    style={
                      styles.logoCircle
                    }
                  >

                    <Sprout
                      size={13}
                      color="#FFFFFF"
                      strokeWidth={2}
                    />

                     <Text
                    style={
                      styles.brandTitle
                    }
                  >
                    Haivoly
                  </Text>

                  </View>

                  <View
                    style={
                      styles.heroBadge
                    }
                  >

                    <Leaf
                      size={13}
                      color="#FFFFFF"
                      strokeWidth={2}
                    />

                    <Text
                      style={
                        styles.heroBadgeText
                      }
                    >
                      AGRICULTURE
                    </Text>

                  </View>

                </View>

                <View
                  style={
                    styles.heroCopy
                  }
                >

                  <Text
                    style={
                      styles.heroTitle
                    }
                  >
                    Cultivez votre réussite.
                  </Text>

                  <Text
                    style={
                      styles.heroSubtitle
                    }
                  >
                    Gérez vos parcelles,
                    cultures et activités
                    agricoles simplement.
                  </Text>

                </View>

                <View
                  style={
                    styles.heroBottomHint
                  }
                >

                  <View
                    style={
                      styles.heroDot
                    }
                  />

                  <Text
                    style={
                      styles.heroHintText
                    }
                  >
                    Votre exploitation,
                    au même endroit.
                  </Text>

                </View>

              </View>

              {/* =============================================
                  CARD
              ============================================= */}

              <Card
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

            </ScrollView>
  );
}
