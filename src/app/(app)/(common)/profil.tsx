import React from 'react';

import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { router } from 'expo-router';

import {
  ChevronRight,
  LogOut,
  Mail,
  Phone,
  ShieldCheck,
  Sprout,
  User,
} from 'lucide-react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useProfile } from '@/hooks/useProfile';
import { removeToken } from '@/storage/authStorage';

import {
  colors,
  radius,
} from '@/design/tokens';

import { AppBottomBar } from '@/components/layout/AppBottomBar';


// =====================================================
// ÉCRAN PROFIL
// =====================================================

export default function ProfilScreen() {
  const insets = useSafeAreaInsets();

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useProfile();


  // ===================================================
  // DÉCONNEXION
  // ===================================================

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },

        {
          text: 'Se déconnecter',
          style: 'destructive',

          onPress: async () => {
            try {
              await removeToken();

              router.replace(
                '/(auth)/login',
              );
            } catch (error) {
              console.error(
                'Erreur déconnexion :',
                error,
              );

              Alert.alert(
                'Erreur',
                'Impossible de vous déconnecter. Veuillez réessayer.',
              );
            }
          },
        },
      ],
    );
  };


  // ===================================================
  // LOADING
  // ===================================================

  if (isLoading) {
    return (
      <View style={styles.screen}>
        <AgricultureBackground />

        <View
          style={[
            styles.loadingContainer,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  20,
                ),
            },
          ]}
        >
          <View
            style={
              styles.loadingIcon
            }
          >
            <Sprout
              size={28}
              color={
                colors.primary[700]
              }
            />
          </View>

          <ActivityIndicator
            size="small"
            color={
              colors.primary[600]
            }
          />

          <Text
            style={
              styles.loadingText
            }
          >
            Chargement du profil...
          </Text>
        </View>

        <AppBottomBar />
      </View>
    );
  }


  // ===================================================
  // ERREUR
  // ===================================================

  if (isError || !profile) {
    return (
      <View style={styles.screen}>
        <AgricultureBackground />

        <ScrollView
          contentContainerStyle={[
            styles.errorContainer,
            {
              paddingTop:
                Math.max(
                  insets.top,
                  24,
                ),
              paddingBottom: 120,
            },
          ]}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={() =>
                refetch()
              }
              tintColor={
                colors.primary[600]
              }
            />
          }
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={
              styles.errorIcon
            }
          >
            <User
              size={28}
              color={
                colors.primary[700]
              }
            />
          </View>

          <Text
            style={
              styles.errorTitle
            }
          >
            Impossible de charger le profil
          </Text>

          <Text
            style={
              styles.errorText
            }
          >
            Vérifiez votre connexion puis
            faites glisser vers le bas pour
            réessayer.
          </Text>

          <Pressable
            style={({ pressed }) => [
              styles.retryButton,
              pressed &&
                styles.retryButtonPressed,
            ]}
            onPress={() =>
              refetch()
            }
            accessibilityRole="button"
            accessibilityLabel="Réessayer de charger le profil"
          >
            <Text
              style={
                styles.retryButtonText
              }
            >
              Réessayer
            </Text>
          </Pressable>
        </ScrollView>

        <AppBottomBar />
      </View>
    );
  }


  // ===================================================
  // DONNÉES PROFIL
  // ===================================================

  const fullName = [
    profile.prenom,
    profile.nom,
  ]
    .filter(Boolean)
    .join(' ')
    .trim() || 'Utilisateur';


  const roleLabel =
    profile.role ===
    'AGRICULTEUR'
      ? 'Agriculteur'
      : 'Propriétaire';


  const initials =
    `${profile.prenom?.charAt(0) ?? ''}${profile.nom?.charAt(0) ?? ''}`
      .toUpperCase() || 'U';


  // ===================================================
  // RENDER
  // ===================================================

  return (
    <View style={styles.screen}>
      <AgricultureBackground />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop:
              Math.max(
                insets.top,
                18,
              ),
            paddingBottom: 120,
          },
        ]}
        refreshControl={
          <RefreshControl
            refreshing={isFetching}
            onRefresh={() =>
              refetch()
            }
            tintColor={
              colors.primary[600]
            }
            colors={[
              colors.primary[600],
            ]}
          />
        }
        showsVerticalScrollIndicator={
          false
        }
      >

        {/* =================================================
            HEADER
        ================================================= */}

        <View
          style={
            styles.header
          }
        >
          <View
            style={
              styles.headerIcon
            }
          >
            <Sprout
              size={19}
              color={
                colors.primary[700]
              }
            />
          </View>

          <View
            style={
              styles.headerTexts
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              COMPTE HAI VOLY
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Mon profil
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Gérez vos informations personnelles
            </Text>
          </View>
        </View>


        {/* =================================================
            CARTE IDENTITÉ
        ================================================= */}

        <View
          style={
            styles.profileCard
          }
        >
          <View
            style={
              styles.profileCardGlow
            }
          />

          <View
            style={
              styles.profileMain
            }
          >
            <View
              style={
                styles.avatarWrapper
              }
            >
              <View
                style={
                  styles.avatar
                }
              >
                <Text
                  style={
                    styles.avatarText
                  }
                >
                  {initials}
                </Text>
              </View>

              <View
                style={
                  styles.avatarBadge
                }
              >
                <ShieldCheck
                  size={15}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <View
              style={
                styles.profileIdentity
              }
            >
              <Text
                style={
                  styles.profileLabel
                }
              >
                VOTRE COMPTE
              </Text>

              <Text
                style={
                  styles.fullName
                }
                numberOfLines={2}
              >
                {fullName}
              </Text>

              <View
                style={
                  styles.roleBadge
                }
              >
                <Sprout
                  size={14}
                  color={
                    colors.primary[700]
                  }
                />

                <Text
                  style={
                    styles.roleText
                  }
                >
                  {roleLabel}
                </Text>
              </View>
            </View>
          </View>

          <View
            style={
              styles.profileDivider
            }
          />

          <View
            style={
              styles.profileHint
            }
          >
            <ShieldCheck
              size={16}
              color={
                colors.primary[600]
              }
            />

            <Text
              style={
                styles.profileHintText
              }
            >
              Vos informations sont utilisées
              pour personnaliser votre
              expérience HaiVoly.
            </Text>
          </View>
        </View>


        {/* =================================================
            INFORMATIONS PERSONNELLES
        ================================================= */}

        <View
          style={
            styles.section
          }
        >
          <SectionHeader
            title="Informations personnelles"
            subtitle="Vos coordonnées"
          />

          <View
            style={
              styles.infoCard
            }
          >
            <InfoRow
              icon={
                <User
                  size={20}
                  color={
                    colors.primary[600]
                  }
                />
              }
              label="Nom complet"
              value={fullName}
            />

            <View
              style={
                styles.separator
              }
            />

            <InfoRow
              icon={
                <Mail
                  size={20}
                  color={
                    colors.primary[600]
                  }
                />
              }
              label="Adresse e-mail"
              value={profile.email}
            />

            <View
              style={
                styles.separator
              }
            />

            <InfoRow
              icon={
                <Phone
                  size={20}
                  color={
                    colors.primary[600]
                  }
                />
              }
              label="Téléphone"
              value={
                profile.telephone ||
                'Non renseigné'
              }
            />
          </View>
        </View>


        {/* =================================================
            COMPTE
        ================================================= */}

        <View
          style={
            styles.section
          }
        >
          <SectionHeader
            title="Mon compte"
            subtitle="Gérez votre compte"
          />

          <View
            style={
              styles.infoCard
            }
          >
            <Pressable
              style={({ pressed }) => [
                styles.menuItem,
                pressed &&
                  styles.menuItemPressed,
              ]}
              onPress={() => {
                Alert.alert(
                  'Modification du profil',
                  'La modification du profil sera disponible prochainement.',
                );
              }}
              accessibilityRole="button"
              accessibilityLabel="Modifier mon profil"
            >
              <View
                style={
                  styles.menuLeft
                }
              >
                <View
                  style={
                    styles.menuIcon
                  }
                >
                  <User
                    size={20}
                    color={
                      colors.primary[600]
                    }
                  />
                </View>

                <View
                  style={
                    styles.menuTextBlock
                  }
                >
                  <Text
                    style={
                      styles.menuTitle
                    }
                  >
                    Modifier mon profil
                  </Text>

                  <Text
                    style={
                      styles.menuSubtitle
                    }
                  >
                    Informations personnelles
                  </Text>
                </View>
              </View>

              <View
                style={
                  styles.chevronCircle
                }
              >
                <ChevronRight
                  size={18}
                  color={
                    colors.primary[700]
                  }
                />
              </View>
            </Pressable>
          </View>
        </View>


        {/* =================================================
            DÉCONNEXION
        ================================================= */}

        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed &&
              styles.logoutPressed,
          ]}
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Se déconnecter"
        >
          <View
            style={
              styles.logoutIcon
            }
          >
            <LogOut
              size={19}
              color={
                colors.error[600]
              }
            />
          </View>

          <View
            style={
              styles.logoutContent
            }
          >
            <Text
              style={
                styles.logoutText
              }
            >
              Se déconnecter
            </Text>

            <Text
              style={
                styles.logoutSubtitle
              }
            >
              Quitter votre compte HaiVoly
            </Text>
          </View>

          <ChevronRight
            size={18}
            color={
              colors.error[200]
            }
          />
        </Pressable>


        {/* =================================================
            FOOTER
        ================================================= */}

        <View
          style={
            styles.footer
          }
        >
          <View
            style={
              styles.footerIcon
            }
          >
            <Sprout
              size={15}
              color={
                colors.primary[600]
              }
            />
          </View>

          <Text
            style={
              styles.versionText
            }
          >
            HaiVoly
          </Text>
        </View>
      </ScrollView>

      <AppBottomBar />
    </View>
  );
}


