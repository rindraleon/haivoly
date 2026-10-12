import { AgricultureBackground } from '@/components/ProfileComponent/AgricultureBackground';
import { i18n } from '@/i18n/instance';
import { useTranslation } from 'react-i18next';
import { InfoRow } from '@/components/ProfileComponent/InfoRow';
import { SectionHeader } from '@/components/ProfileComponent/SectionHeader';
import { styles } from '@/screens/ProfileScreen/ProfilScreen.styles';

import { colors } from '@/theme';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/query-core';
import { ChevronRight, Languages, Moon, LogOut, Mail, Phone, ShieldCheck, Sprout, User } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import type { EdgeInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import type {
  Utilisateur,
} from '@/types';
type Props = {
  fullName: string;
  handleLogout: () => void;
  initials: string;
  insets: EdgeInsets;
  isFetching: boolean;
  profile: NoInfer<Utilisateur> | undefined;
  refetch: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<NoInfer<Utilisateur>, Error>>;
  roleLabel: string;
};

export function VueProfil({
  fullName,
  handleLogout,
  initials,
  insets,
  isFetching,
  profile,
  refetch,
  roleLabel,
}: Props) {
  const { t } = useTranslation();
  if (!profile) return null;
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

          {}

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

          {}

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

          {}

          <View
            style={
              styles.section
            }
          >
            <SectionHeader
              title={i18n.t('libelles.informationsPersonnelles')}
              subtitle={i18n.t('profil.coordonnees')}
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
                label={i18n.t('domaine.telephone')}
                value={
                  profile.telephone ||
                  t('profil.nonRenseigne')
                }
              />
            </View>
          </View>

          {}

          <View
            style={
              styles.section
            }
          >
            <SectionHeader
              title={i18n.t('libelles.monCompte')}
              subtitle={i18n.t('profil.gerezCompte')}
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
                onPress={() => router.push('/(app)/(common)/modifier-profil' as never)}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('libelles.modifierProfil')}
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

              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => router.push('/(app)/(common)/langue' as never)}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('libelles.choisirLangue')}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Languages size={20} color={colors.primary[600]} />
                  </View>

                  <View style={styles.menuTextBlock}>
                    <Text style={styles.menuTitle}>{t('langue.titre')}</Text>
                    <Text style={styles.menuSubtitle}>
                      {t('langue.sousTitreChoix')}
                    </Text>
                  </View>
                </View>

                <View style={styles.chevronCircle}>
                  <ChevronRight size={18} color={colors.primary[700]} />
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.menuItem,
                  pressed && styles.menuItemPressed,
                ]}
                onPress={() => router.push('/(app)/(common)/theme' as never)}
                accessibilityRole="button"
                accessibilityLabel={i18n.t('theme.titre')}
              >
                <View style={styles.menuLeft}>
                  <View style={styles.menuIcon}>
                    <Moon size={20} color={colors.primary[600]} />
                  </View>

                  <View style={styles.menuTextBlock}>
                    <Text style={styles.menuTitle}>{t('theme.titre')}</Text>
                    <Text style={styles.menuSubtitle}>
                      {t('theme.sousTitreChoix')}
                    </Text>
                  </View>
                </View>

                <View style={styles.chevronCircle}>
                  <ChevronRight size={18} color={colors.primary[700]} />
                </View>
              </Pressable>
            </View>
          </View>

          {}

          <Pressable
            style={({ pressed }) => [
              styles.logoutButton,
              pressed &&
                styles.logoutPressed,
            ]}
            onPress={handleLogout}
            accessibilityRole="button"
            accessibilityLabel={i18n.t('profil.deconnexion.confirmer')}
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

          {}

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
      </View>
  );
}
