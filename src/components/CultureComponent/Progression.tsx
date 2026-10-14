import { styles } from '@/screens/CultureScreen/CultureListScreen.styles';
import { Text, View } from 'react-native';

type Props = {
  progression: number;
  progressionActive: boolean;
  progressionLabel: string;
};

export function Progression({
  progression,
  progressionActive,
  progressionLabel,
}: Props) {
  return (
<View
              style={
                styles.progressSection
              }
            >

              <View
                style={
                  styles.progressHeader
                }
              >

                <View
                  style={
                    styles.progressTitleArea
                  }
                >

                  <Text
                    style={
                      styles.progressTitle
                    }
                  >
                    PROGRESSION DU CYCLE
                  </Text>

                  <Text
                    style={
                      progressionActive
                        ? styles.progressLabelActive
                        : styles.progressLabelInactive
                    }
                  >
                    {progressionLabel}
                  </Text>

                </View>


                <Text
                  style={
                    progressionActive
                      ? styles.progressPercent
                      : styles.progressPercentInactive
                  }
                >
                  {progressionActive
                    ? `${progression} %`
                    : '—'}
                </Text>

              </View>



              <View
                style={
                  styles.progressTimeline
                }
              >

                <View
                  style={
                    styles.progressLineBackground
                  }
                />

                <View
                  style={[
                    styles.progressLineActive,
                    {
                      right:
                        progression === 66
                          ? '50%'
                          : progression === 100
                            ? 5.5
                            : '100%',
                    },
                  ]}
                />


                <View
                  style={
                    styles.progressNodeRow
                  }
                >

                  <View
                    style={[
                      styles.progressNodeItem,
                      styles.progressNodeStart,
                    ]}
                  >

                    <View
                      style={[
                        styles.progressNode,
                        progression >= 33 &&
                          styles.progressNodeActive,
                        !progressionActive &&
                          styles.progressNodeInactive,
                      ]}
                    />

                    <Text
                      style={[
                        styles.progressNodeLabel,
                        progression >= 33 &&
                          styles.progressNodeLabelActive,
                      ]}
                    >
                      Planifiée
                    </Text>

                  </View>


                  <View
                    style={[
                      styles.progressNodeItem,
                      styles.progressNodeCenter,
                    ]}
                  >

                    <View
                      style={[
                        styles.progressNode,
                        progression >= 66 &&
                          styles.progressNodeActive,
                        !progressionActive &&
                          styles.progressNodeInactive,
                      ]}
                    />

                    <Text
                      style={[
                        styles.progressNodeLabel,
                        progression >= 66 &&
                          styles.progressNodeLabelActive,
                      ]}
                    >
                      En cours
                    </Text>

                  </View>


                  <View
                    style={[
                      styles.progressNodeItem,
                      styles.progressNodeEnd,
                    ]}
                  >

                    <View
                      style={[
                        styles.progressNode,
                        progression >= 100 &&
                          styles.progressNodeActive,
                        !progressionActive &&
                          styles.progressNodeInactive,
                      ]}
                    />

                    <Text
                      style={[
                        styles.progressNodeLabel,
                        progression >= 100 &&
                          styles.progressNodeLabelActive,
                      ]}
                    >
                      Récoltée
                    </Text>

                  </View>

                </View>

              </View>

            </View>
  );
}
