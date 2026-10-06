/**
 * CultureDelimiterScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
/* eslint-disable react-hooks/set-state-in-effect, react-hooks/immutability, react/no-unescaped-entities */
import { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import * as Crypto from 'expo-crypto';
import { getAreaOfPolygon } from 'geolib';

import { useParcelle } from '@/hooks';

import type { PointGPS } from '@/types';

import { getCurrentLocation , culturesApi } from '@/services';

import { styles } from './CultureDelimiterScreen.styles';

import { VueDelimitation } from '@/components/CultureComponent/VueDelimitation';
import {
  pointDansPolygone,
  polygonsSeChevauchent,
  type CulturePolygon,
} from '@/screens/CultureScreen/CultureDelimiterScreen.helpers';
import { asItems } from '@/utils/api';
import { logger } from '@/utils/logger';

interface ParcelleGPSPoint {
  id?: string;
  ordre?: number;
  latitude: number;
  longitude: number;
}

export default function DelimiterCultureScreen() {
  // =====================================================
  // PARAMÈTRES
  // =====================================================

  const {
    parcelleId,
    cultureId,
    cultureNom,
  } = useLocalSearchParams<{
    parcelleId?: string;
    cultureId?: string;
    cultureNom?: string;
  }>();

  // =====================================================
  // PARCELLE
  // =====================================================

  const {
    data: parcelle,
    isLoading: isLoadingParcelle,
    isError: isErrorParcelle,
  } = useParcelle(parcelleId ?? '');

  // =====================================================
  // ÉTATS
  // =====================================================

  const [pointsGPS, setPointsGPS] = useState<PointGPS[]>(
    [],
  );

  const [pointsParcelle, setPointsParcelle] = useState<
    ParcelleGPSPoint[]
  >([]);

  const [culturesExistantes, setCulturesExistantes] =
    useState<CulturePolygon[]>([]);

  const [superficie, setSuperficie] =
    useState<number>(0);

  const [loading, setLoading] =
    useState<boolean>(false);

  const [loadingCulture, setLoadingCulture] =
    useState<boolean>(true);

  const [mode, setMode] = useState<
    'manuel' | 'gps'
  >('manuel');

  const [region, setRegion] = useState({
    latitude: -18.8792,
    longitude: 47.5079,
  });

  const [mapKey, setMapKey] = useState(0);

  // =====================================================
  // RÉCUPÉRER LES POINTS DE LA PARCELLE
  // =====================================================

  useEffect(() => {
    if (!parcelle) {
      return;
    }

    if (!parcelle.pointsGPS) {
      setPointsParcelle([]);
      return;
    }

    const anciensPoints: ParcelleGPSPoint[] =
      parcelle.pointsGPS.map(
        (point: any, index: number) => ({
          id: point.id,
          ordre: point.ordre ?? index + 1,
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        }),
      );

    setPointsParcelle(anciensPoints);

    if (anciensPoints.length > 0) {
      setRegion({
        latitude: anciensPoints[0].latitude,
        longitude: anciensPoints[0].longitude,
      });
    }
  }, [parcelle]);

  // =====================================================
  // RÉCUPÉRER LA CULTURE ACTUELLE
  // + LES CULTURES EXISTANTES
  // =====================================================

  useEffect(() => {
    const chargerDonnees = async () => {
      if (!parcelleId || !cultureId) {
        setLoadingCulture(false);
        return;
      }

      try {
        setLoadingCulture(true);

        // ================================================
        // CULTURE ACTUELLE
        // ================================================

        const points =
          await culturesApi.pointsGPS(
            parcelleId,
            cultureId,
          );

        const nouveauxPoints: PointGPS[] =
          points.map(
            (
              point: PointGPS,
              index: number,
            ) => ({
              id:
                point.id ??
                Crypto.randomUUID(),

              ordre:
                point.ordre ??
                index + 1,

              latitude:
                Number(point.latitude),

              longitude:
                Number(point.longitude),
            }),
          );

        setPointsGPS(nouveauxPoints);

        calculerSuperficie(
          nouveauxPoints,
        );

        // ================================================
        // RÉCUPÉRER TOUTES LES CULTURES
        // ================================================

        const cultures =
          await culturesApi.listByParcelle(parcelleId, { limit: 200 }).then(asItems);

        const autresCultures =
          cultures.filter(
            (culture) =>
              culture.id !== cultureId &&
              culture.statut !== 'SUPPRIMEE',
          );

        // ================================================
        // RÉCUPÉRER LES POINTS DE CHAQUE CULTURE
        // ================================================

        const polygons: CulturePolygon[] = [];

        for (
          const culture of autresCultures
        ) {
          try {
            const culturePoints =
              await culturesApi.pointsGPS(
                parcelleId,
                culture.id,
              );

            const polygonPoints: PointGPS[] =
              culturePoints.map(
                (
                  point,
                  index,
                ) => ({
                  id:
                    point.id ??
                    Crypto.randomUUID(),

                  ordre:
                    point.ordre ??
                    index + 1,

                  latitude:
                    Number(
                      point.latitude,
                    ),

                  longitude:
                    Number(
                      point.longitude,
                    ),
                }),
              );

            // Seules les cultures PLANIFIEE et EN_COURS
// occupent actuellement une zone.
if (
  culture.statut !== 'PLANIFIEE' &&
  culture.statut !== 'EN_COURS'
) {
  continue;
}

if (
  polygonPoints.length >= 3
) {
  polygons.push({
    cultureId:
      culture.id,

    cultureNom:
      culture.nom,

    points:
      polygonPoints,
  });
}
          } catch (error) {
            logger.debug('CultureDelimiterScreen', 
              `ERREUR POINTS CULTURE ${culture.id}:`,
              error,
            );
          }
        }

        setCulturesExistantes(
          polygons,
        );
      } catch (error: any) {
        logger.debug('CultureDelimiterScreen', 
          'ERREUR CHARGEMENT CULTURES:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          'Impossible de récupérer les délimitations des cultures.',
        );
      } finally {
        setLoadingCulture(false);
      }
    };

    chargerDonnees();
  }, [parcelleId, cultureId]);

  // =====================================================
  // CALCUL SUPERFICIE
  // =====================================================

  const calculerSuperficie = (
    points: PointGPS[],
  ) => {
    if (points.length < 3) {
      setSuperficie(0);
      return;
    }

    const coordinates =
      points.map((point) => ({
        latitude:
          point.latitude,
        longitude:
          point.longitude,
      }));

    try {
      const area =
        getAreaOfPolygon(
          coordinates,
        );

      setSuperficie(area);
    } catch (error) {
      logger.debug('CultureDelimiterScreen', 
        'ERREUR CALCUL SUPERFICIE:',
        error,
      );

      setSuperficie(0);
    }
  };

  // =====================================================
  // POINT DANS POLYGONE
  // =====================================================

  // =====================================================
  // POINT DANS PARCELLE
  // =====================================================

  const pointDansParcelle = (
    latitude: number,
    longitude: number,
  ): boolean => {
    return pointDansPolygone(
      latitude,
      longitude,
      pointsParcelle,
    );
  };

  // =====================================================
  // POINT DANS UNE CULTURE EXISTANTE
  // =====================================================

  const pointDansCultureExistante = (
    latitude: number,
    longitude: number,
  ): CulturePolygon | null => {
    for (
      const culture of culturesExistantes
    ) {
      if (
        pointDansPolygone(
          latitude,
          longitude,
          culture.points,
        )
      ) {
        return culture;
      }
    }

    return null;
  };

  // =====================================================
  // ORIENTATION
  // =====================================================

  // =====================================================
  // POINT SUR SEGMENT
  // =====================================================

  // =====================================================
  // SEGMENTS QUI SE TOUCHENT
  // =====================================================

  // =====================================================
  // POLYGONES SE TOUCHENT OU SE CHEVAUCHENT
  // =====================================================

  // =====================================================
  // VÉRIFIER UN POINT
  // =====================================================

  const verifierPointAutorise = (
    latitude: number,
    longitude: number,
  ): boolean => {
    // ================================================
    // PARCELLE
    // ================================================

    if (
      !pointDansParcelle(
        latitude,
        longitude,
      )
    ) {
      Alert.alert(
        'Point interdit',
        'Le point doit obligatoirement être à l’intérieur de la parcelle.',
      );

      return false;
    }

    // ================================================
    // CULTURES EXISTANTES
    // ================================================

    const culture =
      pointDansCultureExistante(
        latitude,
        longitude,
      );

    if (culture) {
      Alert.alert(
        'Zone déjà occupée',
        `Impossible d'ajouter ce point : cette zone est déjà occupée par la culture "${culture.cultureNom}".`,
      );

      return false;
    }

    return true;
  };

  // =====================================================
  // AJOUT POINT GPS
  // =====================================================

  const handleAddPointGPS = async () => {
    try {
      setLoading(true);

      if (
        pointsParcelle.length < 3
      ) {
        Alert.alert(
          'Parcelle non délimitée',
          'La parcelle doit avoir au moins 3 points GPS.',
        );

        return;
      }

      const position =
        await getCurrentLocation();

      if (
        !verifierPointAutorise(
          position.latitude,
          position.longitude,
        )
      ) {
        return;
      }

      const nouveauPoint: PointGPS = {
        id: Crypto.randomUUID(),

        ordre:
          pointsGPS.length + 1,

        latitude:
          position.latitude,

        longitude:
          position.longitude,
      };

      setRegion({
        latitude:
          position.latitude,

        longitude:
          position.longitude,
      });

      setPointsGPS(
        (previousPoints) => {
          const nouveauxPoints = [
            ...previousPoints,
            nouveauPoint,
          ];

          calculerSuperficie(
            nouveauxPoints,
          );

          return nouveauxPoints;
        },
      );

      setMapKey(
        (previous) =>
          previous + 1,
      );

      Alert.alert(
        'Point ajouté',
        `P${nouveauPoint.ordre} enregistré.`,
      );
    } catch (error: any) {
      logger.debug('CultureDelimiterScreen', 
        'ERREUR GPS CULTURE:',
        error?.response?.data ||
          error,
      );

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
  // MESSAGE WEBVIEW
  // =====================================================

  const handleMapMessage = (
    event: any,
  ) => {
    try {
      const data =
        JSON.parse(
          event.nativeEvent.data,
        );

      // ================================================
      // AJOUT MANUEL
      // ================================================

      if (
        data.type ===
        'ADD_POINT'
      ) {
        const latitude =
          Number(data.latitude);

        const longitude =
          Number(data.longitude);

        if (
          !verifierPointAutorise(
            latitude,
            longitude,
          )
        ) {
          return;
        }

        const nouveauPoint: PointGPS =
          {
            id: Crypto.randomUUID(),

            ordre:
              pointsGPS.length + 1,

            latitude,

            longitude,
          };

        setPointsGPS(
          (previousPoints) => {
            const nouveauxPoints =
              [
                ...previousPoints,
                nouveauPoint,
              ];

            calculerSuperficie(
              nouveauxPoints,
            );

            return nouveauxPoints;
          },
        );

        return;
      }

      // ================================================
      // DÉPLACEMENT
      // ================================================

      if (
        data.type ===
        'UPDATE_POINT'
      ) {
        const latitude =
          Number(data.latitude);

        const longitude =
          Number(data.longitude);

        if (
          !verifierPointAutorise(
            latitude,
            longitude,
          )
        ) {
          setMapKey(
            (previous) =>
              previous + 1,
          );

          return;
        }

        setPointsGPS(
          (previousPoints) => {
            const nouveauxPoints =
              previousPoints.map(
                (point) => {
                  if (
                    point.id ===
                    data.pointId
                  ) {
                    return {
                      ...point,
                      latitude,
                      longitude,
                    };
                  }

                  return point;
                },
              );

            calculerSuperficie(
              nouveauxPoints,
            );

            return nouveauxPoints;
          },
        );

        return;
      }

      // ================================================
      // SUPPRESSION
      // ================================================

      if (
        data.type ===
        'DELETE_POINT'
      ) {
        const point =
          pointsGPS.find(
            (p) =>
              p.id ===
              data.pointId,
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
                setPointsGPS(
                  (
                    previousPoints,
                  ) => {
                    const nouveauxPoints =
                      previousPoints
                        .filter(
                          (p) =>
                            p.id !==
                            data.pointId,
                        )
                        .map(
                          (
                            p,
                            index,
                          ) => ({
                            ...p,
                            ordre:
                              index + 1,
                          }),
                        );

                    calculerSuperficie(
                      nouveauxPoints,
                    );

                    return nouveauxPoints;
                  },
                );

                setMapKey(
                  (previous) =>
                    previous + 1,
                );
              },
            },
          ],
        );
      }
    } catch (error) {
      logger.debug('CultureDelimiterScreen', 
        'MAP MESSAGE ERROR:',
        error,
      );
    }
  };

  // =====================================================
  // VÉRIFICATION FINALE
  // =====================================================

  const verifierTracageFinal =
    (): boolean => {
      if (
        pointsParcelle.length <
        3
      ) {
        Alert.alert(
          'Parcelle invalide',
          'La parcelle doit avoir au moins 3 points GPS.',
        );

        return false;
      }

      if (
        pointsGPS.length < 3
      ) {
        Alert.alert(
          'Points insuffisants',
          'Il faut au moins 3 points pour délimiter une culture.',
        );

        return false;
      }

      // ================================================
      // TOUS LES POINTS DANS LA PARCELLE
      // ================================================

      for (
        const point of pointsGPS
      ) {
        if (
          !pointDansParcelle(
            point.latitude,
            point.longitude,
          )
        ) {
          Alert.alert(
            'Tracé invalide',
            `Le point P${point.ordre} se trouve à l’extérieur de la parcelle.`,
          );

          return false;
        }
      }

      // ================================================
      // CULTURE ACTUELLE VS CULTURES EXISTANTES
      // ================================================

      for (
        const culture of culturesExistantes
      ) {
        if (
          polygonsSeChevauchent(
            pointsGPS,
            culture.points,
          )
        ) {
          Alert.alert(
            'Zone déjà occupée',
            `La nouvelle culture touche ou chevauche la culture "${culture.cultureNom}".\n\nVeuillez modifier le tracé.`,
          );

          return false;
        }
      }

      return true;
    };

  // =====================================================
  // TERMINER
  // =====================================================

  const handleFinish = async () => {
    if (!parcelleId) {
      Alert.alert(
        'Erreur',
        'Identifiant de la parcelle introuvable.',
      );

      return;
    }

    if (!cultureId) {
      Alert.alert(
        'Erreur',
        'Identifiant de la culture introuvable.',
      );

      return;
    }

    if (
      !verifierTracageFinal()
    ) {
      return;
    }

    try {
      setLoading(true);

      const points =
        pointsGPS.map(
          (point, index) => ({
            latitude:
              Number(
                point.latitude,
              ),

            longitude:
              Number(
                point.longitude,
              ),

            ordre:
              index + 1,
          }),
        );

      logger.debug('CultureDelimiterScreen', 
        'SAUVEGARDE CULTURE:',
        {
          parcelleId,
          cultureId,
          points,
        },
      );

      await culturesApi.savePointsGPS(
        parcelleId,
        cultureId,
        points,
      );

      Alert.alert(
        'Délimitation enregistrée',
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
    } catch (error: any) {
      logger.debug('CultureDelimiterScreen', 
        'ERREUR SAUVEGARDE CULTURE:',
        error?.response?.data ||
          error,
      );

      Alert.alert(
        'Erreur',
        error?.response?.data
          ?.message ||
          'Impossible d’enregistrer la délimitation de la culture.',
      );
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (
    isLoadingParcelle ||
    loadingCulture
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
        />

        <Text>
          Chargement de la parcelle
          et des cultures...
        </Text>
      </View>
    );
  }

  // =====================================================
  // ERREUR PARCELLE
  // =====================================================

  if (
    isErrorParcelle ||
    !parcelle
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.errorText
          }
        >
          Impossible de récupérer la parcelle.
        </Text>

        <TouchableOpacity
          style={
            styles.cancelButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.cancelText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // PARCELLE NON DÉLIMITÉE
  // =====================================================

  if (
    pointsParcelle.length <
    3
  ) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <Text
          style={
            styles.errorText
          }
        >
          La parcelle n'est pas suffisamment délimitée.
        </Text>

        <Text
          style={
            styles.errorDescription
          }
        >
          Il faut au moins 3 points GPS
          pour pouvoir délimiter une
          culture.
        </Text>

        <TouchableOpacity
          style={
            styles.cancelButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.cancelText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // =====================================================
  // HTML LEAFLET
  // =====================================================

  const mapHtml = `
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

.point-label-culture {
  background: #1565c0;
  color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  line-height: 30px;
  text-align: center;
  font-weight: bold;
  border: 2px solid white;
}

.point-label-existante {
  background: #f57c00;
  color: white;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  line-height: 26px;
  text-align: center;
  font-weight: bold;
  border: 2px solid white;
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

</style>

</head>

<body>

<div id="map"></div>

<script>

const parcellePoints =
  ${JSON.stringify(pointsParcelle)};

const culturePoints =
  ${JSON.stringify(pointsGPS)};

const culturesExistantes =
  ${JSON.stringify(culturesExistantes)};

// =====================================================
// POINT DANS POLYGONE
// =====================================================

function pointInPolygon(
  latitude,
  longitude,
  polygon
) {

  let inside = false;

  for (
    let i = 0,
    j = polygon.length - 1;

    i < polygon.length;

    j = i++
  ) {

    const xi =
      Number(
        polygon[i].latitude
      );

    const yi =
      Number(
        polygon[i].longitude
      );

    const xj =
      Number(
        polygon[j].latitude
      );

    const yj =
      Number(
        polygon[j].longitude
      );

    const intersect =
      yi > longitude !==
        yj > longitude &&
      latitude <
        ((xj - xi) *
          (longitude - yi)) /
          (yj - yi) +
          xi;

    if (intersect) {
      inside = !inside;
    }

  }

  return inside;
}

// =====================================================
// CARTE
// =====================================================

const map =
  L.map('map', {

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
// PARCELLE
// =====================================================

const parcelleCoordinates =
  parcellePoints.map(
    function(point) {

      return [
        Number(point.latitude),
        Number(point.longitude)
      ];

    }
  );

const parcellePolygon =
  L.polygon(

    parcelleCoordinates,

    {

      color: '#2e7d32',

      fillColor: '#2e7d32',

      fillOpacity: 0.08,

      weight: 4,

    }

  ).addTo(map);

// =====================================================
// CULTURES EXISTANTES
// =====================================================

culturesExistantes.forEach(
  function(culture) {

    const coordinates =
      culture.points.map(
        function(point) {

          return [
            Number(point.latitude),
            Number(point.longitude)
          ];

        }
      );

    if (
      coordinates.length >= 3
    ) {

      const polygon =
        L.polygon(

          coordinates,

          {

            color: '#f57c00',

            fillColor: '#f57c00',

            fillOpacity: 0.35,

            weight: 3,

          }

        ).addTo(map);

      polygon.bindPopup(
        '<b>Culture existante</b><br>' +
        culture.cultureNom
      );

    }

    // ================================================
    // POINTS DES CULTURES EXISTANTES
    // ================================================

    culture.points.forEach(
      function(point) {

        L.marker(

          [
            Number(point.latitude),
            Number(point.longitude)
          ],

          {

            draggable: false,

            icon:
              L.divIcon({

                className:
                  'point-label-existante',

                html:
                  'P' +
                  point.ordre,

                iconSize:
                  [26, 26],

                iconAnchor:
                  [13, 13],

              })

          }

        )
        .addTo(map)
        .bindPopup(
          '<b>' +
          culture.cultureNom +
          '</b><br>P' +
          point.ordre
        );

      }
    );

  }
);

// =====================================================
// POLYGONE CULTURE ACTUELLE
// =====================================================

if (
  culturePoints.length >= 3
) {

  const cultureCoordinates =
    culturePoints.map(
      function(point) {

        return [

          Number(
            point.latitude
          ),

          Number(
            point.longitude
          )

        ];

      }
    );

  L.polygon(

    cultureCoordinates,

    {

      color: '#1565c0',

      fillColor: '#1565c0',

      fillOpacity: 0.35,

      weight: 3,

    }

  ).addTo(map);

}

// =====================================================
// AJOUT MANUEL
// =====================================================

map.on(
  'click',
  function(e) {

    const autorise =
      pointInPolygon(
        e.latlng.lat,
        e.latlng.lng,
        parcellePoints
      );

    if (!autorise) {

      alert(
        'Ce point est à l’extérieur de la parcelle.'
      );

      return;
    }

    // ==============================================
    // VÉRIFIER CULTURES EXISTANTES
    // ==============================================

    for (
      const culture of culturesExistantes
    ) {

      const interdit =
        pointInPolygon(
          e.latlng.lat,
          e.latlng.lng,
          culture.points
        );

      if (interdit) {

        alert(
          'Cette zone est déjà occupée par la culture "' +
          culture.cultureNom +
          '".'
        );

        return;
      }

    }

    window.ReactNativeWebView.postMessage(

      JSON.stringify({

        type: 'ADD_POINT',

        latitude:
          e.latlng.lat,

        longitude:
          e.latlng.lng

      })

    );

  }
);

// =====================================================
// SUPPRESSION
// =====================================================

function deletePoint(
  pointId
) {

  window.ReactNativeWebView.postMessage(

    JSON.stringify({

      type:
        'DELETE_POINT',

      pointId

    })

  );

}

// =====================================================
// POINTS CULTURE ACTUELLE
// =====================================================

culturePoints.forEach(
  function(point) {

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
          Number(
            point.latitude
          ),

          Number(
            point.longitude
          )
        ],

        {

          draggable: true,

          icon:
            L.divIcon({

              className:
                'point-label-culture',

              html:
                'P' +
                point.ordre,

              iconSize:
                [30, 30],

              iconAnchor:
                [15, 15],

            })

        }

      ).addTo(map);

    // ================================================
    // DÉPLACEMENT
    // ================================================

    marker.on(
      'dragend',
      function() {

        const position =
          marker.getLatLng();

        const dansParcelle =
          pointInPolygon(

            position.lat,

            position.lng,

            parcellePoints

          );

        if (!dansParcelle) {

          alert(
            'Le point doit rester à l’intérieur de la parcelle.'
          );

          window.ReactNativeWebView.postMessage(

            JSON.stringify({

              type:
                'INVALID_POINT',

              pointId:
                point.id

            })

          );

          return;
        }

        // ==============================================
        // CULTURES EXISTANTES
        // ==============================================

        for (
          const culture of culturesExistantes
        ) {

          if (
            pointInPolygon(
              position.lat,
              position.lng,
              culture.points
            )
          ) {

            alert(
              'Le point ne peut pas être placé dans la culture "' +
              culture.cultureNom +
              '".'
            );

            window.ReactNativeWebView.postMessage(

              JSON.stringify({

                type:
                  'INVALID_POINT',

                pointId:
                  point.id

              })

            );

            return;
          }

        }

        window.ReactNativeWebView.postMessage(

          JSON.stringify({

            type:
              'UPDATE_POINT',

            pointId:
              point.id,

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

  }
);

// =====================================================
// AJUSTEMENT CARTE
// =====================================================

if (
  parcelleCoordinates.length >= 3
) {

  map.fitBounds(
    parcellePolygon.getBounds(),
    {
      padding: [20, 20]
    }
  );

}

</script>

</body>

</html>
`;

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (
    <VueDelimitation
      cultureNom={cultureNom}
      culturesExistantes={culturesExistantes}
      handleAddPointGPS={handleAddPointGPS}
      handleFinish={handleFinish}
      handleMapMessage={handleMapMessage}
      loading={loading}
      mapHtml={mapHtml}
      mapKey={mapKey}
      mode={mode}
      pointsGPS={pointsGPS}
      setMode={setMode}
      superficie={superficie}
    />
  );
}

// =======================================================
// STYLES
// =======================================================
