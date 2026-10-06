/**
 * Section `Fermerajoutglobal21` extraite de `Fermerajoutglobal2`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';


import type { UseQueryResult } from '@tanstack/react-query';
import { Check, ChevronDown, MapPin, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  cultureAjout: string;
  culturesAjout: NoInfer<Culture[]>;
  culturesAjoutQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  parcelleAjout: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  selectionCultureAjoutOuverte: boolean;
  selectionParcelleAjoutOuverte: boolean;
  setCultureAjout: Dispatch<SetStateAction<string>>;
  setParcelleAjout: Dispatch<SetStateAction<string>>;
  setSelectionCultureAjoutOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleAjoutOuverte: Dispatch<SetStateAction<boolean>>;
};

export function Fermerajoutglobal21({
  cultureAjout,
  culturesAjout,
  culturesAjoutQuery,
  parcelleAjout,
  parcelles,
  parcellesQuery,
  selectionCultureAjoutOuverte,
  selectionParcelleAjoutOuverte,
  setCultureAjout,
  setParcelleAjout,
  setSelectionCultureAjoutOuverte,
  setSelectionParcelleAjoutOuverte,
}: Props) {
  return (
<ScrollView
                          showsVerticalScrollIndicator={
                            false
                          }
                          contentContainerStyle={
                            styles.sheetContent
                          }
                        >
                          <View
                            style={
                              styles.stepHeader
                            }
                          >
                            <View
                              style={
                                styles.stepNumber
                              }
                            >
                              <Text
                                style={
                                  styles.stepNumberText
                                }
                              >
                                1
                              </Text>
                            </View>

                            <View>
                              <Text
                                style={
                                  styles.stepTitle
                                }
                              >
                                Parcelle
                              </Text>

                              <Text
                                style={
                                  styles.stepSubtitle
                                }
                              >
                                Où se trouve l&apos;observation ?
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            activeOpacity={0.8}
                            style={[
                              styles.filterSelectModal,
                              selectionParcelleAjoutOuverte &&
                                styles.filterSelectOpen,
                            ]}
                            onPress={() => {
                              setSelectionParcelleAjoutOuverte(
                                previous =>
                                  !previous,
                              );

                              setSelectionCultureAjoutOuverte(
                                false,
                              );
                            }}
                          >
                            <View
                              style={
                                styles.filterSelectLeft
                              }
                            >
                              <View
                                style={
                                  styles.filterSelectIcon
                                }
                              >
                                <MapPin
                                  size={18}
                                  color="#166534"
                                />
                              </View>

                              <Text
                                style={[
                                  styles.filterSelectText,
                                  !parcelleAjout &&
                                    styles.filterSelectPlaceholder,
                                ]}
                                numberOfLines={1}
                              >
                                {parcelles.find(
                                  item =>
                                    item.id ===
                                    parcelleAjout,
                                )?.nom ??
                                  'Sélectionner une parcelle'}
                              </Text>
                            </View>

                            <ChevronDown
                              size={19}
                              color="#6B7280"
                              style={
                                selectionParcelleAjoutOuverte
                                  ? styles.chevronRotated
                                  : undefined
                              }
                            />
                          </TouchableOpacity>

                          {selectionParcelleAjoutOuverte ? (
                            <View
                              style={
                                styles.filterDropdown
                              }
                            >
                              {parcellesQuery.isLoading ? (
                                <View
                                  style={
                                    styles.dropdownLoading
                                  }
                                >
                                  <ActivityIndicator
                                    color="#166534"
                                  />
                                </View>
                              ) : (
                                <ScrollView
                                  nestedScrollEnabled
                                  style={
                                    styles.filterDropdownScroll
                                  }
                                >
                                  {parcelles.map(
                                    item => (
                                      <TouchableOpacity
                                        key={
                                          item.id
                                        }
                                        activeOpacity={
                                          0.7
                                        }
                                        style={[
                                          styles.filterDropdownItem,
                                          parcelleAjout ===
                                            item.id &&
                                            styles.filterDropdownItemSelected,
                                        ]}
                                        onPress={() => {
                                          setParcelleAjout(
                                            item.id,
                                          );

                                          setCultureAjout(
                                            '',
                                          );

                                          setSelectionParcelleAjoutOuverte(
                                            false,
                                          );
                                        }}
                                      >
                                        <View
                                          style={
                                            styles.dropdownItemLeft
                                          }
                                        >
                                          <MapPin
                                            size={16}
                                            color={
                                              parcelleAjout ===
                                              item.id
                                                ? '#166534'
                                                : '#9CA3AF'
                                            }
                                          />

                                          <Text
                                            style={[
                                              styles.filterDropdownItemText,
                                              parcelleAjout ===
                                                item.id &&
                                                styles.filterDropdownItemTextSelected,
                                            ]}
                                          >
                                            {
                                              item.nom
                                            }
                                          </Text>
                                        </View>

                                        {parcelleAjout ===
                                        item.id ? (
                                          <Check
                                            size={18}
                                            color="#166534"
                                            strokeWidth={
                                              2.5
                                            }
                                          />
                                        ) : null}
                                      </TouchableOpacity>
                                    ),
                                  )}
                                </ScrollView>
                              )}
                            </View>
                          ) : null}

                          <View
                            style={[
                              styles.stepHeader,
                              styles.stepHeaderSecond,
                            ]}
                          >
                            <View
                              style={
                                styles.stepNumber
                              }
                            >
                              <Text
                                style={
                                  styles.stepNumberText
                                }
                              >
                                2
                              </Text>
                            </View>

                            <View>
                              <Text
                                style={
                                  styles.stepTitle
                                }
                              >
                                Culture
                              </Text>

                              <Text
                                style={
                                  styles.stepSubtitle
                                }
                              >
                                Choisissez la culture concernée
                              </Text>
                            </View>
                          </View>

                          <TouchableOpacity
                            activeOpacity={
                              parcelleAjout
                                ? 0.8
                                : 1
                            }
                            disabled={
                              !parcelleAjout
                            }
                            style={[
                              styles.filterSelectModal,
                              !parcelleAjout &&
                                styles.filterSelectDisabled,
                              selectionCultureAjoutOuverte &&
                                styles.filterSelectOpen,
                            ]}
                            onPress={() => {
                              setSelectionCultureAjoutOuverte(
                                previous =>
                                  !previous,
                              );

                              setSelectionParcelleAjoutOuverte(
                                false,
                              );
                            }}
                          >
                            <View
                              style={
                                styles.filterSelectLeft
                              }
                            >
                              <View
                                style={[
                                  styles.filterSelectIcon,
                                  !parcelleAjout &&
                                    styles.filterSelectIconDisabled,
                                ]}
                              >
                                <Sprout
                                  size={18}
                                  color={
                                    parcelleAjout
                                      ? '#166534'
                                      : '#9CA3AF'
                                  }
                                />
                              </View>

                              <Text
                                style={[
                                  styles.filterSelectText,
                                  !cultureAjout &&
                                    styles.filterSelectPlaceholder,
                                ]}
                                numberOfLines={1}
                              >
                                {parcelleAjout
                                  ? culturesAjout.find(
                                      item =>
                                        item.id ===
                                        cultureAjout,
                                    )?.nom ??
                                    'Sélectionner une culture'
                                  : 'Choisissez d’abord une parcelle'}
                              </Text>
                            </View>

                            <ChevronDown
                              size={19}
                              color={
                                parcelleAjout
                                  ? '#6B7280'
                                  : '#D1D5DB'
                              }
                            />
                          </TouchableOpacity>

                          {selectionCultureAjoutOuverte &&
                          parcelleAjout ? (
                            <View
                              style={
                                styles.filterDropdown
                              }
                            >
                              {culturesAjoutQuery.isLoading ? (
                                <View
                                  style={
                                    styles.dropdownLoading
                                  }
                                >
                                  <ActivityIndicator
                                    color="#166534"
                                  />

                                  <Text
                                    style={
                                      styles.dropdownLoadingText
                                    }
                                  >
                                    Chargement des cultures...
                                  </Text>
                                </View>
                              ) : culturesAjoutQuery.isError ? (
                                <View
                                  style={
                                    styles.dropdownLoading
                                  }
                                >
                                  <Text
                                    style={
                                      styles.dropdownError
                                    }
                                  >
                                    Impossible de charger les
                                    cultures.
                                  </Text>
                                </View>
                              ) : (
                                <ScrollView
                                  nestedScrollEnabled
                                  style={
                                    styles.filterDropdownScroll
                                  }
                                >
                                  {culturesAjout
                                    .filter(
                                      culture =>
                                        culture.statut !==
                                        'SUPPRIMEE',
                                    )
                                    .map(
                                      culture => {
                                        const autorisee =
                                          culture.statut !==
                                            'RECOLTEE' &&
                                          culture.statut !==
                                            'ABANDONNEE';

                                        return (
                                          <TouchableOpacity
                                            key={
                                              culture.id
                                            }
                                            activeOpacity={
                                              autorisee
                                                ? 0.7
                                                : 1
                                            }
                                            disabled={
                                              !autorisee
                                            }
                                            style={[
                                              styles.filterCultureItem,
                                              cultureAjout ===
                                                culture.id &&
                                                styles.filterCultureItemSelected,
                                              !autorisee &&
                                                styles.filterCultureItemDisabled,
                                            ]}
                                            onPress={() => {
                                              setCultureAjout(
                                                culture.id,
                                              );

                                              setSelectionCultureAjoutOuverte(
                                                false,
                                              );
                                            }}
                                          >
                                            <View
                                              style={
                                                styles.filterCultureInfo
                                              }
                                            >
                                              <View
                                                style={
                                                  styles.filterCultureNameRow
                                                }
                                              >
                                                <Sprout
                                                  size={16}
                                                  color={
                                                    autorisee
                                                      ? '#166534'
                                                      : '#9CA3AF'
                                                  }
                                                />

                                                <Text
                                                  style={[
                                                    styles.filterCultureName,
                                                    !autorisee &&
                                                      styles.disabledCultureText,
                                                  ]}
                                                  numberOfLines={
                                                    1
                                                  }
                                                >
                                                  {
                                                    culture.nom
                                                  }
                                                </Text>
                                              </View>

                                              <Text
                                                style={
                                                  styles.filterCultureStatus
                                                }
                                              >
                                                {culture.statut ===
                                                'EN_COURS'
                                                  ? 'Culture en cours'
                                                  : culture.statut ===
                                                    'PLANIFIEE'
                                                  ? 'Culture planifiée'
                                                  : culture.statut ===
                                                    'RECOLTEE'
                                                  ? 'Lecture seule • récoltée'
                                                  : culture.statut ===
                                                    'ABANDONNEE'
                                                  ? 'Lecture seule • abandonnée'
                                                  : culture.statut}
                                              </Text>
                                            </View>

                                            {cultureAjout ===
                                            culture.id ? (
                                              <View
                                                style={
                                                  styles.selectedCheckCircle
                                                }
                                              >
                                                <Check
                                                  size={15}
                                                  color="#FFFFFF"
                                                  strokeWidth={
                                                    2.8
                                                  }
                                                />
                                              </View>
                                            ) : null}
                                          </TouchableOpacity>
                                        );
                                      },
                                    )}
                                </ScrollView>
                              )}
                            </View>
                          ) : null}

                          {parcelleAjout &&
                          cultureAjout ? (
                            <View
                              style={
                                styles.addSummaryCard
                              }
                            >
                              <View
                                style={
                                  styles.addSummaryIcon
                                }
                              >
                                <Check
                                  size={18}
                                  color="#166534"
                                  strokeWidth={2.5}
                                />
                              </View>

                              <View
                                style={
                                  styles.addSummaryContent
                                }
                              >
                                <Text
                                  style={
                                    styles.addSummaryLabel
                                  }
                                >
                                  OBSERVATION POUR
                                </Text>

                                <Text
                                  style={
                                    styles.addSummaryCulture
                                  }
                                  numberOfLines={1}
                                >
                                  {
                                    culturesAjout.find(
                                      item =>
                                        item.id ===
                                        cultureAjout,
                                    )?.nom
                                  }
                                </Text>

                                <View
                                  style={
                                    styles.addSummaryParcelRow
                                  }
                                >
                                  <MapPin
                                    size={12}
                                    color="#6B7280"
                                  />

                                  <Text
                                    style={
                                      styles.addSummaryParcel
                                    }
                                    numberOfLines={1}
                                  >
                                    {
                                      parcelles.find(
                                        item =>
                                          item.id ===
                                          parcelleAjout,
                                      )?.nom
                                    }
                                  </Text>
                                </View>
                              </View>
                            </View>
                          ) : null}
                        </ScrollView>
  );
}
