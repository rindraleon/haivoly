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
import { Ionicons } from '@expo/vector-icons';

import { useParcelle } from '@/hooks/useParcelles';
import { getCurrentLocation } from '@/services/location';
import { updateDelimitation } from '@/api/parcelles';

interface GPSPoint {
  id: string;
  ordre: number;
  latitude: number;
  longitude: number;
}

const COLORS = {
  background: '#F4F7F1',
  surface: '#FFFFFF',
  primary: '#2E7D32',
  primaryDark: '#1F5B29',
  primarySoft: '#E7F2E5',
  text: '#18321F',
  textSecondary: '#66736A',
  border: '#DDE6DC',
  white: '#FFFFFF',
  danger: '#C62828',
  warning: '#F3A712',
  shadow: '#163A24',
};

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
  } = useParcelle(parcelleId ?? '');

  const [pointsGPS, setPointsGPS] = useState<GPSPoint[]>([]);

  const [superficie, setSuperficie] = useState(0);

  const [region, setRegion] = useState({
    latitude: Number(latitude) || -18.8792,
    longitude: Number(longitude) || 47.5079,
  });

  const [loading, setLoading] = useState(false);

  const [mode, setMode] = useState<'manuel' | 'gps'>('manuel');

  // =====================================================
  // INITIALISATION MODE EDIT
  // =====================================================

  useEffect(() => {
    if (!isEditMode || !parcelle || !parcelle.pointsGPS) {
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
        `P${nouveauPoint.ordre} a été enregistré.`,
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
  // TERMINER
  // =====================================================

  const handleFinish = async () => {
    if (pointsGPS.length < 3) {
      Alert.alert(
        'Délimitation incomplète',
        'Ajoutez au moins 3 points pour former la parcelle.',
      );
      return;
    }

    try {
      setLoading(true);

      // =================================================
      // MODE EDITION
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

        await updateDelimitation(
          parcelleId,
          points,
          superficie,
        );

        await queryClient.invalidateQueries({
          queryKey: ['parcelle', parcelleId],
        });

        await queryClient.invalidateQueries({
          queryKey: ['parcelles'],
        });

        Alert.alert(
          'Délimitation enregistrée',
          `${points.length} points GPS enregistrés.\n\nSuperficie : ${formatAreaM2(
            superficie,
          )}`,
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
        `${pointsGPS.length} points enregistrés.\n\nSuperficie : ${formatAreaM2(
          superficie,
        )}`,
        [
          {
            text: 'Continuer',
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
  // MESSAGE CARTE
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
          latitude: Number(data.latitude),
          longitude: Number(data.longitude),
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
      // DEPLACEMENT
      // =================================================

      if (data.type === 'UPDATE_POINT') {
        setPointsGPS((previousPoints) => {
          const nouveauxPoints = previousPoints.map(
            (point) => {
              if (point.id === data.pointId) {
                return {
                  ...point,
                  latitude: Number(data.latitude),
                  longitude: Number(data.longitude),
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
                        (p) => p.id !== data.pointId,
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

  // =====================================================
  // FORMATAGE
  // =====================================================

  const formatAreaM2 = (value: number) => {
    return `${value.toLocaleString('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} m²`;
  };

  const formatAreaHa = (value: number) => {
    return `${(value / 10000).toLocaleString(
      'fr-FR',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      },
    )} ha`;
  };

  const formatCoordinate = (value: number) => {
    return value.toFixed(6);
  };

  // =====================================================
  // LOADING EDITION
  // =====================================================

  if (isEditMode && isLoadingParcelle) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingIcon}>
          <Ionicons
            name="map-outline"
            size={32}
            color={COLORS.primary}
          />
        </View>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingTitle}>
          Chargement de la délimitation
        </Text>

        <Text style={styles.loadingText}>
          Préparation de votre parcelle...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons
              name="arrow-back"
              size={22}
              color={COLORS.text}
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              Délimiter la parcelle
            </Text>

            <Text
              style={styles.headerSubtitle}
              numberOfLines={1}
            >
              {nom || parcelle?.nom || 'Nouvelle parcelle'}
            </Text>
          </View>

          <View style={styles.headerBadge}>
            <Ionicons
              name="location-outline"
              size={17}
              color={COLORS.primary}
            />
          </View>
        </View>

        {/* ================================================= */}
        {/* INTRO */}
        {/* ================================================= */}

        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons
              name="navigate-outline"
              size={22}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.introContent}>
            <Text style={styles.introTitle}>
              Tracez votre parcelle
            </Text>

            <Text style={styles.introText}>
              Touchez la carte pour placer vos
              points, déplacez-les pour ajuster
              précisément le contour.
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* CARTE */}
        {/* ================================================= */}

        <View style={styles.mapCard}>
          <WebView
            originWhitelist={['*']}
            onMessage={handleMapMessage}
            scrollEnabled={false}
            nestedScrollEnabled
            source={{
              html: `
<!DOCTYPE html>
<html>
<head>
<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
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

body {
  overflow: hidden;
  font-family: Arial, sans-serif;
}

.leaflet-top.leaflet-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  margin-top: 14px;
  margin-right: 12px;
}

.leaflet-top.leaflet-right .leaflet-control {
  margin: 0 !important;
  float: none !important;
  border: none;
  box-shadow: 0 4px 14px rgba(0,0,0,0.14);
}

.leaflet-control-layers {
  border-radius: 14px !important;
  overflow: hidden;
}

.leaflet-control-zoom {
  border: none !important;
}

.leaflet-control-zoom a {
  width: 38px !important;
  height: 38px !important;
  line-height: 38px !important;
  font-size: 20px !important;
  background: rgba(255,255,255,0.96) !important;
  color: #1F5B29 !important;
}

.leaflet-control-layers-expanded {
  padding: 8px 10px !important;
  background: rgba(255,255,255,0.96) !important;
}

.leaflet-control-layers-base label {
  font-size: 13px;
  color: #18321F;
}

.delete-button {
  background: #C62828;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 8px 13px;
  font-size: 13px;
  font-weight: bold;
}

.point-label {
  background: #2E7D32;
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  line-height: 32px;
  text-align: center;
  font-weight: bold;
  border: 3px solid white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.22);
}

</style>
</head>

<body>

<div id="map"></div>

<script>

const points = ${JSON.stringify(pointsGPS)};

const map = L.map('map', {
  zoomControl: false,
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
  ${pointsGPS.length > 0 ? 18 : 17}
);

const standard = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }
);

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles &copy; Esri',
    maxZoom: 19
  }
);

standard.addTo(map);

const layersControl = L.control.layers(
  {
    '🗺️ Standard': standard,
    '🛰️ Satellite': satellite
  },
  null,
  {
    position: 'topright'
  }
);

layersControl.addTo(map);

L.control.zoom({
  position: 'topright'
}).addTo(map);


// =====================================================
// AJOUT MANUEL
// =====================================================

map.on('click', function(e) {

  window.ReactNativeWebView.postMessage(
    JSON.stringify({
      type: 'ADD_POINT',
      latitude: e.latlng.lat,
      longitude: e.latlng.lng
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
// POINTS
// =====================================================

points.forEach(function(point) {

  const popupContent =
    '<div style="text-align:center;min-width:130px;">' +

      '<div style="' +
        'font-size:18px;' +
        'font-weight:bold;' +
        'color:#18321F;' +
        'margin-bottom:10px;' +
      '">' +
        'Point P' + point.ordre +
      '</div>' +

      '<button ' +
        'class="delete-button" ' +
        'onclick="deletePoint(\\'' +
        point.id +
        '\\')" ' +
      '>' +
        'Supprimer' +
      '</button>' +

    '</div>';

  const marker =
    L.marker(
      [
        point.latitude,
        point.longitude
      ],
      {
        draggable: true,
        icon: L.divIcon({
          className: '',
          html:
            '<div class="point-label">' +
            point.ordre +
            '</div>',
          iconSize: [32, 32],
          iconAnchor: [16, 16]
        })
      }
    )
    .addTo(map);


  // ===================================================
  // DEPLACEMENT
  // ===================================================

  marker.on(
    'dragend',
    function() {

      const position =
        marker.getLatLng();

      window.ReactNativeWebView.postMessage(
        JSON.stringify({
          type: 'UPDATE_POINT',
          pointId: point.id,
          latitude: position.lat,
          longitude: position.lng
        })
      );

    }
  );


  marker.on(
    'click',
    function(e) {
      L.DomEvent.stopPropagation(e);
    }
  );


  marker.bindPopup(popupContent);

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
      color: '#2E7D32',
      fillColor: '#6FAA62',
      fillOpacity: 0.24,
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

          {/* ================================================= */}
          {/* BADGE POINTS */}
          {/* ================================================= */}

          <View style={styles.mapPointsBadge}>
            <Ionicons
              name="radio-button-on"
              size={14}
              color={COLORS.primary}
            />

            <Text style={styles.mapPointsText}>
              {pointsGPS.length} point
              {pointsGPS.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* ================================================= */}
          {/* BADGE SURFACE */}
          {/* ================================================= */}

          <View style={styles.mapAreaBadge}>
            <Ionicons
              name="resize-outline"
              size={16}
              color={COLORS.primary}
            />

            <View>
              <Text style={styles.mapAreaLabel}>
                Surface estimée
              </Text>

              <Text style={styles.mapAreaValue}>
                {formatAreaHa(superficie)}
              </Text>
            </View>
          </View>
        </View>

        {/* ================================================= */}
        {/* MODE */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Méthode de délimitation
            </Text>

            <Text style={styles.sectionSubtitle}>
              Choisissez comment placer les points
            </Text>
          </View>
        </View>

        <View style={styles.modeContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.modeButton,
              mode === 'manuel' &&
                styles.modeButtonActive,
            ]}
            onPress={() => setMode('manuel')}
          >
            <View
              style={[
                styles.modeIcon,
                mode === 'manuel' &&
                  styles.modeIconActive,
              ]}
            >
              <Ionicons
                name="hand-left-outline"
                size={20}
                color={
                  mode === 'manuel'
                    ? COLORS.white
                    : COLORS.primary
                }
              />
            </View>

            <View style={styles.modeContent}>
              <Text
                style={[
                  styles.modeTitle,
                  mode === 'manuel' &&
                    styles.modeTitleActive,
                ]}
              >
                Manuel
              </Text>

              <Text
                style={[
                  styles.modeDescription,
                  mode === 'manuel' &&
                    styles.modeDescriptionActive,
                ]}
              >
                Touchez la carte
              </Text>
            </View>

            {mode === 'manuel' && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.white}
              />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.modeButton,
              mode === 'gps' &&
                styles.modeButtonActive,
            ]}
            onPress={() => setMode('gps')}
          >
            <View
              style={[
                styles.modeIcon,
                mode === 'gps' &&
                  styles.modeIconActive,
              ]}
            >
              <Ionicons
                name="navigate-outline"
                size={20}
                color={
                  mode === 'gps'
                    ? COLORS.white
                    : COLORS.primary
                }
              />
            </View>

            <View style={styles.modeContent}>
              <Text
                style={[
                  styles.modeTitle,
                  mode === 'gps' &&
                    styles.modeTitleActive,
                ]}
              >
                GPS
              </Text>

              <Text
                style={[
                  styles.modeDescription,
                  mode === 'gps' &&
                    styles.modeDescriptionActive,
                ]}
              >
                Utiliser ma position
              </Text>
            </View>

            {mode === 'gps' && (
              <Ionicons
                name="checkmark-circle"
                size={22}
                color={COLORS.white}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* ================================================= */}
        {/* ACTION GPS */}
        {/* ================================================= */}

        {mode === 'gps' && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.gpsButton,
              loading && styles.buttonDisabled,
            ]}
            onPress={handleAddPoint}
            disabled={loading}
          >
            <View style={styles.gpsButtonIcon}>
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                />
              ) : (
                <Ionicons
                  name="locate-outline"
                  size={21}
                  color={COLORS.primary}
                />
              )}
            </View>

            <View style={styles.gpsButtonContent}>
              <Text style={styles.gpsButtonTitle}>
                Ajouter ma position
              </Text>

              <Text style={styles.gpsButtonSubtitle}>
                Enregistrer un nouveau point GPS
              </Text>
            </View>

            {!loading && (
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.primary}
              />
            )}
          </TouchableOpacity>
        )}

        {/* ================================================= */}
        {/* SURFACE */}
        {/* ================================================= */}

        <View style={styles.areaCard}>
          <View style={styles.areaIcon}>
            <Ionicons
              name="analytics-outline"
              size={23}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.areaContent}>
            <Text style={styles.areaTitle}>
              Superficie calculée
            </Text>

            <Text style={styles.areaValue}>
              {formatAreaHa(superficie)}
            </Text>

            <Text style={styles.areaSecondary}>
              {formatAreaM2(superficie)}
            </Text>
          </View>

          <View
            style={[
              styles.areaStatus,
              pointsGPS.length >= 3
                ? styles.areaStatusValid
                : styles.areaStatusPending,
            ]}
          >
            <Ionicons
              name={
                pointsGPS.length >= 3
                  ? 'checkmark-circle'
                  : 'time-outline'
              }
              size={16}
              color={
                pointsGPS.length >= 3
                  ? COLORS.primary
                  : COLORS.warning
              }
            />

            <Text
              style={[
                styles.areaStatusText,
                pointsGPS.length >= 3
                  ? styles.areaStatusTextValid
                  : styles.areaStatusTextPending,
              ]}
            >
              {pointsGPS.length >= 3
                ? 'Calculée'
                : 'En attente'}
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* LISTE POINTS */}
        {/* ================================================= */}

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Points de délimitation
            </Text>

            <Text style={styles.sectionSubtitle}>
              {pointsGPS.length >= 3
                ? 'Contour prêt à être enregistré'
                : `Encore ${
                    3 - pointsGPS.length
                  } point${
                    3 - pointsGPS.length > 1
                      ? 's'
                      : ''
                  } minimum`}
            </Text>
          </View>

          <View style={styles.countBadge}>
            <Text style={styles.countBadgeText}>
              {pointsGPS.length}
            </Text>
          </View>
        </View>

        {pointsGPS.length === 0 ? (
          <View style={styles.emptyPointsCard}>
            <View style={styles.emptyIcon}>
              <Ionicons
                name="location-outline"
                size={28}
                color={COLORS.primary}
              />
            </View>

            <Text style={styles.emptyTitle}>
              Aucun point enregistré
            </Text>

            <Text style={styles.emptyText}>
              Touchez la carte ou utilisez le GPS
              pour commencer la délimitation.
            </Text>
          </View>
        ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={
              styles.pointsHorizontalContent
            }
          >
            {pointsGPS.map((point) => (
              <View
                key={point.id}
                style={styles.pointMiniCard}
              >
                <View style={styles.pointMiniHeader}>
                  <View style={styles.pointNumber}>
                    <Text style={styles.pointNumberText}>
                      {point.ordre}
                    </Text>
                  </View>

                  <Text style={styles.pointMiniTitle}>
                    Point P{point.ordre}
                  </Text>
                </View>

                <Text style={styles.pointCoordinate}>
                  {formatCoordinate(point.latitude)}
                </Text>

                <Text style={styles.pointCoordinate}>
                  {formatCoordinate(point.longitude)}
                </Text>
              </View>
            ))}
          </ScrollView>
        )}

        {/* ================================================= */}
        {/* GUIDE */}
        {/* ================================================= */}

        <View style={styles.tipCard}>
          <View style={styles.tipIcon}>
            <Ionicons
              name="information-circle-outline"
              size={21}
              color={COLORS.primary}
            />
          </View>

          <View style={styles.tipContent}>
            <Text style={styles.tipTitle}>
              Astuce
            </Text>

            <Text style={styles.tipText}>
              Vous pouvez déplacer un point
              directement sur la carte pour
              ajuster la frontière.
            </Text>
          </View>
        </View>

        {/* ================================================= */}
        {/* TERMINER */}
        {/* ================================================= */}

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.finishButton,
            (loading ||
              pointsGPS.length < 3) &&
              styles.finishButtonDisabled,
          ]}
          onPress={handleFinish}
          disabled={
            loading || pointsGPS.length < 3
          }
        >
          {loading ? (
            <ActivityIndicator
              color={COLORS.white}
            />
          ) : (
            <>
              <View style={styles.finishIcon}>
                <Ionicons
                  name="checkmark"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.finishContent}>
                <Text style={styles.finishTitle}>
                  Terminer la délimitation
                </Text>

                <Text style={styles.finishSubtitle}>
                  {pointsGPS.length} points •{' '}
                  {formatAreaHa(superficie)}
                </Text>
              </View>

              <Ionicons
                name="arrow-forward"
                size={21}
                color={COLORS.white}
              />
            </>
          )}
        </TouchableOpacity>

        {/* ================================================= */}
        {/* ANNULER */}
        {/* ================================================= */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Ionicons
            name="close-outline"
            size={18}
            color={COLORS.textSecondary}
          />

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
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // =====================================================
  // LOADING
  // =====================================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 30,
  },

  loadingIcon: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },

  loadingTitle: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },

  loadingText: {
    marginTop: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // HEADER
  // =====================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    marginBottom: 12,
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  headerCenter: {
    flex: 1,
    paddingHorizontal: 12,
  },

  headerTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  headerBadge: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // =====================================================
  // INTRO
  // =====================================================

  introCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  introIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  introContent: {
    flex: 1,
  },

  introTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 3,
  },

  introText: {
    fontSize: 13,
    lineHeight: 19,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // MAP
  // =====================================================

  mapCard: {
    height: 430,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#DDE8D7',
    position: 'relative',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  mapPointsBadge: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14,
    paddingHorizontal: 11,
    paddingVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },

  mapPointsText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  mapAreaBadge: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 4,
  },

  mapAreaLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
  },

  mapAreaValue: {
    marginTop: 1,
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.text,
  },

  // =====================================================
  // SECTIONS
  // =====================================================

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  sectionSubtitle: {
    marginTop: 3,
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // MODE
  // =====================================================

  modeContainer: {
    flexDirection: 'row',
    marginBottom: 14,
  },

  modeButton: {
    flex: 1,
    minHeight: 78,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginRight: 8,
  },

  modeButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  modeIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  modeIconActive: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },

  modeContent: {
    flex: 1,
  },

  modeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  modeTitleActive: {
    color: COLORS.white,
  },

  modeDescription: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  modeDescriptionActive: {
    color: 'rgba(255,255,255,0.78)',
  },

  // =====================================================
  // GPS
  // =====================================================

  gpsButton: {
    minHeight: 66,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: '#CDE0CA',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 14,
  },

  gpsButtonIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  gpsButtonContent: {
    flex: 1,
  },

  gpsButtonTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  gpsButtonSubtitle: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // AREA
  // =====================================================

  areaCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    alignItems: 'center',
  },

  areaIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  areaContent: {
    flex: 1,
  },

  areaTitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },

  areaValue: {
    marginTop: 2,
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.text,
  },

  areaSecondary: {
    marginTop: 1,
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  areaStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 12,
  },

  areaStatusValid: {
    backgroundColor: COLORS.primarySoft,
  },

  areaStatusPending: {
    backgroundColor: '#FFF4D9',
  },

  areaStatusText: {
    marginLeft: 5,
    fontSize: 10,
    fontWeight: '800',
  },

  areaStatusTextValid: {
    color: COLORS.primary,
  },

  areaStatusTextPending: {
    color: '#9A6B00',
  },

  // =====================================================
  // POINTS
  // =====================================================

  countBadge: {
    minWidth: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
  },

  countBadgeText: {
    fontSize: 12,
    fontWeight: '900',
    color: COLORS.primary,
  },

  pointsHorizontalContent: {
    paddingBottom: 4,
    paddingRight: 8,
  },

  pointMiniCard: {
    width: 145,
    backgroundColor: COLORS.surface,
    borderRadius: 17,
    padding: 13,
    marginRight: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  pointMiniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  pointNumber: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  pointNumberText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '900',
  },

  pointMiniTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  pointCoordinate: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
  },

  emptyPointsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 25,
    marginBottom: 14,
  },

  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: COLORS.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  emptyText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 12,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // ASTUCE
  // =====================================================

  tipCard: {
    flexDirection: 'row',
    backgroundColor: '#EEF5EA',
    borderRadius: 17,
    padding: 13,
    marginTop: 16,
    marginBottom: 18,
  },

  tipIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.text,
  },

  tipText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 17,
    color: COLORS.textSecondary,
  },

  // =====================================================
  // FINISH
  // =====================================================

  finishButton: {
    minHeight: 68,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  finishButtonDisabled: {
    opacity: 0.45,
  },

  finishIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  finishContent: {
    flex: 1,
  },

  finishTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '900',
  },

  finishSubtitle: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    marginTop: 3,
  },

  cancelButton: {
    minHeight: 46,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },

  cancelText: {
    marginLeft: 4,
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },

  buttonDisabled: {
    opacity: 0.65,
  },
});