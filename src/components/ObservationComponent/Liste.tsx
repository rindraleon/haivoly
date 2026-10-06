/**
 * Section `Liste` extraite de `VueObservations`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { ObservationCard } from '@/components/ObservationComponent/ObservationCard';
import type { CultureGlobale, ObservationGlobale } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';

import { colors } from '@/theme';
import { Plus, SlidersHorizontal, X } from 'lucide-react-native';
import { ActivityIndicator, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type {
  Parcelle,
} from '@/types';
type Props = {
  actualiser: () => Promise<void>;
  chargementGlobal: boolean;
  confirmerSuppressionGlobale: (item: ObservationGlobale) => void;
  cultureSelectionnee: string;
  culturesGlobales: CultureGlobale[];
  erreurGlobal: boolean;
  filtreActif: boolean;
  observationsGlobalesFiltrees: ObservationGlobale[];
  ouvrirAjoutGlobal: () => void;
  ouvrirModificationGlobale: (item: ObservationGlobale) => void;
  parcelleSelectionnee: string;
  parcelles: NoInfer<Parcelle[]>;
  reinitialiserFiltre: () => void;
};

export function Liste({
  actualiser,
  chargementGlobal,
  confirmerSuppressionGlobale,
  cultureSelectionnee,
  culturesGlobales,
  erreurGlobal,
  filtreActif,
  observationsGlobalesFiltrees,
  ouvrirAjoutGlobal,
  ouvrirModificationGlobale,
  parcelleSelectionnee,
  parcelles,
  reinitialiserFiltre,
}: Props) {
  return (
<View
              style={
                styles.listArea
              }
            >
              <ScrollView
                style={
                  styles.listScroll
                }
                contentContainerStyle={
                  styles.listScrollContent
                }
                showsVerticalScrollIndicator={
                  false
                }
                nestedScrollEnabled
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

              {filtreActif ? (
                <View
                  style={
                    styles.activeFilterCard
                  }
                >
                  <View
                    style={
                      styles.activeFilterIcon
                    }
                  >
                    <SlidersHorizontal
                      size={16}
                      color={
                        colors.primary[600]
                      }
                    />
                  </View>

                  <View
                    style={
                      styles.activeFilterContent
                    }
                  >
                    <Text
                      style={
                        styles.activeFilterLabel
                      }
                    >
                      Filtre actuel
                    </Text>

                    <Text
                      style={
                        styles.activeFilterText
                      }
                      numberOfLines={2}
                    >
                      {parcelleSelectionnee
                        ? parcelles.find(
                            item =>
                              item.id ===
                              parcelleSelectionnee,
                          )?.nom
                        : 'Toutes les parcelles'}

                      {cultureSelectionnee
                        ? ` • ${
                            culturesGlobales.find(
                              item =>
                                item.id ===
                                cultureSelectionnee,
                            )?.nom ??
                            'Culture'
                          }`
                        : ''}
                    </Text>
                  </View>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={
                      reinitialiserFiltre
                    }
                    style={
                      styles.clearFilterButton
                    }
                  >
                    <X
                      size={16}
                      color={
                        colors.primary[600]
                      }
                    />
                  </TouchableOpacity>
                </View>
              ) : null}

              {chargementGlobal ? (
                <View
                  style={
                    styles.loadingInline
                  }
                >
                  <ActivityIndicator
                    size="large"
                    color={
                      colors.primary[600]
                    }
                  />

                  <Text
                    style={
                      styles.loadingInlineText
                    }
                  >
                    Chargement des observations...
                  </Text>
                </View>
              ) : erreurGlobal ? (
                <View
                  style={
                    styles.emptyInline
                  }
                >
                  <Text
                    style={
                      styles.errorTitle
                    }
                  >
                    Impossible de charger les
                    observations
                  </Text>

                  <Text
                    style={
                      styles.errorMessage
                    }
                  >
                    Vérifiez votre connexion puis
                    réessayez.
                  </Text>

                  <TouchableOpacity
                    style={
                      styles.retryButtonInline
                    }
                    onPress={
                      actualiser
                    }
                  >
                    <Text
                      style={
                        styles.retryButtonInlineText
                      }
                    >
                      Réessayer
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : observationsGlobalesFiltrees.length ===
                0 ? (
                <View
                  style={
                    styles.emptyInline
                  }
                >
                  <Text
                    style={
                      styles.emptyIcon
                    }
                  >
                    📝
                  </Text>

                  <Text
                    style={
                      styles.emptyTitle
                    }
                  >
                    Aucune observation
                  </Text>

                  <Text
                    style={
                      styles.emptyText
                    }
                  >
                    {filtreActif
                      ? 'Aucune observation ne correspond aux filtres sélectionnés.'
                      : "Aucune observation n'a encore été enregistrée dans vos cultures."}
                  </Text>

                  {filtreActif ? (
                    <TouchableOpacity
                      style={
                        styles.resetEmptyButton
                      }
                      onPress={
                        reinitialiserFiltre
                      }
                    >
                      <Text
                        style={
                          styles.resetEmptyButtonText
                        }
                      >
                        Réinitialiser
                      </Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : (
                <View
                  style={
                    styles.listContent
                  }
                >
                  {observationsGlobalesFiltrees.map(
                    item => (
                      <ObservationCard
                        key={`${item.parcelleId}-${item.cultureId}-${item.observation.id}`}
                        observation={
                          item.observation
                        }
                        parcelleId={
                          item.parcelleId
                        }
                        cultureId={
                          item.cultureId
                        }
                        cultureNom={
                          item.cultureNom
                        }
                        parcelleNom={
                          item.parcelleNom
                        }
                        statutCulture={
                          item.statutCulture
                        }
                        modificationAutorisee={
                          item.statutCulture !==
                            'SUPPRIMEE' &&
                          item.statutCulture !==
                            'RECOLTEE' &&
                          item.statutCulture !==
                            'ABANDONNEE'
                        }
                        onModifier={() =>
                          ouvrirModificationGlobale(
                            item,
                          )
                        }
                        onSupprimer={() =>
                          confirmerSuppressionGlobale(
                            item,
                          )
                        }
                      />
                    ),
                  )}
                </View>
              )}

              </ScrollView>

              {/* FAB : attaché à la zone de liste */}
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Ajouter une observation"
                onPress={
                  ouvrirAjoutGlobal
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
            </View>
  );
}
