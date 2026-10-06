/**
 * Section `VueDelimitation` extraite de `CultureDelimiterScreen`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import type { PointGPS } from '@/types';
import type { CulturePolygon } from '@/screens/CultureScreen/CultureDelimiterScreen.helpers';
import { styles } from '@/screens/CultureScreen/CultureDelimiterScreen.styles';
import { router } from 'expo-router';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

type Props = {
  cultureNom: string | undefined;
  culturesExistantes: CulturePolygon[];
  handleAddPointGPS: () => Promise<void>;
  handleFinish: () => Promise<void>;
  handleMapMessage: (event: any) => void;
  loading: boolean;
  mapHtml: string;
  mapKey: number;
  mode: "manuel" | "gps";
  pointsGPS: PointGPS[];
  setMode: Dispatch<SetStateAction<"manuel" | "gps">>;
  superficie: number;
};

export function VueDelimitation({
  cultureNom,
  culturesExistantes,
  handleAddPointGPS,
  handleFinish,
  handleMapMessage,
  loading,
  mapHtml,
  mapKey,
  mode,
  pointsGPS,
  setMode,
  superficie,
}: Props) {
  return (
<View
        style={styles.container}
      >
        <ScrollView
          contentContainerStyle={
            styles.content
          }
        >

          <Text
            style={styles.title}
          >
            Délimiter la culture
          </Text>

          <Text
            style={styles.cultureName}
          >
            {cultureNom ||
              'Culture'}
          </Text>

          <Text
            style={styles.info}
          >
            La culture doit rester
            entièrement à l&apos;intérieur de
            la parcelle et ne doit pas
            toucher ou chevaucher une
            culture existante.
          </Text>

          {/* ================================================= */}
          {/* LÉGENDE */}
          {/* ================================================= */}

          <View
            style={styles.legendContainer}
          >
            <View
              style={styles.legendRow}
            >
              <View
                style={
                  styles.legendParcelle
                }
              />

              <Text
                style={
                  styles.legendText
                }
              >
                Parcelle
              </Text>
            </View>

            <View
              style={styles.legendRow}
            >
              <View
                style={
                  styles.legendCultureExistante
                }
              />

              <Text
                style={
                  styles.legendText
                }
              >
                Cultures existantes
              </Text>
            </View>

            <View
              style={styles.legendRow}
            >
              <View
                style={
                  styles.legendCulture
                }
              />

              <Text
                style={
                  styles.legendText
                }
              >
                Nouvelle culture
              </Text>
            </View>
          </View>

          {/* ================================================= */}
          {/* CULTURES EXISTANTES */}
          {/* ================================================= */}

          <View
            style={
              styles.existingContainer
            }
          >
            <Text
              style={
                styles.existingTitle
              }
            >
              Cultures déjà délimitées
            </Text>

            {culturesExistantes.length ===
            0 ? (
              <Text
                style={
                  styles.noCultureText
                }
              >
                Aucune culture délimitée
                dans cette parcelle.
              </Text>
            ) : (
              culturesExistantes.map(
                (culture) => (
                  <View
                    key={
                      culture.cultureId
                    }
                    style={
                      styles.existingCulture
                    }
                  >
                    <Text
                      style={
                        styles.existingCultureName
                      }
                    >
                      {culture.cultureNom}
                    </Text>

                    <Text
                      style={
                        styles.existingCulturePoints
                      }
                    >
                      {culture.points.length}{' '}
                      points GPS
                    </Text>
                  </View>
                ),
              )
            )}
          </View>

          {/* ================================================= */}
          {/* COMPTEUR */}
          {/* ================================================= */}

          <View
            style={
              styles.counterContainer
            }
          >
            <Text
              style={styles.counter}
            >
              Points de culture :{' '}
              {pointsGPS.length}
            </Text>
          </View>

          {/* ================================================= */}
          {/* SUPERFICIE */}
          {/* ================================================= */}

          <View
            style={
              styles.areaContainer
            }
          >
            <Text
              style={
                styles.areaLabel
              }
            >
              Superficie de la culture
            </Text>

            <Text
              style={
                styles.areaValue
              }
            >
              {superficie.toFixed(2)} m²
            </Text>

            <Text
              style={
                styles.areaHectare
              }
            >
              {(
                superficie / 10000
              ).toFixed(4)} ha
            </Text>
          </View>

          {/* ================================================= */}
          {/* MODE */}
          {/* ================================================= */}

          <View
            style={styles.modeContainer}
          >
            <TouchableOpacity
              style={[
                styles.modeButton,

                mode === 'manuel' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setMode('manuel')
              }
            >
              <Text
                style={[
                  styles.modeText,

                  mode === 'manuel' &&
                    styles.modeTextActive,
                ]}
              >
                📍 MANUEL
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modeButton,

                mode === 'gps' &&
                  styles.modeButtonActive,
              ]}
              onPress={() =>
                setMode('gps')
              }
            >
              <Text
                style={[
                  styles.modeText,

                  mode === 'gps' &&
                    styles.modeTextActive,
                ]}
              >
                🚶 GPS
              </Text>
            </TouchableOpacity>
          </View>

          {/* ================================================= */}
          {/* CARTE */}
          {/* ================================================= */}

          <View
            style={styles.map}
          >
            <WebView
              key={mapKey}
              originWhitelist={[
                '*',
              ]}
              onMessage={
                handleMapMessage
              }
              javaScriptEnabled={
                true
              }
              source={{
                html: mapHtml,
              }}
            />
          </View>

          {/* ================================================= */}
          {/* LISTE DES POINTS */}
          {/* ================================================= */}

          {pointsGPS.map(
            (point) => (
              <View
                key={point.id}
                style={
                  styles.pointCard
                }
              >
                <Text
                  style={
                    styles.pointTitle
                  }
                >
                  P{point.ordre}
                </Text>

                <Text
                  style={
                    styles.coordinate
                  }
                >
                  Latitude :{' '}
                  {point.latitude.toFixed(
                    6,
                  )}
                </Text>

                <Text
                  style={
                    styles.coordinate
                  }
                >
                  Longitude :{' '}
                  {point.longitude.toFixed(
                    6,
                  )}
                </Text>
              </View>
            ),
          )}

          {/* ================================================= */}
          {/* GPS */}
          {/* ================================================= */}

          {mode === 'gps' && (
            <TouchableOpacity
              style={[
                styles.addButton,

                loading &&
                  styles.buttonDisabled,
              ]}
              onPress={
                handleAddPointGPS
              }
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator
                  color="#fff"
                />
              ) : (
                <Text
                  style={
                    styles.addButtonText
                  }
                >
                  AJOUTER UN POINT GPS
                </Text>
              )}
            </TouchableOpacity>
          )}

          {/* ================================================= */}
          {/* TERMINER */}
          {/* ================================================= */}

          <TouchableOpacity
            style={[
              styles.finishButton,

              loading &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleFinish
            }
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                color="#fff"
              />
            ) : (
              <Text
                style={
                  styles.finishButtonText
                }
              >
                TERMINER
              </Text>
            )}
          </TouchableOpacity>

          {/* ================================================= */}
          {/* ANNULER */}
          {/* ================================================= */}

          <TouchableOpacity
            style={
              styles.cancelButton
            }
            onPress={() =>
              router.back()
            }
            disabled={loading}
          >
            <Text
              style={
                styles.cancelText
              }
            >
              Annuler
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </View>
  );
}
