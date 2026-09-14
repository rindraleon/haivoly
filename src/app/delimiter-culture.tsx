import { useEffect, useState } from 'react';
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
import {
  router,
  useLocalSearchParams,
} from 'expo-router';
import * as Crypto from 'expo-crypto';
import { getAreaOfPolygon } from 'geolib';

import { useParcelle } from '@/hooks/useParcelles';

import {
  getCultures,
  getPointsGPSCulture,
  savePointsGPSCulture,
  PointGPSCulture,
} from '@/api/cultures';

import { getCurrentLocation } from '@/services/location';

interface GPSPoint {
  id: string;
  ordre: number;
  latitude: number;
  longitude: number;
}

interface ParcelleGPSPoint {
  id?: string;
  ordre?: number;
  latitude: number;
  longitude: number;
}

interface CulturePolygon {
  cultureId: string;
  cultureNom: string;
  points: GPSPoint[];
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

  const [pointsGPS, setPointsGPS] = useState<GPSPoint[]>(
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
          await getPointsGPSCulture(
            parcelleId,
            cultureId,
          );

        const nouveauxPoints: GPSPoint[] =
          points.map(
            (
              point: PointGPSCulture,
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
          await getCultures(
            parcelleId,
          );

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
              await getPointsGPSCulture(
                parcelleId,
                culture.id,
              );

            const polygonPoints: GPSPoint[] =
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
            console.log(
              `ERREUR POINTS CULTURE ${culture.id}:`,
              error,
            );
          }
        }

        setCulturesExistantes(
          polygons,
        );
      } catch (error: any) {
        console.log(
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
    points: GPSPoint[],
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
      console.log(
        'ERREUR CALCUL SUPERFICIE:',
        error,
      );

      setSuperficie(0);
    }
  };

  // =====================================================
  // POINT DANS POLYGONE
  // =====================================================

