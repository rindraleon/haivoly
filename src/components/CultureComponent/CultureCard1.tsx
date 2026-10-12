import { Badge } from '@/components/CommonComponent/Badge';
import { i18n } from '@/i18n/instance';
import { Card } from '@/components/CommonComponent/Card';
import { CultureToutesParcelles, getBadgeVariant, nomStatut } from '@/screens/CultureScreen/CultureListScreen.helpers';
import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';

import { colors } from '@/theme';
import { ChevronRight, Clock3, Layers, Leaf, MapPinned, Sprout } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { GrilleDInformations } from '@/components/CultureComponent/GrilleDInformations';
import { Progression } from '@/components/CultureComponent/Progression';
import type {
  PointGPS as PointGPS,
} from '@/types';
type Props = {
  culture: CultureToutesParcelles;
  dateModification: string | null;
  datePlantation: string | null;
  dateRecoltePrevue: string | null;
  estDelimitee: boolean;
  onPress: () => void;
  points: PointGPS[];
  progression: number;
  progressionActive: boolean;
  progressionLabel: string;
};

export function CultureCard1({
  culture,
  dateModification,
  datePlantation,
  dateRecoltePrevue,
  estDelimitee,
  onPress,
  points,
  progression,
  progressionActive,
  progressionLabel,
}: Props) {
  return (
<Card
          style={
            styles.cultureCard
          }
        >

          {}

          <View
            style={
              styles.cultureHeader
            }
          >

            <View
              style={
                styles.cultureIcon
              }
            >

              <Sprout
                size={21}
                color={
                  colors.primary[600]
                }
                strokeWidth={2}
              />

            </View>

            <View
              style={
                styles.cultureHeaderContent
              }
            >

              <Text
                numberOfLines={1}
                style={
                  styles.cultureName
                }
              >
                {culture.nom}
              </Text>

              <View
                style={
                  styles.cultureSubtitleRow
                }
              >

                {culture.type ? (
                  <>
                    <Layers
                      size={11}
                      color={
                        colors.neutral[500]
                      }
                      strokeWidth={2}
                    />

                    <Text
                      numberOfLines={1}
                      style={
                        styles.cultureSubtitle
                      }
                    >
                      {culture.type}
                    </Text>
                  </>
                ) : null}

                {culture.type &&
                culture.variete ? (
                  <Text
                    style={
                      styles.cultureSubtitleSeparator
                    }
                  >
                    •
                  </Text>
                ) : null}

                {culture.variete ? (
                  <>
                    <Leaf
                      size={11}
                      color={
                        colors.neutral[500]
                      }
                      strokeWidth={2}
                    />

                    <Text
                      numberOfLines={1}
                      style={
                        styles.cultureSubtitle
                      }
                    >
                      {culture.variete}
                    </Text>
                  </>
                ) : null}

              </View>

            </View>

            <View
              style={
                styles.statusContainer
              }
            >

              <Badge
                label={nomStatut(
                  culture.statut,
                )}
                variant={getBadgeVariant(
                  culture.statut,
                )}
                dot
              />

            </View>

          </View>

          {}

          <View
            style={
              styles.cardSeparator
            }
          />

          {}

          <Progression
            progression={progression}
            progressionActive={progressionActive}
            progressionLabel={progressionLabel}
          />

          {}

          <Pressable
            onPress={onPress}
            style={({ pressed }) => [
              styles.parcelleCard,

              pressed && {
                opacity: 0.88,
              },
            ]}
          >

            <View
              style={
                styles.parcelleCardLeft
              }
            >

              <MapPinned
                size={19}
                color={
                  colors.primary[600]
                }
                strokeWidth={2}
              />

              <View
                style={
                  styles.parcelleCardText
                }
              >

                <Text
                  style={
                    styles.parcelleCardLabel
                  }
                >
                  PARCELLE
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.parcelleCardValue
                  }
                >
                  {culture.parcelleNom ||
                    i18n.t('domaine.parcelleNonRenseignee')}
                </Text>

              </View>

            </View>

          </Pressable>

          {}

          <GrilleDInformations
            culture={culture}
            datePlantation={datePlantation}
            dateRecoltePrevue={dateRecoltePrevue}
            estDelimitee={estDelimitee}
            points={points}
          />

          {}

          <View
            style={
              styles.cardFooter
            }
          >

            <View
              style={
                styles.modifiedInfo
              }
            >

              <Clock3
                size={14}
                color={
                  colors.neutral[400]
                }
                strokeWidth={1.9}
              />

              <Text
                style={
                  styles.modifiedText
                }
                numberOfLines={1}
              >
                {dateModification
                  ? `Modifiée le ${dateModification}`
                  : i18n.t('cultures.modificationNonRenseignee')}
              </Text>

            </View>

            <View
              style={
                styles.detailsButton
              }
            >

              <Text
                style={
                  styles.detailsButtonText
                }
              >
                Détails
              </Text>

              <ChevronRight
                size={16}
                color={
                  colors.primary[700]
                }
                strokeWidth={2.2}
              />

            </View>

          </View>

        </Card>
  );
}
