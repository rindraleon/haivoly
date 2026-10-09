import { nomStatut } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';


import type { UseQueryResult } from '@tanstack/react-query';
import { Check, ChevronDown, ChevronRight, MapPin, Sprout, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type { Culture, Paginated, Parcelle } from '@/types';
type Props = {
  appliquerFiltre: () => void;
  culturePourSelection: Culture | undefined;
  cultureTemporaire: string;
  culturesFiltre: NoInfer<Culture[]>;
  culturesQuery: UseQueryResult<NoInfer<Culture[]>, Error>;
  fermerFiltre: () => void;
  parcellePourSelection: Parcelle | undefined;
  parcelleTemporaire: string;
  parcelles: NoInfer<Parcelle[]>;
  parcellesQuery: UseQueryResult<NoInfer<Paginated<Parcelle>>, Error>;
  reinitialiserFiltre: () => void;
  selectionCultureOuverte: boolean;
  selectionParcelleOuverte: boolean;
  setCultureTemporaire: Dispatch<SetStateAction<string>>;
  setParcelleTemporaire: Dispatch<SetStateAction<string>>;
  setSelectionCultureOuverte: Dispatch<SetStateAction<boolean>>;
  setSelectionParcelleOuverte: Dispatch<SetStateAction<boolean>>;
  voirSuivi: () => void;
};

export function Fermerfiltre({
  appliquerFiltre,
  culturePourSelection,
  cultureTemporaire,
  culturesFiltre,
  culturesQuery,
  fermerFiltre,
  parcellePourSelection,
  parcelleTemporaire,
  parcelles,
  parcellesQuery,
  reinitialiserFiltre,
  selectionCultureOuverte,
  selectionParcelleOuverte,
  setCultureTemporaire,
  setParcelleTemporaire,
  setSelectionCultureOuverte,
  setSelectionParcelleOuverte,
  voirSuivi,
}: Props) {
  return (
<View
                  style={
                    styles.modalOverlay
                  }
                >
                  <TouchableOpacity
                    style={
                      styles.modalBackdrop
                    }
                    activeOpacity={1}
                    onPress={
                      fermerFiltre
                    }
                  />

                  <View
                    style={
                      styles.filterSheet
                    }
                  >
                    <View
                      style={
                        styles.sheetHandle
                      }
                    />

                    <View
                      style={
                        styles.sheetHeader
                      }
                    >
                      <View>
                        <Text
                          style={
                            styles.sheetTitle
                          }
                        >
                          Filtrer les observations
                        </Text>

                        <Text
                          style={
                            styles.sheetSubtitle
                          }
                        >
                          Parcelle puis culture
                        </Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={
                          fermerFiltre
                        }
                        style={
                          styles.sheetCloseButton
                        }
                      >
                        <X
                          size={20}
                          color="#374151"
                        />
                      </TouchableOpacity>
                    </View>

                    <ScrollView
                      showsVerticalScrollIndicator={
                        false
                      }
                      contentContainerStyle={
                        styles.sheetContent
                      }
                    >
                      <Text
                        style={
                          styles.filterLabel
                        }
                      >
                        PARCELLE
                      </Text>

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.filterSelectModal,
                          selectionParcelleOuverte &&
                            styles.filterSelectOpen,
                        ]}
                        onPress={() => {
                          setSelectionParcelleOuverte(
                            previous =>
                              !previous,
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
                              size={18}
                              color="#166534"
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
                              'Sélectionner une parcelle'}
                          </Text>
                        </View>

                        <ChevronDown
                          size={19}
                          color="#6B7280"
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
                                color="#166534"
                              />
                            </View>
                          ) : parcelles.length ===
                            0 ? (
                            <Text
                              style={
                                styles.dropdownEmpty
                              }
                            >
                              Aucune parcelle disponible.
                            </Text>
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
                                        size={16}
                                        color={
                                          parcelleTemporaire ===
                                          item.id
                                            ? '#166534'
                                            : '#9CA3AF'
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

                      <Text
                        style={[
                          styles.filterLabel,
                          styles.filterLabelCulture,
                        ]}
                      >
                        CULTURE
                      </Text>

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
                          styles.filterSelectModal,
                          !parcelleTemporaire &&
                            styles.filterSelectDisabled,
                          selectionCultureOuverte &&
                            styles.filterSelectOpen,
                        ]}
                        onPress={() => {
                          setSelectionCultureOuverte(
                            previous =>
                              !previous,
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
                              size={18}
                              color={
                                parcelleTemporaire
                                  ? '#166534'
                                  : '#9CA3AF'
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
                                'Sélectionner une culture'
                              : 'Choisissez d’abord une parcelle'}
                          </Text>
                        </View>

                        <ChevronDown
                          size={19}
                          color={
                            parcelleTemporaire
                              ? '#6B7280'
                              : '#D1D5DB'
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
                                Impossible de charger
                                les cultures.
                              </Text>
                            </View>
                          ) : culturesFiltre.filter(
                              culture =>
                                culture.statut !==
                                'SUPPRIMEE',
                            ).length === 0 ? (
                            <Text
                              style={
                                styles.dropdownEmpty
                              }
                            >
                              Aucune culture dans cette
                              parcelle.
                            </Text>
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
                                      activeOpacity={
                                        0.7
                                      }
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
                                            size={16}
                                            color="#166534"
                                          />

                                          <Text
                                            style={
                                              styles.filterCultureName
                                            }
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
                                            size={
                                              15
                                            }
                                            color="#FFFFFF"
                                            strokeWidth={
                                              2.8
                                            }
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
                          styles.followSection
                        }
                      >
                        <Text
                          style={
                            styles.filterLabel
                          }
                        >
                          SUIVI
                        </Text>

                        <TouchableOpacity
                          activeOpacity={
                            parcelleTemporaire &&
                            cultureTemporaire
                              ? 0.85
                              : 1
                          }
                          disabled={
                            !parcelleTemporaire ||
                            !cultureTemporaire
                          }
                          onPress={
                            voirSuivi
                          }
                          style={[
                            styles.followButton,
                            (!parcelleTemporaire ||
                              !cultureTemporaire) &&
                              styles.followButtonDisabled,
                          ]}
                        >
                          <View
                            style={
                              styles.followButtonIcon
                            }
                          >
                            <Sprout
                              size={20}
                              color="#FFFFFF"
                              strokeWidth={
                                2.3
                              }
                            />
                          </View>

                          <View
                            style={
                              styles.followButtonContent
                            }
                          >
                            <Text
                              style={
                                styles.followButtonTitle
                              }
                            >
                              Voir le suivi
                            </Text>

                            <Text
                              style={
                                styles.followButtonSubtitle
                              }
                              numberOfLines={1}
                            >
                              {cultureTemporaire
                                ? `${
                                    culturePourSelection?.nom ??
                                    'Culture'
                                  } • ${
                                    parcellePourSelection?.nom ??
                                    'Parcelle'
                                  }`
                                : 'Sélectionnez une parcelle et une culture'}
                            </Text>
                          </View>

                          <ChevronRight
                            size={22}
                            color={
                              parcelleTemporaire &&
                              cultureTemporaire
                                ? '#FFFFFF'
                                : '#9CA3AF'
                            }
                          />
                        </TouchableOpacity>
                      </View>
                    </ScrollView>

                    <View
                      style={
                        styles.sheetActions
                      }
                    >
                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={
                          styles.resetButton
                        }
                        onPress={
                          reinitialiserFiltre
                        }
                      >
                        <Text
                          style={
                            styles.resetButtonText
                          }
                        >
                          Réinitialiser
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        activeOpacity={0.85}
                        style={
                          styles.applyButton
                        }
                        onPress={
                          appliquerFiltre
                        }
                      >
                        <Check
                          size={18}
                          color="#FFFFFF"
                          strokeWidth={
                            2.5
                          }
                        />

                        <Text
                          style={
                            styles.applyButtonText
                          }
                        >
                          Appliquer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
  );
}