// =====================================================
// HEADER SECTION
// =====================================================

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >
      <View>
        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}


// =====================================================
// INFO ROW
// =====================================================

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View
      style={
        styles.infoRow
      }
    >
      <View
        style={
          styles.infoIcon
        }
      >
        {icon}
      </View>

      <View
        style={
          styles.infoContent
        }
      >
        <Text
          style={
            styles.infoLabel
          }
        >
          {label}
        </Text>

        <Text
          style={
            styles.infoValue
          }
          numberOfLines={2}
        >
          {value}
        </Text>
      </View>
    </View>
  );
}


// =====================================================
// FOND AGRICOLE
// =====================================================

function AgricultureBackground() {
  return (
    <View
      style={
        styles.backgroundLayer
      }
      pointerEvents="none"
    >
      <View
        style={[
          styles.fieldShape,
          styles.fieldShapeOne,
        ]}
      />

      <View
        style={[
          styles.fieldShape,
          styles.fieldShapeTwo,
        ]}
      />

      <View
        style={[
          styles.fieldShape,
          styles.fieldShapeThree,
        ]}
      />

      <View
        style={[
          styles.fieldLine,
          styles.fieldLineOne,
        ]}
      />

      <View
        style={[
          styles.fieldLine,
          styles.fieldLineTwo,
        ]}
      />

      <View
        style={
          styles.fieldLineThree
        }
      />
    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // ROOT
  // ===================================================

  screen: {
    flex: 1,
    backgroundColor:
      '#DCEBD7',
  },

  scroll: {
    flex: 1,
  },

  backgroundLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    backgroundColor:
      '#DCEBD7',
  },


  // ===================================================
  // FOND AGRICOLE
  // ===================================================

  fieldShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },

  fieldShapeOne: {
    width: 330,
    height: 220,
    top: -90,
    right: -130,
    backgroundColor:
      '#C5DEBC',
    transform: [
      {
        rotate: '-18deg',
      },
    ],
  },

  fieldShapeTwo: {
    width: 300,
    height: 200,
    bottom: 60,
    left: -150,
    backgroundColor:
      '#CBE4C3',
    transform: [
      {
        rotate: '18deg',
      },
    ],
  },

  fieldShapeThree: {
    width: 170,
    height: 130,
    top: 260,
    right: -70,
    backgroundColor:
      '#D2E7CB',
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

  fieldLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor:
      '#B8D4AE',
    opacity: 0.65,
  },

  fieldLineOne: {
    width: 360,
    top: 125,
    left: -110,
    transform: [
      {
        rotate: '-16deg',
      },
    ],
  },

  fieldLineTwo: {
    width: 330,
    top: 150,
    left: -80,
    transform: [
      {
        rotate: '-16deg',
      },
    ],
  },

  fieldLineThree: {
    width: 300,
    top: 285,
    right: -100,
    height: 2,
    borderRadius: 2,
    backgroundColor:
      '#B8D4AE',
    opacity: 0.65,
    transform: [
      {
        rotate: '18deg',
      },
    ],
  },


  // ===================================================
  // CONTENU
  // ===================================================

  content: {
    paddingHorizontal: 16,
  },


  // ===================================================
  // HEADER
  // ===================================================

  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.90)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

  headerTexts: {
    flex: 1,
    marginLeft: 11,
  },

  eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color:
      colors.primary[700],
    letterSpacing: 1,
  },

  title: {
    marginTop: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color:
      colors.neutral[900],
  },

  subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color:
      colors.neutral[600],
  },


  // ===================================================
  // CARTE PROFIL
  // ===================================================

  profileCard: {
    position: 'relative',
    overflow: 'hidden',

    padding: 18,

    borderRadius: 22,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.95)',

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.11,
    shadowRadius: 14,
    elevation: 4,
  },

  profileCardGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 100,
    right: -70,
    top: -75,
    backgroundColor:
      'rgba(210,231,203,0.42)',
  },

  profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatarWrapper: {
    position: 'relative',
  },

  avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.primary[600],

    borderWidth: 4,
    borderColor:
      '#F0F7ED',

    shadowColor:
      colors.primary[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

  avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  avatarBadge: {
    position: 'absolute',
    right: -1,
    bottom: 1,

    width: 25,
    height: 25,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      colors.primary[700],

    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

  profileIdentity: {
    flex: 1,
    marginLeft: 15,
    minWidth: 0,
  },

  profileLabel: {
    fontSize: 9,
    fontWeight: '900',
    color:
      colors.neutral[500],
    letterSpacing: 0.7,
  },

  fullName: {
    marginTop: 3,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    color:
      colors.neutral[900],
  },

  roleBadge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    marginTop: 8,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius:
      radius.full,

    backgroundColor:
      '#E8F5E4',

    borderWidth: 1,
    borderColor:
      '#D1E7CA',
  },

  roleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color:
      colors.primary[700],
  },

  profileDivider: {
    height: 1,
    marginTop: 16,
    backgroundColor:
      'rgba(224,232,221,0.95)',
  },

  profileHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },

  profileHintText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    lineHeight: 17,
    color:
      colors.neutral[500],
  },


  // ===================================================
  // SECTIONS
  // ===================================================

  section: {
    marginTop: 22,
  },

  sectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color:
      colors.neutral[900],
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },


  // ===================================================
  // INFO CARD
  // ===================================================

  infoCard: {
    overflow: 'hidden',

    borderRadius: 20,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.95)',

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 76,

    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#E8F5E4',

    borderWidth: 1,
    borderColor:
      '#D5E8D0',
  },

  infoContent: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color:
      colors.neutral[500],
    letterSpacing: 0.3,
    textTransform:
      'uppercase',
  },

  infoValue: {
    marginTop: 3,

    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',

    color:
      colors.neutral[900],
  },

  separator: {
    height: 1,
    marginLeft: 70,

    backgroundColor:
      'rgba(224,232,221,0.95)',
  },


  // ===================================================
  // MENU COMPTE
  // ===================================================

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    minHeight: 78,

    paddingHorizontal: 15,
    paddingVertical: 12,
  },

  menuItemPressed: {
    backgroundColor:
      'rgba(232,245,228,0.60)',
  },

  menuLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    minWidth: 0,
  },

  menuIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#E8F5E4',

    borderWidth: 1,
    borderColor:
      '#D5E8D0',
  },

  menuTextBlock: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

  menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },

  menuSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },

  chevronCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#F1F8EE',
  },


  // ===================================================
  // LOGOUT
  // ===================================================

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 72,

    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 20,

    backgroundColor:
      'rgba(255,250,250,0.94)',

    borderWidth: 1,
    borderColor:
      colors.error[200],
  },

  logoutPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

  logoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#FEF2F2',
  },

  logoutContent: {
    flex: 1,
    marginLeft: 11,
  },

  logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color:
      colors.error[600],
  },

  logoutSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },


  // ===================================================
  // FOOTER
  // ===================================================

  footer: {
    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    gap: 6,

    marginTop: 22,
    marginBottom: 4,
  },

  footerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#E8F5E4',
  },

  versionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color:
      colors.neutral[400],
  },


  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

  loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 16,

    backgroundColor:
      'rgba(255,255,255,0.92)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

  loadingText: {
    marginTop: 10,

    fontSize: 13,
    fontWeight: '600',

    color:
      colors.neutral[600],
  },


  // ===================================================
  // ERROR
  // ===================================================

  errorContainer: {
    flexGrow: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

  errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(255,255,255,0.92)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',

    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',

    color:
      colors.neutral[900],

    textAlign: 'center',
  },

  errorText: {
    marginTop: 8,

    fontSize: 13.5,
    lineHeight: 21,

    color:
      colors.neutral[600],

    textAlign: 'center',
  },

  retryButton: {
    marginTop: 20,

    minHeight: 46,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 22,

    borderRadius: 14,

    backgroundColor:
      colors.primary[600],

    shadowColor:
      colors.primary[900],

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.16,
    shadowRadius: 8,

    elevation: 3,
  },

  retryButtonPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  },
});