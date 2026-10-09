import { Chip } from '@/components/CommonComponent/Chip';
import { EmptyState } from '@/components/CommonComponent/EmptyState';
import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { SearchBar } from '@/components/CommonComponent/SearchBar';
import { CultureCard } from '@/components/CultureComponent/CultureCard';
import { CultureToutesParcelles, FiltreCulture, getFiltreLabel, nomStatut } from '@/screens/CultureScreen/CultureListScreen.helpers';
import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';


import { colors } from '@/theme';
import { router } from 'expo-router';
import { ChevronRight, SearchX, SlidersHorizontal, Sprout, X } from 'lucide-react-native';
import type { Dispatch, RefObject, SetStateAction } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import type {
  Culture,
  Parcelle,
} from '@/types';
type Props = {
  FILTRES: FiltreCulture[];
  cultures: NoInfer<Culture[]> | undefined;
  culturesFiltrees: CultureToutesParcelles[];
  filtreOuvert: boolean;
  loadingPoints: boolean;
  mapHtml: string;
  nombreCulturesDelimitees: number;
  onRefresh: () => Promise<void>;
  ouvrirModalAjoutCulture: () => void;
  parcelle: NoInfer<Parcelle> | undefined;
  parcelleId: string | undefined;
  parcelleNom: string | undefined;
  recherche: string;
  refreshing: boolean;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setMapReady: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<FiltreCulture>>;
  statutFiltre: FiltreCulture;
  // `{}` est le type générique par défaut de `WebView` dans react-native-webview.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  webViewRef: RefObject<WebView<{}> | null>;
};

export function ModalChoixParcelle1({
  FILTRES,
  cultures,
  culturesFiltrees,
  filtreOuvert,
  loadingPoints,
  mapHtml,
  nombreCulturesDelimitees,
  onRefresh,
  ouvrirModalAjoutCulture,
  parcelle,
  parcelleId,
  parcelleNom,
  recherche,
  refreshing,
  setFiltreOuvert,
  setMapReady,
  setRecherche,
  setStatutFiltre,
  statutFiltre,
  webViewRef,
}: Props) {
  return (
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
              styles.detailContent
            }
          >

            {/* ===========================================
                HEADER
            ============================================ */}

            <ScreenHeader
              title="Cultures"
              subtitle={`Parcelle : ${
                parcelle?.nom ||
                parcelleNom ||
                parcelleId
              }`}
              showBack
            />

            {/* ===========================================
                SUMMARY
            ============================================ */}

            <View
              style={
                styles.summaryCard
              }
            >

              <View
                style={
                  styles.summaryItem
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {cultures?.length ??
                    0}
                </Text>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Cultures
                </Text>

              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View
                style={
                  styles.summaryItem
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {
                    nombreCulturesDelimitees
                  }
                </Text>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Délimitées
                </Text>

              </View>

              <View
                style={
                  styles.summaryDivider
                }
              />

              <View
                style={
                  styles.summaryItem
                }
              >

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {parcelle?.superficie !=
                  null
                    ? `${Number(
                        parcelle.superficie,
                      ).toFixed(0)} m²`
                    : '-'}
                </Text>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Parcelle
                </Text>

              </View>

            </View>

            {/* ===========================================
                MAP
            ============================================ */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Parcelle et cultures
              </Text>

              <Text
                style={
                  styles.sectionDescription
                }
              >
                Parcelle en vert et cultures délimitées
                affichées à l&apos;intérieur.
              </Text>

            </View>

            <View
              style={
                styles.mapCard
              }
            >

              <WebView
                ref={
                  webViewRef
                }
                originWhitelist={[
                  '*',
                ]}
                javaScriptEnabled
                domStorageEnabled
                startInLoadingState={false}
                source={{
                  html: mapHtml,
                }}
                onLoad={() => {

                  setMapReady(
                    true,
                  );

                }}
                onLoadEnd={() => {

                  setMapReady(
                    true,
                  );

                }}
              />

              {loadingPoints && (
                <View
                  pointerEvents="none"
                  style={
                    styles.mapUpdatingBadge
                  }
                >

                  <ActivityIndicator
                    size="small"
                    color={
                      colors.primary[600]
                    }
                  />

                  <Text
                    style={
                      styles.mapUpdatingText
                    }
                  >
                    Mise à jour des délimitations...
                  </Text>

                </View>
              )}

            </View>

            {/* ===========================================
                HISTORIQUE
            ============================================ */}

            <Pressable
              style={({ pressed }) => [
                styles.historyButton,

                pressed && {
                  opacity: 0.85,
                },
              ]}
              onPress={() => {

                if (!parcelleId) {
                  return;
                }

                router.push({
                  pathname:
                    '/historique-cultures',

                  params: {
                    parcelleId,

                    parcelleNom:
                      parcelle?.nom ||
                      parcelleNom ||
                      '',
                  },
                });

              }}
            >

              <Text
                style={
                  styles.historyButtonText
                }
              >
                Historique des cultures
              </Text>

              <ChevronRight
                size={17}
                color={
                  colors.primary[600]
                }
              />

            </Pressable>

            {/* ===========================================
                SECTION CULTURES
            ============================================ */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Cultures de la parcelle
              </Text>

              <Text
                style={
                  styles.sectionDescription
                }
              >
                {culturesFiltrees.length}{' '}
                {culturesFiltrees.length >
                1
                  ? 'cultures'
                  : 'culture'}{' '}
                affichée
                {culturesFiltrees.length >
                1
                  ? 's'
                  : ''}{' '}
                • modification récente en premier
              </Text>

            </View>

            {/* ===========================================
                ZONE AGRICOLE
            ============================================ */}

            <View
              style={
                styles.detailListArea
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
                  styles.fieldLine,
                  styles.fieldLineOne,
                ]}
              />

              {/* RECHERCHE + FILTRE */}

              <View
                style={
                  styles.localTopBar
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
                      placeholder="Rechercher une culture..."
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

              </View>

              {/* LISTE */}

              <View
                style={
                  styles.detailListContent
                }
              >

                {culturesFiltrees.length ===
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
                        ? 'Aucun résultat'
                        : 'Aucune culture'
                    }
                    description={
                      recherche
                        ? `Aucune culture ne correspond à "${recherche}".`
                        : statutFiltre !==
                            'TOUTES'
                          ? `Aucune culture ${nomStatut(
                              statutFiltre,
                            ).toLowerCase()}.`
                          : 'Cette parcelle ne contient encore aucune culture.'
                    }
                    actionLabel={
                      recherche ||
                      statutFiltre !==
                        'TOUTES'
                        ? 'Réinitialiser'
                        : 'Ajouter une culture'
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
                        key={
                          culture.id
                        }
                        culture={
                          culture
                        }
                        onPress={() => {

                          router.push({
                            pathname:
                              '/detail-culture',

                            params: {
                              parcelleId,

                              cultureId:
                                culture.id,

                              parcelleNom:
                                parcelle?.nom ||
                                parcelleNom ||
                                '',

                              cultureNom:
                                culture.nom,
                            },
                          });

                        }}
                      />

                    )

                  )

                )}

              </View>

            </View>

            <View
              style={
                styles.bottomSpace
              }
            />

          </ScrollView>
  );
}