  const pointDansPolygone = (
    latitude: number,
    longitude: number,
    polygon: {
      latitude: number;
      longitude: number;
    }[],
  ): boolean => {
    if (polygon.length < 3) {
      return false;
    }

    let inside = false;

    for (
      let i = 0,
      j = polygon.length - 1;
      i < polygon.length;
      j = i++
    ) {
      const xi =
        Number(polygon[i].latitude);

      const yi =
        Number(polygon[i].longitude);

      const xj =
        Number(polygon[j].latitude);

      const yj =
        Number(polygon[j].longitude);

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
  };

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

  const orientation = (
    a: GPSPoint,
    b: GPSPoint,
    c: GPSPoint,
  ): number => {
    const value =
      (b.longitude - a.longitude) *
        (c.latitude - b.latitude) -
      (b.latitude - a.latitude) *
        (c.longitude - b.longitude);

    if (Math.abs(value) < 0.0000000001) {
      return 0;
    }

    return value > 0 ? 1 : 2;
  };

  // =====================================================
  // POINT SUR SEGMENT
  // =====================================================

  const pointSurSegment = (
    p: GPSPoint,
    q: GPSPoint,
    r: GPSPoint,
  ): boolean => {
    return (
      q.latitude <=
        Math.max(
          p.latitude,
          r.latitude,
        ) &&
      q.latitude >=
        Math.min(
          p.latitude,
          r.latitude,
        ) &&
      q.longitude <=
        Math.max(
          p.longitude,
          r.longitude,
        ) &&
      q.longitude >=
        Math.min(
          p.longitude,
          r.longitude,
        )
    );
  };

  // =====================================================
  // SEGMENTS QUI SE TOUCHENT
  // =====================================================

  const segmentsSeTouchent = (
    p1: GPSPoint,
    q1: GPSPoint,
    p2: GPSPoint,
    q2: GPSPoint,
  ): boolean => {
    const o1 =
      orientation(
        p1,
        q1,
        p2,
      );

    const o2 =
      orientation(
        p1,
        q1,
        q2,
      );

    const o3 =
      orientation(
        p2,
        q2,
        p1,
      );

    const o4 =
      orientation(
        p2,
        q2,
        q1,
      );

    if (
      o1 !== o2 &&
      o3 !== o4
    ) {
      return true;
    }

    if (
      o1 === 0 &&
      pointSurSegment(
        p1,
        p2,
        q1,
      )
    ) {
      return true;
    }

    if (
      o2 === 0 &&
      pointSurSegment(
        p1,
        q2,
        q1,
      )
    ) {
      return true;
    }

    if (
      o3 === 0 &&
      pointSurSegment(
        p2,
        p1,
        q2,
      )
    ) {
      return true;
    }

    if (
      o4 === 0 &&
      pointSurSegment(
        p2,
        q1,
        q2,
      )
    ) {
      return true;
    }

    return false;
  };

  // =====================================================
  // POLYGONES SE TOUCHENT OU SE CHEVAUCHENT
  // =====================================================

  const polygonsSeChevauchent = (
    polygonA: GPSPoint[],
    polygonB: GPSPoint[],
  ): boolean => {
    if (
      polygonA.length < 3 ||
      polygonB.length < 3
    ) {
      return false;
    }

    // ================================================
    // 1. Vérifier les segments
    // ================================================

    for (
      let i = 0;
      i < polygonA.length;
      i++
    ) {
      const a1 =
        polygonA[i];

      const a2 =
        polygonA[
          (i + 1) %
            polygonA.length
        ];

      for (
        let j = 0;
        j < polygonB.length;
        j++
      ) {
        const b1 =
          polygonB[j];

        const b2 =
          polygonB[
            (j + 1) %
              polygonB.length
          ];

        if (
          segmentsSeTouchent(
            a1,
            a2,
            b1,
            b2,
          )
        ) {
          return true;
        }
      }
    }

    // ================================================
    // 2. Vérifier si A est dans B
    // ================================================

    if (
      pointDansPolygone(
        polygonA[0].latitude,
        polygonA[0].longitude,
        polygonB,
      )
    ) {
      return true;
    }

    // ================================================
    // 3. Vérifier si B est dans A
    // ================================================

    if (
      pointDansPolygone(
        polygonB[0].latitude,
        polygonB[0].longitude,
        polygonA,
      )
    ) {
      return true;
    }

    return false;
  };

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

      const nouveauPoint: GPSPoint = {
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
      console.log(
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

        const nouveauPoint: GPSPoint =
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
      console.log(
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

      console.log(
        'SAUVEGARDE CULTURE:',
        {
          parcelleId,
          cultureId,
          points,
        },
      );

      await savePointsGPSCulture(
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
      console.log(
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
          entièrement à l'intérieur de
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  cultureName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 12,
  },

  info: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },

  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d32f2f',
  },

  errorDescription: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },

  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  legendParcelle: {
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: '#2e7d32',
    marginRight: 8,
  },

  legendCultureExistante: {
    width: 18,
    height: 18,
    backgroundColor: '#f57c00',
    opacity: 0.7,
    marginRight: 8,
  },

  legendCulture: {
    width: 18,
    height: 18,
    backgroundColor: '#1565c0',
    opacity: 0.7,
    marginRight: 8,
  },

  legendText: {
    fontSize: 14,
    color: '#444',
  },

  existingContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  existingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  noCultureText: {
    color: '#777',
    fontSize: 14,
  },

  existingCulture: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  existingCultureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f57c00',
  },

  existingCulturePoints: {
    fontSize: 13,
    color: '#666',
  },

  counterContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  counter: {
    color: '#1565c0',
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

  areaLabel: {
    fontSize: 14,
    color: '#666',
  },

  areaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
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
    borderColor: '#1565c0',
    borderRadius: 8,
    alignItems: 'center',
  },

  modeButtonActive: {
    backgroundColor: '#1565c0',
  },

  modeText: {
    color: '#1565c0',
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
    color: '#1565c0',
    marginBottom: 8,
  },

  coordinate: {
    fontSize: 15,
    marginTop: 3,
    color: '#444',
  },

  addButton: {
    height: 52,
    backgroundColor: '#1565c0',
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
    backgroundColor: '#2e7d32',
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