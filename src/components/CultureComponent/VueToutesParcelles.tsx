import { Chip } from '@/components/CommonComponent/Chip';
import { i18n } from '@/i18n/instance';
import { EmptyState } from '@/components/CommonComponent/EmptyState';
import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { SearchBar } from '@/components/CommonComponent/SearchBar';
import { CultureCard } from '@/components/CultureComponent/CultureCard';
import { CultureToutesParcelles, FiltreCulture, getFiltreLabel, nomStatut } from '@/screens/CultureScreen/CultureListScreen.helpers';
import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';

import { colors } from '@/theme';
import type { QueryObserverResult, RefetchOptions } from '@tanstack/query-core';
import { router } from 'expo-router';
import { Plus, SearchX, SlidersHorizontal, Sprout, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type { Paginated, Parcelle } from '@/types';
type Props = {
  FILTRES: FiltreCulture[];
  culturesFiltrees: CultureToutesParcelles[];
  filtreOuvert: boolean;
  isErrorToutesLesCultures: boolean;
  isLoadingToutesLesCultures: boolean;
  modalChoixParcelle: React.JSX.Element;
  onRefresh: () => Promise<void>;
  ouvrirModalAjoutCulture: () => void;
  recherche: string;
  refetchParcelles: (options?: RefetchOptions | undefined) => Promise<QueryObserverResult<NoInfer<Paginated<Parcelle>>, Error>>;
  refreshing: boolean;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<FiltreCulture>>;
  statistiques: { total: number; enCours: number; planifiees: number; };
  statutFiltre: FiltreCulture;
};

export function VueToutesParcelles({
  FILTRES,
  culturesFiltrees,
  filtreOuvert,
  isErrorToutesLesCultures,
  isLoadingToutesLesCultures,
  modalChoixParcelle,
  onRefresh,
  ouvrirModalAjoutCulture,
  recherche,
  refetchParcelles,
  refreshing,
  setFiltreOuvert,
  setRecherche,
  setStatutFiltre,
  statistiques,
  statutFiltre,
}: Props) {
  return (
<View
          style={
            styles.root
          }
        >

          <ScreenHeader
            title="Cultures"
            subtitle={`${statistiques.total} cultures • ${statistiques.enCours} en cours`}
          />

          <View
            style={
              styles.topBar
            }
          >

            <View
              style={
                styles.searchRow
              }
            >

              <View
                style={{
                  flex: 1,
                }}
              >

                <SearchBar
                  value={
                    recherche
                  }
                  onChangeText={
                    setRecherche
                  }
                  placeholder={i18n.t('cultures.recherchePlaceholder')}
                />

              </View>

              <Pressable
                onPress={() =>
                  setFiltreOuvert(
                    (value) =>
                      !value,
                  )
                }
                style={({ pressed }) => [
                  styles.filterBtn,

                  filtreOuvert &&
                    styles.filterBtnActive,

                  pressed && {
                    opacity: 0.8,
                  },
                ]}
              >

                <SlidersHorizontal
                  size={18}
                  color={
                    filtreOuvert
                      ? '#FFFFFF'
                      : colors.neutral[700]
                  }
                  strokeWidth={2}
                />

              </Pressable>

            </View>

            {filtreOuvert && (
              <View
                style={
                  styles.filterPanel
                }
              >

                <View
                  style={
                    styles.filterHeader
                  }
                >

                  <Text
                    style={
                      styles.filterLabel
                    }
                  >
                    Filtrer par statut
                  </Text>

                  <Pressable
                    onPress={() =>
                      setFiltreOuvert(
                        false,
                      )
                    }
                  >

                    <X
                      size={17}
                      color={
                        colors.neutral[500]
                      }
                    />

                  </Pressable>

                </View>

                <View
                  style={
                    styles.chips
                  }
                >

                  {FILTRES.map(
                    (filtre) => (
                      <Chip
                        key={
                          filtre
                        }
                        label={
                          getFiltreLabel(
                            filtre,
                          )
                        }
                        selected={
                          statutFiltre ===
                          filtre
                        }
                        onPress={() =>
                          setStatutFiltre(
                            filtre,
                          )
                        }
                      />
                    ),
                  )}

                </View>

              </View>
            )}

            <View
              style={
                styles.statsBar
              }
            >

              <View
                style={
                  styles.statPill
                }
              >

                <Text
                  style={
                    styles.statPillValue
                  }
                >
                  {
                    culturesFiltrees.length
                  }
                </Text>

                <Text
                  style={
                    styles.statPillLabel
                  }
                >
                  résultat(s)
                </Text>

              </View>

              <Text
                style={
                  styles.statHint
                }
                numberOfLines={1}
              >
                {recherche
                  ? `pour "${recherche}"`
                  : i18n.t('cultures.trieesModification')}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.listArea
            }
          >

            <View
              pointerEvents="none"
              style={[
                styles.fieldShape,
                styles.fieldShapeOne,
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.fieldShape,
                styles.fieldShapeTwo,
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.fieldShape,
                styles.fieldShapeThree,
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.fieldLine,
                styles.fieldLineOne,
              ]}
            />

            <View
              pointerEvents="none"
              style={[
                styles.fieldLine,
                styles.fieldLineTwo,
              ]}
            />

            <ScrollView
              showsVerticalScrollIndicator={
                false
              }
              refreshControl={
                <RefreshControl
                  refreshing={
                    refreshing
                  }
                  onRefresh={
                    onRefresh
                  }
                  tintColor={
                    colors.primary[500]
                  }
                />
              }
              contentContainerStyle={
                styles.listContent
              }
            >

              {isLoadingToutesLesCultures ? (

                <View
                  style={
                    styles.loadingInline
                  }
                >

                  <ActivityIndicator
                    size="large"
                    color={
                      colors.primary[500]
                    }
                  />

                  <Text
                    style={
                      styles.loadingInlineText
                    }
                  >
                    Chargement des cultures...
                  </Text>

                </View>

              ) : isErrorToutesLesCultures ? (

                <View
                  style={
                    styles.errorInline
                  }
                >

                  <Text
                    style={
                      styles.errorTitle
                    }
                  >
                    Impossible de charger les cultures
                  </Text>

                  <Text
                    style={
                      styles.errorMessage
                    }
                  >
                    Vérifiez votre connexion.
                  </Text>

                  <Pressable
                    style={
                      styles.retryButton
                    }
                    onPress={() =>
                      refetchParcelles()
                    }
                  >

                    <Text
                      style={
                        styles.retryButtonText
                      }
                    >
                      Réessayer
                    </Text>

                  </Pressable>

                </View>

              ) : culturesFiltrees.length ===
                0 ? (

                <EmptyState
                  icon={
                    recherche ||
                    statutFiltre !==
                      'TOUTES'
                      ? SearchX
                      : Sprout
                  }
                  title={
                    recherche ||
                    statutFiltre !==
                      'TOUTES'
                      ? i18n.t('domaine.aucunResultat')
                      : i18n.t('libelles.aucuneCulture')
                  }
                  description={
                    recherche
                      ? `Aucune culture ne correspond à "${recherche}".`
                      : statutFiltre !==
                          'TOUTES'
                        ? `Aucune culture ${nomStatut(
                            statutFiltre,
                          ).toLowerCase()}.`
                        : i18n.t('cultures.premiereCulture')
                  }
                  actionLabel={
                    recherche ||
                    statutFiltre !==
                      'TOUTES'
                      ? i18n.t('domaine.reinitialiser')
                      : i18n.t('cultures.ajouterCulture')
                  }
                  onAction={() => {

                    if (
                      recherche ||
                      statutFiltre !==
                        'TOUTES'
                    ) {

                      setRecherche(
                        '',
                      );

                      setStatutFiltre(
                        'TOUTES',
                      );

                    } else {

                      ouvrirModalAjoutCulture();

                    }

                  }}
                />

              ) : (

                culturesFiltrees.map(
                  (culture) => (

                    <CultureCard
                      key={`${culture.parcelleId}-${culture.id}`}
                      culture={
                        culture
                      }
                      onPress={() => {

                        if (
                          !culture.parcelleId
                        ) {
                          return;
                        }

                        router.push({
                          pathname:
                            '/detail-culture',

                          params: {
                            parcelleId:
                              culture.parcelleId,

                            cultureId:
                              culture.id,

                            parcelleNom:
                              culture.parcelleNom,

                            cultureNom:
                              culture.nom,
                          },
                        });

                      }}
                    />

                  ),
                )

              )}

            </ScrollView>

          </View>

          <Pressable
            onPress={
              ouvrirModalAjoutCulture
            }
            style={({ pressed }) => [
              styles.fab,

              pressed && {
                opacity: 0.9,
                transform: [
                  {
                    scale: 0.94,
                  },
                ],
              },
            ]}
          >

            <Plus
              size={27}
              color="#FFFFFF"
              strokeWidth={2.7}
            />

          </Pressable>

          {modalChoixParcelle}

        </View>
  );
}
