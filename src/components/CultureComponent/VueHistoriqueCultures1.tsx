/**
 * Section `VueHistoriqueCultures1` extraite de `VueHistoriqueCultures`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import type { CultureAvecPoints } from '@/screens/CultureScreen/CultureHistoryScreen';
import { styles } from '@/screens/CultureScreen/CultureHistoryScreen.styles';


import { router } from 'expo-router';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

import { VueHistoriqueCultures11 } from '@/components/CultureComponent/VueHistoriqueCultures11';
import { formatDate } from '@/utils/date';
import type {
  Culture,
  Parcelle,
} from '@/types';
type Props = {
  culturesAvecPoints: CultureAvecPoints[];
  culturesFiltreesEtTriees: Culture[];
  culturesHistorique: Culture[];
  delimitationFiltre: string;
  filtreOuvert: boolean;
  loadingPoints: boolean;
  mapHtml: string;
  nombreCulturesDelimitees: number;
  parcelle: NoInfer<Parcelle> | undefined;
  parcelleId: string | undefined;
  parcelleNom: string | undefined;
  recherche: string;
  setDelimitationFiltre: Dispatch<SetStateAction<string>>;
  setFiltreOuvert: Dispatch<SetStateAction<boolean>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setStatutFiltre: Dispatch<SetStateAction<string>>;
  setTri: Dispatch<SetStateAction<string>>;
  setTriOuvert: Dispatch<SetStateAction<boolean>>;
  setTypeFiltre: Dispatch<SetStateAction<string>>;
  statutFiltre: string;
  tri: string;
  triOuvert: boolean;
  typeFiltre: string;
  typesDisponibles: string[];
};

export function VueHistoriqueCultures1({
  culturesAvecPoints,
  culturesFiltreesEtTriees,
  culturesHistorique,
  delimitationFiltre,
  filtreOuvert,
  loadingPoints,
  mapHtml,
  nombreCulturesDelimitees,
  parcelle,
  parcelleId,
  parcelleNom,
  recherche,
  setDelimitationFiltre,
  setFiltreOuvert,
  setRecherche,
  setStatutFiltre,
  setTri,
  setTriOuvert,
  setTypeFiltre,
  statutFiltre,
  tri,
  triOuvert,
  typeFiltre,
  typesDisponibles,
}: Props) {
  return (
<ScrollView
            contentContainerStyle={
              styles.content
            }
          >

            {/* ========================================= */}
            {/* TITRE */}
            {/* ========================================= */}

            <Text
              style={
                styles.title
              }
            >
              Historique des cultures
            </Text>

            <Text
              style={
                styles.parcelleName
              }
            >
              Parcelle :{' '}
              {parcelle?.nom ||
                parcelleNom ||
                parcelleId}
            </Text>

            {/* ========================================= */}
            {/* BOUTON RETOUR */}
            {/* ========================================= */}

            <TouchableOpacity
              style={
                styles.backTopButton
              }

              onPress={() =>
                router.back()
              }
            >

              <Text
                style={
                  styles.backTopButtonText
                }
              >
                ← Retour aux cultures
              </Text>

            </TouchableOpacity>

            {/* ========================================= */}
            {/* RÉSUMÉ */}
            {/* ========================================= */}

            <View
              style={
                styles.summaryCard
              }
            >

              <View>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Historique
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {culturesHistorique.length}
                </Text>

              </View>

              <View>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Délimitées
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {nombreCulturesDelimitees}
                </Text>

              </View>

              <View>

                <Text
                  style={
                    styles.summaryLabel
                  }
                >
                  Parcelle
                </Text>

                <Text
                  style={
                    styles.summaryValue
                  }
                >
                  {parcelle?.superficie != null
                    ? `${Number(
                        parcelle.superficie,
                      ).toFixed(0)} m²`
                    : '-'}
                </Text>

              </View>

            </View>

            {/* ========================================= */}
            {/* CARTE */}
            {/* ========================================= */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Historique des zones cultivées
            </Text>

            <Text
              style={
                styles.sectionDescription
              }
            >
              La carte affiche la parcelle et les
              anciennes zones des cultures récoltées,
              abandonnées ou supprimées.
            </Text>

            <View
              style={
                styles.mapContainer
              }
            >

              {loadingPoints ? (

                <View
                  style={
                    styles.mapLoading
                  }
                >

                  <ActivityIndicator
                    size="large"
                  />

                  <Text>
                    Chargement des anciennes délimitations...
                  </Text>

                </View>

              ) : (

                <WebView
                  key={
                    `${parcelleId}-${culturesAvecPoints
                      .map(
                        (c) =>
                          `${c.id}-${c.pointsGPS.length}-${c.statut}`,
                      )
                      .join('-')}`
                  }

                  originWhitelist={[
                    '*',
                  ]}

                  javaScriptEnabled={
                    true
                  }

                  source={{
                    html: mapHtml,
                  }}

                />

              )}

            </View>

            {/* ========================================= */}
            {/* RECHERCHE */}
            {/* ========================================= */}

            <Text
              style={
                styles.sectionTitle
              }
            >
              Liste historique
            </Text>

            <TextInput
              style={
                styles.searchInput
              }

              placeholder="Rechercher une culture..."

              value={
                recherche
              }

              onChangeText={
                setRecherche
              }

              clearButtonMode="while-editing"
            />

            {/* ========================================= */}
            {/* BOUTONS */}
            {/* ========================================= */}

            <View
              style={
                styles.searchActions
              }
            >

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filtreOuvert &&
                    styles.activeActionButton,
                ]}

                onPress={() => {

                  setFiltreOuvert(
                    previous =>
                      !previous,
                  );

                  setTriOuvert(
                    false,
                  );

                }}
              >

                <Text
                  style={
                    styles.filterButtonText
                  }
                >
                  Filtrer
                </Text>

              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.sortButton,
                  triOuvert &&
                    styles.activeActionButton,
                ]}

                onPress={() => {

                  setTriOuvert(
                    previous =>
                      !previous,
                  );

                  setFiltreOuvert(
                    false,
                  );

                }}
              >

                <Text
                  style={
                    styles.sortButtonText
                  }
                >
                  Trier
                </Text>

              </TouchableOpacity>

            </View>

            {/* ========================================= */}
            {/* FILTRE */}
            {/* ========================================= */}

            {filtreOuvert && (

              <VueHistoriqueCultures11
                delimitationFiltre={delimitationFiltre}
                setDelimitationFiltre={setDelimitationFiltre}
                setFiltreOuvert={setFiltreOuvert}
                setRecherche={setRecherche}
                setStatutFiltre={setStatutFiltre}
                setTypeFiltre={setTypeFiltre}
                statutFiltre={statutFiltre}
                typeFiltre={typeFiltre}
                typesDisponibles={typesDisponibles}
              />

            )}

            {/* ========================================= */}
            {/* TRI */}
            {/* ========================================= */}

            {triOuvert && (

              <View
                style={
                  styles.panel
                }
              >

                <Text
                  style={
                    styles.panelTitle
                  }
                >
                  Trier l&apos;historique
                </Text>

                {[
                  {
                    value:
                      'NOM_ASC',

                    label:
                      'Nom : A → Z',
                  },

                  {
                    value:
                      'NOM_DESC',

                    label:
                      'Nom : Z → A',
                  },

                  {
                    value:
                      'PLANTATION_RECENTE',

                    label:
                      'Date de plantation : récente → ancienne',
                  },

                  {
                    value:
                      'PLANTATION_ANCIENNE',

                    label:
                      'Date de plantation : ancienne → récente',
                  },

                  {
                    value:
                      'MODIFICATION_RECENTE',

                    label:
                      'Modification : récente → ancienne',
                  },

                  {
                    value:
                      'MODIFICATION_ANCIENNE',

                    label:
                      'Modification : ancienne → récente',
                  },

                ].map(
                  (option) => (

                    <TouchableOpacity
                      key={
                        option.value
                      }

                      style={[
                        styles.sortOption,

                        tri ===
                          option.value &&
                          styles.sortOptionActive,
                      ]}

                      onPress={() => {

                        setTri(
                          option.value,
                        );

                        setTriOuvert(
                          false,
                        );

                      }}
                    >

                      <Text
                        style={[
                          styles.sortOptionText,

                          tri ===
                            option.value &&
                            styles.sortOptionTextActive,
                        ]}
                      >

                        {tri ===
                        option.value
                          ? '✓ '
                          : ''}

                        {option.label}

                      </Text>

                    </TouchableOpacity>

                  ),
                )}

              </View>

            )}

            {/* ========================================= */}
            {/* NOMBRE DE RÉSULTATS */}
            {/* ========================================= */}

            <Text
              style={
                styles.resultCount
              }
            >

              {culturesFiltreesEtTriees.length}{' '}

              {culturesFiltreesEtTriees.length >
              1
                ? 'cultures historiques'
                : 'culture historique'}

            </Text>

            {/* ========================================= */}
            {/* AUCUNE CULTURE */}
            {/* ========================================= */}

            {culturesFiltreesEtTriees.length ===
            0 ? (

              <View
                style={
                  styles.emptyCard
                }
              >

                <Text
                  style={
                    styles.emptyTitle
                  }
                >
                  {culturesHistorique.length >
                  0
                    ? 'Aucun résultat'
                    : 'Aucun historique'}
                </Text>

                <Text
                  style={
                    styles.emptyText
                  }
                >
                  {culturesHistorique.length >
                  0
                    ? 'Aucune culture ne correspond à votre recherche ou à vos filtres.'
                    : 'Cette parcelle ne contient encore aucune culture récoltée, abandonnée ou supprimée.'}
                </Text>

              </View>

            ) : (

              /* ========================================= */
              /* LISTE */
              /* ========================================= */

              culturesFiltreesEtTriees.map(
                (culture) => {

                  const culturePoints =
                    culturesAvecPoints.find(
                      (item) =>
                        item.id ===
                        culture.id,
                    )?.pointsGPS ?? [];

                  const estDelimitee =
                    culturePoints.length >= 3;

                  return (

                    <TouchableOpacity
                      key={
                        culture.id
                      }

                      style={
                        styles.cultureCard
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
                    >

                      {/* HEADER */}

                      <View
                        style={
                          styles.cultureHeader
                        }
                      >

                        <View
                          style={
                            styles.cultureTitleContainer
                          }
                        >

                          <Text
                            style={
                              styles.cultureName
                            }
                          >
                            {culture.nom}
                          </Text>

                          {culture.type && (

                            <Text
                              style={
                                styles.cultureType
                              }
                            >
                              {culture.type}
                            </Text>

                          )}

                        </View>

                        <View
                          style={[
                            styles.statusBadge,

                            culture.statut ===
                              'RECOLTEE' &&
                              styles.statusRecoltee,

                            culture.statut ===
                              'ABANDONNEE' &&
                              styles.statusAbandonnee,

                            culture.statut ===
                              'SUPPRIMEE' &&
                              styles.statusSupprimee,

                          ]}
                        >

                          <Text
                            style={
                              styles.statusText
                            }
                          >
                            {culture.statut}
                          </Text>

                        </View>

                      </View>

                      {/* VARIÉTÉ */}

                      {culture.variete && (

                        <View
                          style={
                            styles.infoRow
                          }
                        >

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Variété :
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {culture.variete}
                          </Text>

                        </View>

                      )}

                      {/* STADE */}

                      {culture.stade && (

                        <View
                          style={
                            styles.infoRow
                          }
                        >

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Stade :
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {culture.stade}
                          </Text>

                        </View>

                      )}

                      {/* DATE PLANTATION */}

                      {culture.datePlantation && (

                        <View
                          style={
                            styles.infoRow
                          }
                        >

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Plantation :
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {formatDate(culture.datePlantation)}
                          </Text>

                        </View>

                      )}

                      {/* DATE RÉCOLTE PRÉVUE */}

                      {culture.datePrevueRecolte && (

                        <View
                          style={
                            styles.infoRow
                          }
                        >

                          <Text
                            style={
                              styles.infoLabel
                            }
                          >
                            Récolte prévue :
                          </Text>

                          <Text
                            style={
                              styles.infoValue
                            }
                          >
                            {formatDate(culture.datePrevueRecolte)}
                          </Text>

                        </View>

                      )}

                      {/* DÉLIMITATION */}

                      <View
                        style={
                          styles.delimitationRow
                        }
                      >

                        <Text
                          style={
                            styles.delimitationIcon
                          }
                        >
                          {estDelimitee
                            ? '🟢'
                            : '⚪'}
                        </Text>

                        <Text
                          style={
                            estDelimitee
                              ? styles.delimitationOk
                              : styles.delimitationNone
                          }
                        >

                          {estDelimitee

                            ? `${culturePoints.length} points GPS — ancienne zone délimitée`

                            : 'Culture non délimitée'}

                        </Text>

                      </View>

                      {/* DÉTAIL */}

                      <Text
                        style={
                          styles.detailLink
                        }
                      >
                        Voir le détail →
                      </Text>

                    </TouchableOpacity>

                  );

                },
              )

            )}

          </ScrollView>
  );
}
