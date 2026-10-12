import { ObservationGlobale, nomStatut } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { i18n } from '@/i18n/instance';
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';


import { colors } from '@/theme';
import type { UseQueryResult } from '@tanstack/react-query';
import { Check, ChevronDown, MapPin, Search, SlidersHorizontal, Sprout, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  appliquerFiltre: () => void;
  culturePourSelection: Culture | undefined;
  cultureTemporaire: string;
  culturesFiltre: NoInfer<Culture[]>;
  culturesQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  fermerFiltre: () => void;
  filtreActif: boolean;
  filtreOuvert: boolean;
  observationsGlobalesFiltrees: ObservationGlobale[];
  ouvrirFiltre: () => void;
  parcellePourSelection: Parcelle | undefined;
  parcelleTemporaire: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  recherche: string;
  reinitialiserFiltre: () => void;
  selectionCultureOuverte: boolean;
  selectionParcelleOuverte: boolean;
  setCultureTemporaire: Dispatch<SetStateAction<string>>;
  setParcelleTemporaire: Dispatch<SetStateAction<string>>;
  setRecherche: Dispatch<SetStateAction<string>>;
  setSelectionCultureOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleOuverte: Dispatch<SetStateAction<boolean>>;
};

export function VueObservations1({
  appliquerFiltre,
  culturePourSelection,
  cultureTemporaire,
  culturesFiltre,
  culturesQuery,
  fermerFiltre,
  filtreActif,
  filtreOuvert,
  observationsGlobalesFiltrees,
  ouvrirFiltre,
  parcellePourSelection,
  parcelleTemporaire,
  parcelles,
  parcellesQuery,
  recherche,
  reinitialiserFiltre,
  selectionCultureOuverte,
  selectionParcelleOuverte,
  setCultureTemporaire,
  setParcelleTemporaire,
  setRecherche,
  setSelectionCultureOuverte,
  setSelectionParcelleOuverte,
}: Props) {
  return (
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
                  style={
                    styles.searchContainer
                  }
                >
                  <Search
                    size={19}
                    color="#9CA3AF"
                    strokeWidth={2}
                  />

                  <TextInput
                    style={
                      styles.searchInput
                    }
                    placeholder={i18n.t('libelles.rechercheObservation')}
                    placeholderTextColor="#9CA3AF"
                    value={
                      recherche
                    }
                    onChangeText={
                      setRecherche
                    }
                    returnKeyType="search"
                  />

                  {recherche ? (
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={() =>
                        setRecherche('')
                      }
                      style={
                        styles.clearSearchButton
                      }
                    >
                      <X
                        size={17}
                        color="#6B7280"
                      />
                    </TouchableOpacity>
                  ) : null}
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.filterButton,
                    filtreActif &&
                      styles.filterButtonActive,
                  ]}
                  onPress={
                    ouvrirFiltre
                  }
                >
                  <SlidersHorizontal
                    size={19}
                    color={
                      filtreActif
                        ? '#FFFFFF'
                        : colors.neutral[700]
                    }
                    strokeWidth={2}
                  />

                  {filtreActif ? (
                    <View
                      style={
                        styles.filterIndicator
                      }
                    />
                  ) : null}
                </TouchableOpacity>
              </View>

              {/* FILTRE OUVERT */}

              {filtreOuvert ? (
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
                      Filtrer les observations
                    </Text>

                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={
                        fermerFiltre
                      }
                    >
                      <X
                        size={17}
                        color={
                          colors.neutral[500]
                        }
                      />
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={
                      styles.filterSelect
                    }
                    onPress={() => {
                      setSelectionParcelleOuverte(
                        value =>
                          !value,
                      );

                      setSelectionCultureOuverte(
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
                          size={17}
                          color={
                            colors.primary[600]
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.filterSelectText,
                          !parcelleTemporaire &&
                            styles.filterSelectPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {parcellePourSelection?.nom ??
                          i18n.t('domaine.selectionnerParcelle')}
                      </Text>
                    </View>

                    <ChevronDown
                      size={18}
                      color={
                        colors.neutral[500]
                      }
                      style={
                        selectionParcelleOuverte
                          ? styles.chevronRotated
                          : undefined
                      }
                    />
                  </TouchableOpacity>

                  {selectionParcelleOuverte ? (
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
                            color={
                              colors.primary[600]
                            }
                          />
                        </View>
                      ) : (
                        <ScrollView
                          nestedScrollEnabled
                          style={
                            styles.filterDropdownScroll
                          }
                        >
                          {parcelles.length ===
                          0 ? (
                            <Text
                              style={
                                styles.dropdownEmpty
                              }
                            >
                              Aucune parcelle disponible.
                            </Text>
                          ) : (
                            parcelles.map(
                              item => (
                                <TouchableOpacity
                                  key={
                                    item.id
                                  }
                                  activeOpacity={0.7}
                                  style={[
                                    styles.filterDropdownItem,
                                    parcelleTemporaire ===
                                      item.id &&
                                      styles.filterDropdownItemSelected,
                                  ]}
                                  onPress={() => {
                                    setParcelleTemporaire(
                                      item.id,
                                    );

                                    setCultureTemporaire(
                                      '',
                                    );

                                    setSelectionParcelleOuverte(
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
                                      size={15}
                                      color={
                                        parcelleTemporaire ===
                                        item.id
                                          ? colors.primary[600]
                                          : colors.neutral[400]
                                      }
                                    />

                                    <Text
                                      style={[
                                        styles.filterDropdownItemText,
                                        parcelleTemporaire ===
                                          item.id &&
                                          styles.filterDropdownItemTextSelected,
                                      ]}
                                    >
                                      {
                                        item.nom
                                      }
                                    </Text>
                                  </View>

                                  {parcelleTemporaire ===
                                  item.id ? (
                                    <Check
                                      size={17}
                                      color={
                                        colors.primary[600]
                                      }
                                      strokeWidth={
                                        2.5
                                      }
                                    />
                                  ) : null}
                                </TouchableOpacity>
                              ),
                            )
                          )}
                        </ScrollView>
                      )}
                    </View>
                  ) : null}

                  <TouchableOpacity
                    activeOpacity={
                      parcelleTemporaire
                        ? 0.8
                        : 1
                    }
                    disabled={
                      !parcelleTemporaire
                    }
                    style={[
                      styles.filterSelect,
                      styles.filterSelectSecond,
                      !parcelleTemporaire &&
                        styles.filterSelectDisabled,
                    ]}
                    onPress={() => {
                      setSelectionCultureOuverte(
                        value =>
                          !value,
                      );

                      setSelectionParcelleOuverte(
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
                          !parcelleTemporaire &&
                            styles.filterSelectIconDisabled,
                        ]}
                      >
                        <Sprout
                          size={17}
                          color={
                            parcelleTemporaire
                              ? colors.primary[600]
                              : colors.neutral[400]
                          }
                        />
                      </View>

                      <Text
                        style={[
                          styles.filterSelectText,
                          !cultureTemporaire &&
                            styles.filterSelectPlaceholder,
                        ]}
                        numberOfLines={1}
                      >
                        {parcelleTemporaire
                          ? culturePourSelection?.nom ??
                            i18n.t('domaine.selectionnerCulture')
                          : i18n.t('parcelles.choisissezDAbordParcelle')}
                      </Text>
                    </View>

                    <ChevronDown
                      size={18}
                      color={
                        parcelleTemporaire
                          ? colors.neutral[500]
                          : colors.neutral[300]
                      }
                      style={
                        selectionCultureOuverte
                          ? styles.chevronRotated
                          : undefined
                      }
                    />
                  </TouchableOpacity>

                  {selectionCultureOuverte &&
                  parcelleTemporaire ? (
                    <View
                      style={
                        styles.filterDropdown
                      }
                    >
                      {culturesQuery.isLoading ? (
                        <View
                          style={
                            styles.dropdownLoading
                          }
                        >
                          <ActivityIndicator
                            color={
                              colors.primary[600]
                            }
                          />

                          <Text
                            style={
                              styles.dropdownLoadingText
                            }
                          >
                            Chargement des cultures...
                          </Text>
                        </View>
                      ) : culturesQuery.isError ? (
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
                          {culturesFiltre
                            .filter(
                              culture =>
                                culture.statut !==
                                'SUPPRIMEE',
                            )
                            .map(
                              culture => (
                                <TouchableOpacity
                                  key={
                                    culture.id
                                  }
                                  activeOpacity={0.7}
                                  style={[
                                    styles.filterCultureItem,
                                    cultureTemporaire ===
                                      culture.id &&
                                      styles.filterCultureItemSelected,
                                  ]}
                                  onPress={() => {
                                    setCultureTemporaire(
                                      culture.id,
                                    );

                                    setSelectionCultureOuverte(
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
                                        size={15}
                                        color={
                                          colors.primary[600]
                                        }
                                      />

                                      <Text
                                        style={
                                          styles.filterCultureName
                                        }
                                        numberOfLines={1}
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
                                      {nomStatut(
                                        culture.statut,
                                      )}
                                    </Text>
                                  </View>

                                  {cultureTemporaire ===
                                  culture.id ? (
                                    <View
                                      style={
                                        styles.selectedCheckCircle
                                      }
                                    >
                                      <Check
                                        size={15}
                                        color="#FFFFFF"
                                        strokeWidth={2.8}
                                      />
                                    </View>
                                  ) : null}
                                </TouchableOpacity>
                              ),
                            )}
                        </ScrollView>
                      )}
                    </View>
                  ) : null}

                  <View
                    style={
                      styles.filterPanelActions
                    }
                  >
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={
                        styles.resetSmallButton
                      }
                      onPress={
                        reinitialiserFiltre
                      }
                    >
                      <Text
                        style={
                          styles.resetSmallButtonText
                        }
                      >
                        Réinitialiser
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.85}
                      style={
                        styles.applySmallButton
                      }
                      onPress={
                        appliquerFiltre
                      }
                    >
                      <Check
                        size={16}
                        color="#FFFFFF"
                        strokeWidth={2.5}
                      />

                      <Text
                        style={
                          styles.applySmallButtonText
                        }
                      >
                        Appliquer
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* STATS */}

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
                      observationsGlobalesFiltrees.length
                    }
                  </Text>

                  <Text
                    style={
                      styles.statPillLabel
                    }
                  >
                    résultat
                    {observationsGlobalesFiltrees.length >
                    1
                      ? 's'
                      : ''}
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
                    : filtreActif
                      ? 'Filtre actif'
                      : i18n.t('domaine.trieesDateRecente')}
                </Text>
              </View>
            </View>
  );
}
