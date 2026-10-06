/* eslint-disable react/no-unescaped-entities */

import { useMemo, useState } from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  AlertCircle,
  ArrowRight,
  Check,
  Leaf,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  Sprout,
  User,
} from 'lucide-react-native';

import { useRegister } from '@/hooks/useRegister';

import {
  colors,
  radius,
} from '@/design/tokens';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';


// =====================================================
// TYPES
// =====================================================

type Errors = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  general?: string;
};


// =====================================================
// COMPONENT
// =====================================================

export default function RegisterScreen() {

  // ===================================================
  // FORM
  // ===================================================

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


  // ===================================================
  // MUTATION
  // ===================================================

  const mutation =
    useRegister();


  // ===================================================
  // PASSWORD CHECKS
  // ===================================================

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
          /[0-9]/.test(password),
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


  // ===================================================
  // VALIDATION
  // ===================================================

  const validate = (): boolean => {

    const e: Errors = {};

    const clean = (
      value: string,
    ) =>
      value.trim();


    // -------------------------------------------------
    // NOM
    // -------------------------------------------------

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


    // -------------------------------------------------
    // PRENOM
    // -------------------------------------------------

    if (
      clean(prenom) &&
      !/^[A-Za-zÀ-ÿ\s'-]+$/.test(
        clean(prenom),
      )
    ) {

      e.prenom =
        'Prénom invalide.';
    }


    // -------------------------------------------------
    // EMAIL
    // -------------------------------------------------

    if (!clean(email)) {

      e.email =
        "L'email est obligatoire.";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        clean(email),
      )
    ) {

      e.email =
        'Email invalide.';
    }


    // -------------------------------------------------
    // TELEPHONE
    // -------------------------------------------------

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
        !/^\+?[0-9]+$/.test(
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


    // -------------------------------------------------
    // PASSWORD
    // -------------------------------------------------

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


  // ===================================================
  // REGISTER
  // ===================================================

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
          err: any,
        ) => {

          const msg =
            err?.response?.data?.message;

          let message =
            "Impossible de créer le compte.";


          if (
            Array.isArray(msg)
          ) {

            message =
              msg.join('\n');

          } else if (
            typeof msg === 'string'
          ) {

            message =
              msg;
          }


          setErrors({
            general:
              message,
          });
        },
      },
    );
  };


  // ===================================================
  // LOADING
  // ===================================================

  const isLoading =
    mutation.isPending;


  // ===================================================
  // HELPERS
  // ===================================================

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


  // ===================================================
  // RENDER
  // ===================================================

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

          <View
            style={
              styles.cardWrap
            }
          >

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


            {/* =========================================
                FOOTER
            ========================================== */}

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

        </ScrollView>

      </KeyboardAvoidingView>

    </View>
  );
}


// =====================================================
// PASSWORD CHECK
// =====================================================

