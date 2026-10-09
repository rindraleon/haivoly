import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';

import { colors } from '@/theme';
import { Check, ChevronRight, MapPinned, X } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { formatNombre } from '@/utils/formatNombre';
import type {
  Parcelle,
} from '@/types';
type Props = {
  ajoutCultureModalOuvert: boolean;
  choisirParcellePourAjout: (id: string) => void;
  isErrorParcelles: boolean;
  isLoadingParcelles: boolean;
  parcellePourAjout: string | null;
  parcelles: NoInfer<Parcelle[]> | undefined;
  setAjoutCultureModalOuvert: Dispatch<SetStateAction<boolean>>;
};

export function VueCultureParcelle({
  ajoutCultureModalOuvert,
  choisirParcellePourAjout,
  isErrorParcelles,
  isLoadingParcelles,
  parcellePourAjout,
  parcelles,
  setAjoutCultureModalOuvert,
}: Props) {
  return (
<Modal
        visible={
          ajoutCultureModalOuvert
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setAjoutCultureModalOuvert(
            false,
          )
        }
      >

        <View
          style={
            styles.modalOverlay
          }
        >

          <Pressable
            style={
              StyleSheet.absoluteFill
            }
            onPress={() =>
              setAjoutCultureModalOuvert(
                false,
              )
            }
          />

          <View
            style={
              styles.modalCard
            }
          >

            <View
              style={
                styles.modalHeader
              }
            >

              <View
                style={
                  styles.modalHeaderText
                }
              >

                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Choisir une parcelle
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Sélectionnez la parcelle où vous souhaitez créer la culture.
                </Text>

              </View>

              <Pressable
                style={
                  styles.modalCloseButton
                }
                onPress={() =>
                  setAjoutCultureModalOuvert(
                    false,
                  )
                }
              >

                <X
                  size={20}
                  color={
                    colors.neutral[600]
                  }
                />

              </Pressable>

            </View>

            <View
              style={
                styles.modalDivider
              }
            />

            {isLoadingParcelles ? (

              <View
                style={
                  styles.modalLoading
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
                    styles.modalLoadingText
                  }
                >
                  Chargement des parcelles...
                </Text>

              </View>

            ) : isErrorParcelles ? (

              <View
                style={
                  styles.modalEmpty
                }
              >

                <Text
                  style={
                    styles.modalEmptyTitle
                  }
                >
                  Impossible de charger les parcelles
                </Text>

                <Text
                  style={
                    styles.modalEmptyText
                  }
                >
                  Vérifiez votre connexion puis réessayez.
                </Text>

              </View>

            ) : !parcelles ||
              parcelles.length === 0 ? (

              <View
                style={
                  styles.modalEmpty
                }
              >

                <Text
                  style={
                    styles.modalEmptyTitle
                  }
                >
                  Aucune parcelle
                </Text>

                <Text
                  style={
                    styles.modalEmptyText
                  }
                >
                  Créez d&apos;abord une parcelle avant d&apos;ajouter une culture.
                </Text>

              </View>

            ) : (

              <ScrollView
                style={
                  styles.modalParcellesScroll
                }
                showsVerticalScrollIndicator={
                  false
                }
              >

                {parcelles.map(
                  (item) => {

                    const selectionnee =
                      parcellePourAjout ===
                      item.id;

                    return (
                      <Pressable
                        key={
                          item.id
                        }
                        style={({ pressed }) => [
                          styles.modalParcelleItem,

                          selectionnee &&
                            styles.modalParcelleItemSelected,

                          pressed && {
                            opacity: 0.9,
                          },
                        ]}
                        onPress={() =>
                          choisirParcellePourAjout(
                            item.id,
                          )
                        }
                      >

                        <View
                          style={
                            styles.modalParcelleIcon
                          }
                        >

                          <MapPinned
                            size={18}
                            color={
                              colors.primary[600]
                            }
                          />

                        </View>

                        <View
                          style={
                            styles.modalParcelleInfo
                          }
                        >

                          <Text
                            style={
                              styles.modalParcelleNom
                            }
                          >
                            {item.nom}
                          </Text>

                          {item.superficie !=
                            null && (
                            <Text
                              style={
                                styles.modalParcelleSuperficie
                              }
                            >
                              {formatNombre(item.superficie)}{' '}
                              m²
                            </Text>
                          )}

                        </View>

                        {selectionnee ? (

                          <View
                            style={
                              styles.modalCheck
                            }
                          >

                            <Check
                              size={18}
                              color="#fff"
                              strokeWidth={3}
                            />

                          </View>

                        ) : (

                          <ChevronRight
                            size={18}
                            color={
                              colors.neutral[400]
                            }
                          />

                        )}

                      </Pressable>
                    );
                  },
                )}

              </ScrollView>
            )}

          </View>

        </View>

      </Modal>
  );
}
