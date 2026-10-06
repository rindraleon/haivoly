/**
 * Section `ModeCulture` extraite de `ObservationListScreen`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';
import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { ObservationCard } from '@/components/ObservationComponent/ObservationCard';
import type { StatutCulture } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';

import { colors } from '@/theme';
import { Plus } from 'lucide-react-native';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';

import type {
  Observation,
} from '@/types';
type Props = {
  actualiser: () => Promise<void>;
  confirmerSuppression: (observation: Observation) => void;
  cultureId: string;
  cultureNom: string;
  lectureSeule: boolean;
  modificationAutorisee: boolean;
  observationsFiltrees: Observation[];
  ouvrirAjout: () => void;
  ouvrirModification: (observation: Observation) => void;
  parcelleId: string;
  parcelleNom: string;
  refreshing: boolean;
  statut: StatutCulture | undefined;
};

export function ModeCulture({
  actualiser,
  confirmerSuppression,
  cultureId,
  cultureNom,
  lectureSeule,
  modificationAutorisee,
  observationsFiltrees,
  ouvrirAjout,
  ouvrirModification,
  parcelleId,
  parcelleNom,
  refreshing,
  statut,
}: Props) {
  return (
<View
        style={
          styles.root
        }
      >
        <View
          style={
            styles.detailBody
          }
        >
          <ScrollView
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.detailContent
          }
          refreshControl={
            <RefreshControl
              refreshing={
                refreshing
              }
              onRefresh={
                actualiser
              }
              tintColor={
                colors.primary[500]
              }
            />
          }
        >
          {/* HEADER */}

          <ScreenHeader
            title="Observations"
            subtitle={`Parcelle : ${
              parcelleNom ||
              parcelleId
            } • ${
              cultureNom ||
              'Culture'
            }`}
            showBack
          />

          {/* ==================================================
              STATUT
          ================================================== */}

          <View
            style={[
              styles.statusBox,
              lectureSeule
                ? styles.statusReadOnly
                : styles.statusEditable,
            ]}
          >
            <View
              style={
                styles.statusHeader
              }
            >
              <View
                style={[
                  styles.statusDot,
                  lectureSeule
                    ? styles.statusDotReadonly
                    : styles.statusDotEditable,
                ]}
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {statut ===
                'EN_COURS'
                  ? 'Culture en cours'
                  : statut ===
                    'RECOLTEE'
                  ? 'Culture récoltée'
                  : statut ===
                    'ABANDONNEE'
                  ? 'Culture abandonnée'
                  : `Statut : ${
                      statut ||
                      'INCONNU'
                    }`}
              </Text>
            </View>

            <Text
              style={
                styles.statusDescription
              }
            >
              {lectureSeule
                ? 'Consultation uniquement. Les observations et leurs photos peuvent être consultées.'
                : 'Les observations peuvent être ajoutées, modifiées et supprimées.'}
            </Text>
          </View>

          {/* ==================================================
              SECTION HISTORIQUE
          ================================================== */}

          <View
            style={
              styles.sectionHeader
            }
          >
            <View
              style={
                styles.sectionTitleBlock
              }
            >
              <Text
                style={
                  styles.sectionTitle
                }
              >
                Historique
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Observations de cette culture
              </Text>
            </View>

            <Text
              style={
                styles.countText
              }
            >
              {
                observationsFiltrees.length
              }{' '}
              observation
              {observationsFiltrees.length >
              1
                ? 's'
                : ''}
            </Text>
          </View>

          {observationsFiltrees.length ===
          0 ? (
            <View
              style={
                styles.emptyCard
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
                Aucune observation n’a encore
                été enregistrée pour cette
                culture.
              </Text>
            </View>
          ) : (
            <View
              style={
                styles.listAreaDetail
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

              <View
                style={
                  styles.listContent
                }
              >
                {observationsFiltrees.map(
                  observation => (
                    <ObservationCard
                      key={
                        observation.id
                      }
                      observation={
                        observation
                      }
                      parcelleId={
                        parcelleId
                      }
                      cultureId={
                        cultureId
                      }
                      cultureNom={
                        cultureNom ||
                        'Culture'
                      }
                      parcelleNom={
                        parcelleNom ||
                        'Parcelle'
                      }
                      statutCulture={
                        statut
                      }
                      modificationAutorisee={
                        modificationAutorisee
                      }
                      onModifier={
                        ouvrirModification
                      }
                      onSupprimer={
                        confirmerSuppression
                      }
                    />
                  ),
                )}
              </View>
            </View>
          )}
          </ScrollView>

          {modificationAutorisee ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Ajouter une observation"
              onPress={
                ouvrirAjout
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
          ) : null}
        </View>

        <AppBottomBar />
      </View>
  );
}
