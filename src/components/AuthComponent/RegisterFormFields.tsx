/**
 * Section `RegisterFormFields` extraite de `Card`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { PwdCheck } from '@/components/AuthComponent/PwdCheck';
import { Button } from '@/components/CommonComponent/Button';
import { Input } from '@/components/CommonComponent/Input';
import { PasswordInput } from '@/components/CommonComponent/PasswordInput';
import type { Errors } from '@/screens/AuthScreen/RegisterScreen.helpers';
import { styles } from '@/screens/AuthScreen/RegisterScreen.styles';
import { colors } from '@/theme';
import { router } from 'expo-router';
import { AlertCircle, ArrowRight, LockKeyhole, ShieldCheck, User } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { Pressable, Text, View } from 'react-native';

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

export function RegisterFormFields({
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
                        styles.card
                      }
                    >

                      {/* -----------------------------------------
                          CARD HEADER
                      ----------------------------------------- */}

                      <View
                        style={
                          styles.cardHeader
                        }
                      >

                        <View
                          style={
                            styles.eyebrowRow
                          }
                        >

                          <View
                            style={
                              styles.eyebrowDot
                            }
                          />

                          <Text
                            style={
                              styles.eyebrow
                            }
                          >
                            INSCRIPTION
                          </Text>

                        </View>

                        <Text
                          style={
                            styles.cardTitle
                          }
                        >
                          Créer votre compte
                        </Text>

                        <Text
                          style={
                            styles.cardSubtitle
                          }
                        >
                          Quelques informations suffisent
                          pour commencer à gérer votre
                          exploitation avec Haivoly.
                        </Text>

                      </View>

                      {/* -----------------------------------------
                          GENERAL ERROR
                      ----------------------------------------- */}

                      {errors.general && (
                        <View
                          style={
                            styles.banner
                          }
                        >

                          <View
                            style={
                              styles.bannerIcon
                            }
                          >

                            <AlertCircle
                              size={17}
                              color={
                                colors.error[600]
                              }
                              strokeWidth={2.3}
                            />

                          </View>

                          <Text
                            style={
                              styles.bannerText
                            }
                          >
                            {errors.general}
                          </Text>

                        </View>
                      )}

                      {/* -----------------------------------------
                          PERSONAL INFORMATION
                      ----------------------------------------- */}

                      <View
                        style={
                          styles.section
                        }
                      >

                        <View
                          style={
                            styles.sectionHeader
                          }
                        >

                          <View
                            style={
                              styles.sectionIcon
                            }
                          >

                            <User
                              size={16}
                              color={
                                colors.primary[700]
                              }
                              strokeWidth={2.2}
                            />

                          </View>

                          <View
                            style={
                              styles.sectionHeaderText
                            }
                          >

                            <Text
                              style={
                                styles.sectionTitle
                              }
                            >
                              Informations personnelles
                            </Text>

                            <Text
                              style={
                                styles.sectionSubtitle
                              }
                            >
                              Dites-nous comment vous appeler.
                            </Text>

                          </View>

                        </View>

                        <View
                          style={
                            styles.form
                          }
                        >

                          <Input
                            label="Nom"
                            placeholder="Rakoto"
                            value={nom}
                            onChangeText={(
                              value,
                            ) => {

                              setNom(value);

                              if (
                                errors.nom ||
                                errors.general
                              ) {

                                clearFieldError(
                                  'nom',
                                );
                              }
                            }}
                            error={
                              errors.nom
                            }
                            editable={
                              !isLoading
                            }
                            required
                          />

                          <Input
                            label="Prénom"
                            placeholder="Hery"
                            value={prenom}
                            onChangeText={(
                              value,
                            ) => {

                              setPrenom(
                                value,
                              );

                              if (
                                errors.prenom
                              ) {

                                clearFieldError(
                                  'prenom',
                                );
                              }
                            }}
                            error={
                              errors.prenom
                            }
                            editable={
                              !isLoading
                            }
                          />

                          <Input
                            label="Adresse email"
                            placeholder="exemple@email.com"
                            value={email}
                            onChangeText={(
                              value,
                            ) => {

                              setEmail(value);

                              if (
                                errors.email ||
                                errors.general
                              ) {

                                clearFieldError(
                                  'email',
                                );
                              }
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={
                              !isLoading
                            }
                            error={
                              errors.email
                            }
                            required
                          />

                          <View
                            style={
                              styles.optionalField
                            }
                          >

                            <Input
                              label="Téléphone"
                              placeholder="+261 34 00 000 00"
                              value={
                                telephone
                              }
                              onChangeText={(
                                value,
                              ) => {

                                setTelephone(
                                  value,
                                );

                                if (
                                  errors.telephone
                                ) {

                                  clearFieldError(
                                    'telephone',
                                  );
                                }
                              }}
                              keyboardType="phone-pad"
                              editable={
                                !isLoading
                              }
                              hint="Optionnel"
                              error={
                                errors.telephone
                              }
                            />

                          </View>

                        </View>

                      </View>

                      {/* -----------------------------------------
                          SECURITY
                      ----------------------------------------- */}

                      <View
                        style={
                          styles.section
                        }
                      >

                        <View
                          style={
                            styles.sectionHeader
                          }
                        >

                          <View
                            style={
                              styles.sectionIcon
                            }
                          >

                            <LockKeyhole
                              size={16}
                              color={
                                colors.primary[700]
                              }
                              strokeWidth={2.2}
                            />

                          </View>

                          <View
                            style={
                              styles.sectionHeaderText
                            }
                          >

                            <Text
                              style={
                                styles.sectionTitle
                              }
                            >
                              Sécurisez votre compte
                            </Text>

                            <Text
                              style={
                                styles.sectionSubtitle
                              }
                            >
                              Utilisez un mot de passe difficile
                              à deviner.
                            </Text>

                          </View>

                        </View>

                        <PasswordInput
                          label="Mot de passe"
                          placeholder="Au moins 8 caractères"
                          value={
                            password
                          }
                          onChangeText={(
                            value,
                          ) => {

                            setPassword(
                              value,
                            );

                            if (
                              errors.password
                            ) {

                              clearFieldError(
                                'password',
                              );
                            }
                          }}
                          editable={
                            !isLoading
                          }
                          error={
                            errors.password
                          }
                          required
                        />

                        {/* -------------------------------------
                            PASSWORD STRENGTH
                        ------------------------------------- */}

                        {password.length > 0 && (

                          <View
                            style={
                              styles.passwordPanel
                            }
                          >

                            <View
                              style={
                                styles.passwordHeader
                              }
                            >

                              <Text
                                style={
                                  styles.passwordLabel
                                }
                              >
                                Sécurité du mot de passe
                              </Text>

                              <Text
                                style={[
                                  styles.passwordScoreText,
                                  passwordScore === 4 &&
                                    styles.passwordScoreStrong,
                                ]}
                              >
                                {passwordLabel}
                              </Text>

                            </View>

                            <View
                              style={
                                styles.passwordProgress
                              }
                            >

                              {[0, 1, 2, 3].map(
                                (
                                  index,
                                ) => (

                                  <View
                                    key={
                                      index
                                    }
                                    style={[
                                      styles.passwordSegment,
                                      index <
                                        passwordScore &&
                                        styles.passwordSegmentActive,
                                    ]}
                                  />

                                ),
                              )}

                            </View>

                            <View
                              style={
                                styles.checkGrid
                              }
                            >

                              <PwdCheck
                                valid={
                                  pwdChecks.len
                                }
                                text="8 caractères minimum"
                              />

                              <PwdCheck
                                valid={
                                  pwdChecks.upper
                                }
                                text="Une majuscule"
                              />

                              <PwdCheck
                                valid={
                                  pwdChecks.lower
                                }
                                text="Une minuscule"
                              />

                              <PwdCheck
                                valid={
                                  pwdChecks.number
                                }
                                text="Un chiffre"
                              />

                            </View>

                          </View>
                        )}

                      </View>

                      {/* -----------------------------------------
                          TRUST MESSAGE
                      ----------------------------------------- */}

                      <View
                        style={
                          styles.trustBox
                        }
                      >

                        <View
                          style={
                            styles.trustIcon
                          }
                        >

                          <ShieldCheck
                            size={19}
                            color={
                              colors.primary[700]
                            }
                            strokeWidth={2.1}
                          />

                        </View>

                        <View
                          style={
                            styles.trustContent
                          }
                        >

                          <Text
                            style={
                              styles.trustTitle
                            }
                          >
                            Vos données restent protégées
                          </Text>

                          <Text
                            style={
                              styles.trustText
                            }
                          >
                            Haivoly utilise vos informations
                            uniquement pour gérer votre espace
                            agricole.
                          </Text>

                        </View>

                      </View>

                      {/* -----------------------------------------
                          BUTTON
                      ----------------------------------------- */}

                      <Button
                        onPress={
                          handleRegister
                        }
                        loading={
                          isLoading
                        }
                        fullWidth
                        size="lg"
                      >
                        {isLoading
                          ? 'Création...'
                          : 'Créer mon compte'}
                      </Button>

                      {/* -----------------------------------------
                          LOGIN
                      ----------------------------------------- */}

                      <View
                        style={
                          styles.loginRow
                        }
                      >

                        <Text
                          style={
                            styles.loginHint
                          }
                        >
                          Vous avez déjà un compte ?
                        </Text>

                        <Pressable
                          onPress={() =>
                            router.replace(
                              '/(auth)/login' as any,
                            )
                          }
                          disabled={
                            isLoading
                          }
                          hitSlop={8}
                        >

                          <View
                            style={
                              styles.loginLinkContainer
                            }
                          >

                            <Text
                              style={
                                styles.loginLink
                              }
                            >
                              Se connecter
                            </Text>

                            <ArrowRight
                              size={14}
                              color={
                                colors.primary[700]
                              }
                              strokeWidth={2.5}
                            />

                          </View>

                        </Pressable>

                      </View>

                    </View>
  );
}