function PwdCheck({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {

  return (

    <View
      style={
        styles.checkItem
      }
    >

      <View
        style={[
          styles.checkIcon,
          valid &&
            styles.checkIconValid,
        ]}
      >

        <Check
          size={10}
          color={
            valid
              ? colors.primary[700]
              : colors.neutral[400]
          }
          strokeWidth={3}
        />

      </View>

      <Text
        style={[
          styles.checkText,
          valid &&
            styles.checkTextValid,
        ]}
      >
        {text}
      </Text>

    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // =================================================
    // ROOT
    // =================================================

    root: {
      flex: 1,
      backgroundColor:
        colors.primary[700],
    },


    keyboard: {
      flex: 1,
    },


    scroll: {
      flexGrow: 1,
      paddingBottom: 24,
    },


    // =================================================
    // DECORATIONS
    // =================================================

    backgroundDecor: {
      ...StyleSheet.absoluteFill,
      overflow: 'hidden',
    },


    decorCircleLarge: {
      position: 'absolute',
      width: 330,
      height: 330,
      borderRadius: 165,
      backgroundColor:
        'rgba(255,255,255,0.055)',
      top: -135,
      right: -115,
    },


    decorCircleMedium: {
      position: 'absolute',
      width: 230,
      height: 230,
      borderRadius: 115,
      backgroundColor:
        'rgba(255,255,255,0.045)',
      top: 170,
      left: -145,
    },


    decorCircleSmall: {
      position: 'absolute',
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor:
        'rgba(255,255,255,0.035)',
      top: 420,
      right: -65,
    },


    decorLeafOne: {
      position: 'absolute',
      top: 42,
      right: 22,
      transform: [
        {
          rotate: '-20deg',
        },
      ],
    },


    decorLeafTwo: {
      position: 'absolute',
      top: 250,
      left: -20,
      transform: [
        {
          rotate: '35deg',
        },
      ],
    },


    // =================================================
    // HERO
    // =================================================

    hero: {
      paddingTop: 54,
      paddingHorizontal: 24,
      paddingBottom: 86,
    },


    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
    },


    logoCircle: {
      width: 54,
      height: 54,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.14)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.23)',
    },


    heroBadge: {
      minHeight: 30,
      paddingHorizontal: 11,
      borderRadius: 999,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor:
        'rgba(255,255,255,0.11)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.15)',
    },


    heroBadgeText: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.1,
      color: '#FFFFFF',
    },


    heroCopy: {
      marginTop: 28,
      maxWidth: 340,
    },


    brandTitle: {
      fontSize: 14,
      fontWeight: '800',
      letterSpacing: 1.6,
      textTransform: 'uppercase',
      color:
        'rgba(255,255,255,0.74)',
      marginBottom: 10,
    },


    heroTitle: {
      fontSize: 34,
      lineHeight: 39,
      fontWeight: '900',
      letterSpacing: -1.1,
      color: '#FFFFFF',
    },


    heroSubtitle: {
      marginTop: 12,
      maxWidth: 315,
      fontSize: 14,
      lineHeight: 21,
      fontWeight: '500',
      color:
        'rgba(255,255,255,0.78)',
    },


    heroBottomHint: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 25,
    },


    heroDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor: '#FFFFFF',
    },


    heroHintText: {
      fontSize: 12,
      fontWeight: '600',
      color:
        'rgba(255,255,255,0.72)',
    },


    // =================================================
    // CARD
    // =================================================

    cardWrap: {
      paddingHorizontal: 14,
      marginTop: -46,
    },


    card: {
      backgroundColor: '#FFFFFF',
      borderRadius: 28,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,

      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.92)',

      shadowColor: '#0B2E17',
      shadowOffset: {
        width: 0,
        height: 16,
      },
      shadowOpacity: 0.15,
      shadowRadius: 28,
      elevation: 9,
    },


    // =================================================
    // CARD HEADER
    // =================================================

    cardHeader: {
      gap: 7,
      marginBottom: 22,
    },


    eyebrowRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },


    eyebrowDot: {
      width: 7,
      height: 7,
      borderRadius: 4,
      backgroundColor:
        colors.primary[500],
    },


    eyebrow: {
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 1.3,
      color:
        colors.primary[700],
    },


    cardTitle: {
      fontSize: 24,
      lineHeight: 29,
      fontWeight: '900',
      letterSpacing: -0.7,
      color:
        colors.neutral[900],
    },


    cardSubtitle: {
      fontSize: 13.5,
      lineHeight: 20,
      color:
        colors.neutral[500],
      maxWidth: 335,
    },


    // =================================================
    // ERROR
    // =================================================

    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,

      backgroundColor:
        colors.error[50],

      borderWidth: 1,
      borderColor:
        colors.error[200],

      borderRadius:
        radius.md,

      padding: 12,
      marginBottom: 18,
    },


    bannerIcon: {
      width: 30,
      height: 30,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colors.error[100],
    },


    bannerText: {
      flex: 1,
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
      color:
        colors.error[700],
      paddingTop: 4,
    },


    // =================================================
    // SECTION
    // =================================================

    section: {
      marginBottom: 24,
    },


    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 11,
      marginBottom: 15,
    },


    sectionIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        colors.primary[50],

      borderWidth: 1,
      borderColor:
        colors.primary[200],
    },


    sectionHeaderText: {
      flex: 1,
      paddingTop: 1,
    },


    sectionTitle: {
      fontSize: 14,
      fontWeight: '800',
      color:
        colors.neutral[900],
    },


    sectionSubtitle: {
      marginTop: 2,
      fontSize: 11.5,
      lineHeight: 16,
      color:
        colors.neutral[500],
    },


    form: {
      gap: 13,
    },


    optionalField: {
      position: 'relative',
    },


    // =================================================
    // PASSWORD
    // =================================================

    passwordPanel: {
      marginTop: -2,
      padding: 13,
      borderRadius: 16,
      backgroundColor:
        colors.neutral[100],
      borderWidth: 1,
      borderColor:
        colors.border.default,
    },


    passwordHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 10,
      marginBottom: 9,
    },


    passwordLabel: {
      flex: 1,
      fontSize: 11.5,
      fontWeight: '700',
      color:
        colors.neutral[600],
    },


    passwordScoreText: {
      fontSize: 11,
      fontWeight: '800',
      color:
        colors.neutral[500],
    },


    passwordScoreStrong: {
      color:
        colors.primary[700],
    },


    passwordProgress: {
      flexDirection: 'row',
      gap: 5,
      marginBottom: 12,
    },


    passwordSegment: {
      flex: 1,
      height: 4,
      borderRadius: 99,
      backgroundColor:
        colors.neutral[200],
    },


    passwordSegmentActive: {
      backgroundColor:
        colors.primary[500],
    },


    checkGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      rowGap: 8,
      columnGap: 10,
    },


    checkItem: {
      width: '47%',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
    },


    checkIcon: {
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        colors.neutral[200],
    },


    checkIconValid: {
      backgroundColor:
        colors.primary[50],
      borderWidth: 1,
      borderColor:
        colors.primary[200],
    },


    checkText: {
      flex: 1,
      fontSize: 10.5,
      lineHeight: 14,
      color:
        colors.neutral[500],
    },


    checkTextValid: {
      color:
        colors.primary[700],
      fontWeight: '700',
    },


    // =================================================
    // TRUST
    // =================================================

    trustBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,

      padding: 13,
      marginBottom: 18,

      borderRadius: 16,

      backgroundColor:
        colors.primary[50],

      borderWidth: 1,
      borderColor:
        colors.primary[100],
    },


    trustIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',

      backgroundColor:
        '#FFFFFF',
    },


    trustContent: {
      flex: 1,
    },


    trustTitle: {
      fontSize: 11.5,
      fontWeight: '800',
      color:
        colors.primary[700],
    },


    trustText: {
      marginTop: 2,
      fontSize: 10.5,
      lineHeight: 15,
      color:
        colors.neutral[500],
    },


    // =================================================
    // LOGIN
    // =================================================

    loginRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'center',
      flexWrap: 'wrap',
      gap: 5,
      marginTop: 15,
    },


    loginHint: {
      fontSize: 12,
      color:
        colors.neutral[500],
    },


    loginLinkContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },


    loginLink: {
      fontSize: 12,
      fontWeight: '800',
      color:
        colors.primary[700],
    },


    // =================================================
    // FOOTER
    // =================================================

    footer: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingTop: 18,
      paddingBottom: 4,
    },


    footerBrand: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },


    footerText: {
      fontSize: 12,
      fontWeight: '800',
      color:
        'rgba(255,255,255,0.84)',
      letterSpacing: 0.3,
    },


    footerCopy: {
      fontSize: 10.5,
      color:
        'rgba(255,255,255,0.56)',
    },

  });