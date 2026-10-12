import { PwdCheck } from '@/components/AuthComponent/PwdCheck';
import { i18n } from '@/i18n/instance';
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

                      {}

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

                      {}

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

                      {}

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
                            label={i18n.t('profil.prenom')}
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
                              label={i18n.t('domaine.telephone')}
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

                      {}

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
                          label={i18n.t('libelles.motDePasse')}
                          placeholder={i18n.t('auth.register.motDePasseCourt')}
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

                        {}

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
                                text={i18n.t('auth.register.securite.regleLongueur')}
                              />

                              <PwdCheck
                                valid={
                                  pwdChecks.upper
                                }
                                text={i18n.t('libelles.uneMajuscule')}
                              />

                              <PwdCheck
                                valid={
                                  pwdChecks.lower
                                }
                                text={i18n.t('libelles.uneMinuscule')}
                              />

                              <PwdCheck
                                valid={
                                  pwdChecks.number
                                }
                                text={i18n.t('libelles.unChiffre')}
                              />

                            </View>

                          </View>
                        )}

                      </View>

                      {}

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

                      {}

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
                          ? i18n.t('auth.register.creation')
                          : i18n.t('auth.register.soumettre')}
                      </Button>

                      {}

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
