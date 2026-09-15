/* eslint-disable react-hooks/immutability, react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { WebView } from 'react-native-webview';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';
import { getAreaOfPolygon } from 'geolib';
import { useParcelle } from '@/hooks/useParcelles';
import { getCurrentLocation } from '@/services/location';
import { synchronize } from '@/api/sync';
import { updateDelimitation } from '@/api/parcelles';

interface GPSPoint {
  id: string;
  ordre: number;
  latitude: number;
  longitude: number;
}

export default function DelimiterParcelleScreen() {

  const queryClient = useQueryClient();

  const {
  parcelleId,
  nom,
  description,
  typeSol,
  latitude,
  longitude,
  mode: modeParam,
} = useLocalSearchParams<{
  parcelleId?: string;
  nom?: string;
  description?: string;
  typeSol?: string;
  latitude?: string;
  longitude?: string;
  mode?: string;
}>();

const isEditMode = modeParam === 'EDIT';

const {
  data: parcelle,
  isLoading: isLoadingParcelle,
} = useParcelle(
  parcelleId ?? '',
);

  const [pointsGPS, setPointsGPS] = useState<GPSPoint[]>([]);

  const [superficie, setSuperficie] = useState(0);

  const [region, setRegion] = useState({
    latitude: -18.8792,
    longitude: 47.5079,
  });

  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<'manuel' | 'gps'>(
    'manuel',
  );

  useEffect(() => {
  if (
    !isEditMode ||
    !parcelle ||
    !parcelle.pointsGPS
  ) {
    return;
  }

  const anciensPoints = parcelle.pointsGPS.map(
    (point, index) => ({
      id: point.id,
      ordre: point.ordre ?? index + 1,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
    }),
  );

  setPointsGPS(anciensPoints);

  calculerSuperficie(anciensPoints);

  if (anciensPoints.length > 0) {
    setRegion({
      latitude: anciensPoints[0].latitude,
      longitude: anciensPoints[0].longitude,
    });
  }
}, [isEditMode, parcelle]);

  // =====================================================
  // CALCUL SUPERFICIE
  // =====================================================

  const calculerSuperficie = (points: GPSPoint[]) => {
    if (points.length < 3) {
      setSuperficie(0);
      return;
    }

    const coordinates = points.map((point) => ({
      latitude: point.latitude,
      longitude: point.longitude,
    }));

    const area = getAreaOfPolygon(coordinates);

    setSuperficie(area);
  };

  // =====================================================
  // AJOUT POINT GPS
  // =====================================================

  const handleAddPoint = async () => {
    try {
      setLoading(true);

      console.log('PARCELLE ID:', parcelleId);

      const position = await getCurrentLocation();

      setRegion({
        latitude: position.latitude,
        longitude: position.longitude,
      });

      const nouveauPoint: GPSPoint = {
        id: Crypto.randomUUID(),
        ordre: pointsGPS.length + 1,
        latitude: position.latitude,
        longitude: position.longitude,
      };

      setPointsGPS((previousPoints) => {
        const nouveauxPoints = [
          ...previousPoints,
          nouveauPoint,
        ];

        calculerSuperficie(nouveauxPoints);

        return nouveauxPoints;
      });

      Alert.alert(
        'Point ajouté',
        `P${nouveauPoint.ordre} enregistré.`,
      );
    } catch (error: any) {
      console.log('GPS POINT ERROR:', error);

      Alert.alert(
        'Erreur GPS',
        error?.message ||
          'Impossible de récupérer la position.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // TERMINER / SYNCHRONISER
  // =====================================================

const handleFinish = async () => {
  if (pointsGPS.length < 3) {
    Alert.alert(
      'Points insuffisants',
      'Il faut au moins 3 points pour délimiter une parcelle.',
    );
    return;
  }

  try {
    setLoading(true);

    console.log('POINTS GPS:', pointsGPS);
    console.log('SUPERFICIE:', superficie);

    // =================================================
    // MODE EDIT : ENREGISTRER LA NOUVELLE DELIMITATION
    // =================================================

    if (isEditMode) {
      if (!parcelleId) {
        Alert.alert(
          'Erreur',
          'Identifiant de la parcelle introuvable.',
        );
        return;
      }

      const points = pointsGPS.map((point, index) => ({
        latitude: Number(point.latitude),
        longitude: Number(point.longitude),
        ordre: index + 1,
      }));

      console.log(
        'ENVOI DELIMITATION:',
        {
          parcelleId,
          pointsGPS: points,
        },
      );

  await updateDelimitation(
  parcelleId,
  points,
  superficie,
);

// Rafraîchir la parcelle après modification
await queryClient.invalidateQueries({
  queryKey: ['parcelle', parcelleId],
});

// Rafraîchir également la liste des parcelles
await queryClient.invalidateQueries({
  queryKey: ['parcelles'],
});

Alert.alert(
  'Délimitation modifiée',
  `${points.length} points GPS enregistrés.\n\nSuperficie : ${superficie.toFixed(
    2,
  )} m²`,
  [
    {
      text: 'OK',
      onPress: () => {
        router.back();
      },
    },
  ],
);

      return;
    }

    // =================================================
    // MODE CREATION
    // =================================================

    Alert.alert(
      'Délimitation terminée',
      `${pointsGPS.length} points enregistrés.\n\nSuperficie : ${superficie.toFixed(
        2,
      )} m²`,
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace({
              pathname: '/ajout-parcelle',
              params: {
                nom: nom || '',
                description: description || '',
                typeSol: typeSol || '',
                latitude: latitude || '',
                longitude: longitude || '',
                superficie: superficie.toString(),
                pointsGPS: JSON.stringify(pointsGPS),
              },
            });
          },
        },
      ],
    );
  } catch (error: any) {
    console.log(
      'ERREUR DELIMITATION:',
      error?.response?.data || error,
    );

    Alert.alert(
      'Erreur',
      error?.response?.data?.message ||
        'Impossible d’enregistrer la délimitation.',
    );
  } finally {
    setLoading(false);
  }
};

  // =====================================================
  // MESSAGE DEPUIS LA CARTE
  // =====================================================

  const handleMapMessage = (event: any) => {
    try {
      const data = JSON.parse(
        event.nativeEvent.data,
      );

      // =================================================
      // AJOUT MANUEL
      // =================================================

      if (data.type === 'ADD_POINT') {
        const nouveauPoint: GPSPoint = {
          id: Crypto.randomUUID(),
          ordre: pointsGPS.length + 1,
          latitude: data.latitude,
          longitude: data.longitude,
        };

        setPointsGPS((previousPoints) => {
          const nouveauxPoints = [
            ...previousPoints,
            nouveauPoint,
          ];

          calculerSuperficie(nouveauxPoints);

          return nouveauxPoints;
        });

        return;
      }

      // =================================================
// DEPLACEMENT D'UN POINT
// =================================================

if (data.type === 'UPDATE_POINT') {
  setPointsGPS((previousPoints) => {
    const nouveauxPoints = previousPoints.map(
      (point) => {
        if (point.id === data.pointId) {
          return {
            ...point,
            latitude: data.latitude,
            longitude: data.longitude,
          };
        }

        return point;
      },
    );

    calculerSuperficie(nouveauxPoints);

    return nouveauxPoints;
  });

  return;
}

      // =================================================
      // SUPPRESSION
      // =================================================

      if (data.type === 'DELETE_POINT') {
        const point = pointsGPS.find(
          (p) => p.id === data.pointId,
        );

        if (!point) {
          return;
        }

        Alert.alert(
          'Supprimer le point',
          `Voulez-vous supprimer P${point.ordre} ?`,
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: 'Supprimer',
              style: 'destructive',

              onPress: () => {
                setPointsGPS((previousPoints) => {
                  const nouveauxPoints =
                    previousPoints
                      .filter(
                        (p) =>
                          p.id !== data.pointId,
                      )
                      .map((p, index) => ({
                        ...p,
                        ordre: index + 1,
                      }));

                  calculerSuperficie(
                    nouveauxPoints,
                  );

                  return nouveauxPoints;
                });
              },
            },
          ],
        );
      }
    } catch (error) {
      console.log(
        'MAP MESSAGE ERROR:',
        error,
      );
    }
  };

  if (isEditMode && isLoadingParcelle) {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" />

      <Text>
        Chargement de la délimitation...
      </Text>
    </View>
  );
}

  return (

    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        {/* ================================================= */}
        {/* TITRE */}
        {/* ================================================= */}

        <Text style={styles.title}>
          Délimiter la parcelle
        </Text>

        <Text style={styles.info}>
          Touchez la carte pour ajouter les points
          de la parcelle. Vous pouvez également
          utiliser le GPS.
        </Text>

        {/* ================================================= */}
        {/* COMPTEUR */}
        {/* ================================================= */}

        <View style={styles.counterContainer}>
          <Text style={styles.counter}>
            Points enregistrés : {pointsGPS.length}
          </Text>
        </View>

        {/* ================================================= */}
        {/* SUPERFICIE */}
        {/* ================================================= */}

        <View style={styles.areaContainer}>
          <Text style={styles.areaLabel}>
            Superficie calculée
          </Text>

          <Text style={styles.areaValue}>
            {superficie.toFixed(2)} m²
          </Text>

          <Text style={styles.areaHectare}>
            {(superficie / 10000).toFixed(4)} ha
          </Text>
        </View>

        {/* ================================================= */}
        {/* MODE */}
        {/* ================================================= */}

        <View style={styles.modeContainer}>
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

        <View style={styles.map}>
          <WebView
            originWhitelist={['*']}
            onMessage={handleMapMessage}
            source={{
              html: `
<!DOCTYPE html>

<html>

<head>

<meta
  name="viewport"
  content="width=device-width,
  initial-scale=1.0,
  maximum-scale=1.0"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js">
</script>

<style>

html,
body,
#map {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.delete-button {
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 9px 14px;
  font-size: 14px;
  font-weight: bold;
}

.point-label {
  background: #2e7d32;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-weight: bold;
  border: 2px solid white;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const points =
  ${JSON.stringify(pointsGPS)};


// =====================================================
// CARTE
// =====================================================

const map = L.map('map', {

  zoomControl: true,

  scrollWheelZoom: true,

  doubleClickZoom: true,

  touchZoom: true,

  minZoom: 5,

  maxZoom: 22,

}).setView(

  [
    ${region.latitude},
    ${region.longitude}
  ],

  19

);


// =====================================================
// CARTES
// =====================================================

const standard =
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors',

      maxZoom: 19,
    }
  );


const satellite =
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri',

      maxZoom: 19,
    }
  );


standard.addTo(map);


// =====================================================
// CHOIX CARTE
// =====================================================

L.control.layers(

  {
    '🗺️ Standard': standard,

    '🛰️ Satellite': satellite,
  },

  null,

  {
    position: 'topright',
  }

).addTo(map);


// =====================================================
// AJOUT MANUEL
// =====================================================

map.on('click', function(e) {

  window.ReactNativeWebView.postMessage(

    JSON.stringify({

      type: 'ADD_POINT',

      latitude:
        e.latlng.lat,

      longitude:
        e.latlng.lng

    })

  );

});


// =====================================================
// SUPPRESSION
// =====================================================

function deletePoint(pointId) {

  window.ReactNativeWebView.postMessage(

    JSON.stringify({

      type: 'DELETE_POINT',

      pointId: pointId

    })

  );

}


// =====================================================
// AFFICHER LES POINTS
// =====================================================

points.forEach(function(point) {

  const popupContent = \`

    <div
      style="
        text-align: center;
        min-width: 130px;
      "
    >

      <div
        style="
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        "
      >
        P\${point.ordre}
      </div>

      <button
        class="delete-button"
        onclick="
          deletePoint('\${point.id}')
        "
      >
        Supprimer
      </button>

    </div>

  \`;


const marker =
  L.marker(
    [
      point.latitude,
      point.longitude
    ],
    {
      draggable: true
    }
  )
  .addTo(map);


// =====================================================
// DEPLACEMENT DU POINT
// =====================================================

marker.on(
  'dragend',
  function() {

    const position =
      marker.getLatLng();

    window.ReactNativeWebView.postMessage(

      JSON.stringify({

        type: 'UPDATE_POINT',

        pointId: point.id,

        latitude:
          position.lat,

        longitude:
          position.lng

      })

    );

  }
);


  marker.on(
    'click',
    function(e) {

      L.DomEvent
        .stopPropagation(e);

    }
  );


  marker.bindPopup(
    popupContent
  );

});


// =====================================================
// POLYGONE
// =====================================================

if (points.length >= 3) {

  const coordinates =
    points.map(function(point) {

      return [
        point.latitude,
        point.longitude
      ];

    });


  L.polygon(

    coordinates,

    {

      color: '#2e7d32',

      fillColor: '#2e7d32',

      fillOpacity: 0.25,

      weight: 3

    }

  ).addTo(map);

}

</script>

</body>

</html>
              `,
            }}
          />
        </View>

        {/* ================================================= */}
        {/* LISTE DES POINTS */}
        {/* ================================================= */}

        {pointsGPS.map((point) => (
          <View
            key={point.id}
            style={styles.pointCard}
          >
            <Text style={styles.pointTitle}>
              P{point.ordre}
            </Text>

            <Text style={styles.coordinate}>
              Latitude : {point.latitude}
            </Text>

            <Text style={styles.coordinate}>
              Longitude : {point.longitude}
            </Text>
          </View>
        ))}

        {/* ================================================= */}
        {/* BOUTON GPS */}
        {/* ================================================= */}

        {mode === 'gps' && (
          <TouchableOpacity
            style={[
              styles.addButton,
              loading &&
                styles.buttonDisabled,
            ]}
            onPress={handleAddPoint}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>
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
          onPress={handleFinish}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.finishButtonText}>
              TERMINER
            </Text>
          )}
        </TouchableOpacity>

        {/* ================================================= */}
        {/* ANNULER */}
        {/* ================================================= */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>
            Annuler
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  info: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },

  counterContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  counter: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
  },

  areaContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  loadingContainer: {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  gap: 15,
},

  areaLabel: {
    fontSize: 14,
    color: '#666',
  },

  areaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginTop: 5,
  },

  areaHectare: {
    fontSize: 14,
    color: '#555',
    marginTop: 3,
  },

  modeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },

  modeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 8,
    alignItems: 'center',
  },

  modeButtonActive: {
    backgroundColor: '#2e7d32',
  },

  modeText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },

  modeTextActive: {
    color: '#fff',
  },

  map: {
    width: '100%',
    height: 600,
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },

  pointCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  pointTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  coordinate: {
    fontSize: 15,
    marginTop: 3,
    color: '#444',
  },

  addButton: {
    height: 52,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  finishButton: {
    height: 52,
    backgroundColor: '#1565c0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  cancelText: {
    color: '#d32f2f',
    fontSize: 16,
  },

});