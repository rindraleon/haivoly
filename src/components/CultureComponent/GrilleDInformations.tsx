import type { CultureToutesParcelles } from '@/screens/CultureScreen/CultureListScreen.helpers';
import { i18n } from '@/i18n/instance';
import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';

import { colors } from '@/theme';
import { Calendar, MapPinned, Sprout, Wheat } from 'lucide-react-native';
import { Text, View } from 'react-native';

import type {
  PointGPS as PointGPS,
} from '@/types';
type Props = {
  culture: CultureToutesParcelles;
  datePlantation: string | null;
  dateRecoltePrevue: string | null;
  estDelimitee: boolean;
  points: PointGPS[];
};

export function GrilleDInformations({
  culture,
  datePlantation,
  dateRecoltePrevue,
  estDelimitee,
  points,
}: Props) {
  return (
<View
              style={
                styles.infoGrid
              }
            >

              {/* STADE */}

              <View
                style={
                  styles.infoCard
                }
              >

                <View
                  style={
                    styles.infoCardIcon
                  }
                >

                  <Sprout
                    size={16}
                    color={
                      colors.primary[600]
                    }
                    strokeWidth={2}
                  />

                </View>

                <View
                  style={
                    styles.infoCardContent
                  }
                >

                  <Text
                    style={
                      styles.infoCardLabel
                    }
                  >
                    STADE
                  </Text>

                  <Text
                    numberOfLines={2}
                    style={
                      styles.infoCardValue
                    }
                  >
                    {culture.stade ||
                      i18n.t('domaine.nonRenseigne')}
                  </Text>

                </View>

              </View>


              {/* PLANTATION */}

              <View
                style={
                  styles.infoCard
                }
              >

                <View
                  style={
                    styles.infoCardIcon
                  }
                >

                  <Calendar
                    size={16}
                    color={
                      colors.primary[600]
                    }
                    strokeWidth={2}
                  />

                </View>

                <View
                  style={
                    styles.infoCardContent
                  }
                >

                  <Text
                    style={
                      styles.infoCardLabel
                    }
                  >
                    PLANTATION
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={
                      styles.infoCardValue
                    }
                  >
                    {datePlantation ||
                      i18n.t('cultures.nonRenseignee')}
                  </Text>

                </View>

              </View>


              {/* RÉCOLTE */}

              <View
                style={
                  styles.infoCard
                }
              >

                <View
                  style={
                    styles.infoCardIcon
                  }
                >

                  <Wheat
                    size={16}
                    color={
                      colors.primary[600]
                    }
                    strokeWidth={2}
                  />

                </View>

                <View
                  style={
                    styles.infoCardContent
                  }
                >

                  <Text
                    style={
                      styles.infoCardLabel
                    }
                  >
                    RÉCOLTE
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={
                      styles.infoCardValue
                    }
                  >
                    {dateRecoltePrevue ||
                      i18n.t('cultures.nonRenseignee')}
                  </Text>

                </View>

              </View>


              {/* DÉLIMITATION */}

              <View
                style={
                  styles.infoCard
                }
              >

                <View
                  style={
                    styles.infoCardIcon
                  }
                >

                  <MapPinned
                    size={16}
                    color={
                      colors.primary[600]
                    }
                    strokeWidth={2}
                  />

                </View>

                <View
                  style={
                    styles.infoCardContent
                  }
                >

                  <Text
                    style={
                      styles.infoCardLabel
                    }
                  >
                    DÉLIMITATION
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.infoCardValue,
                      estDelimitee &&
                        styles.infoCardValueActive,
                    ]}
                  >
                    {estDelimitee
                      ? `${points.length} points GPS`
                      : i18n.t('cultures.nonDelimitee')}
                  </Text>

                </View>

              </View>

            </View>
  );
}
