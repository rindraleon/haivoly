/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { WebView } from 'react-native-webview';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronRight,
  Clock3,
  Edit3,
  Eye,
  FileText,
  Map,
  MapPin,
  MapPinned,
  MoreVertical,
  Navigation,
  Ruler,
  Settings2,
  Sprout,
  Trash2,
  Wheat,
  Wrench,
} from 'lucide-react-native';

import {
  Culture,
  getCultureById,
  getPointsGPSCulture,
  deleteCulture,
  PointGPSCulture,
} from '@/api/cultures';

import { getParcelleById } from '@/api/parcelles';

import {
  getRecolte,
  type Recolte,
} from '@/api/recoltes';

import { getAreaOfPolygon } from 'geolib';

import { useConfirm } from '@/components/ui/ConfirmProvider';

import { getMediaUrl } from '@/utils/mediaUrl';

// =====================================================
// TYPES
// =====================================================

interface PointGPSParcelle {
  id?: string;
  latitude: number;
  longitude: number;
  ordre?: number;
}

interface ParcelleDetail {
  id: string;
  nom: string;
  description?: string | null;
  superficie?: number | null;
  typeSol?: string | null;
  statut?: string;
  latitude?: number | null;
  longitude?: number | null;
  pointsGPS?: PointGPSParcelle[];
}


// =====================================================
// ÉCRAN
// =====================================================

export default function DetailCultureScreen() {

  // ===================================================
  // PARAMÈTRES
  // ===================================================

  const {
    parcelleId,
    cultureId,
  } = useLocalSearchParams<{
    parcelleId?: string;
    cultureId?: string;
  }>();


  // ===================================================
  // ÉTATS
  // ===================================================

  const [culture, setCulture] =
    useState<Culture | null>(null);

  const [parcelle, setParcelle] =
    useState<ParcelleDetail | null>(null);

  const [pointsCulture, setPointsCulture] =
    useState<PointGPSCulture[]>([]);

  const [recolte, setRecolte] =
    useState<Recolte | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [refreshKey, setRefreshKey] =
    useState(0);


  // ===================================================
  // SUPPRESSION
  // ===================================================

  const [raisonSuppression, setRaisonSuppression] =
    useState('');

  const [suppressionOuverte, setSuppressionOuverte] =
    useState(false);

  const confirm = useConfirm();


  // ===================================================
  // CHARGER LES DONNÉES
  // ===================================================

  const chargerDonnees =
    useCallback(async () => {

      if (!parcelleId || !cultureId) {

        setError(
          'Identifiant de parcelle ou de culture introuvable.',
        );

        setLoading(false);

        return;
      }

      try {

        setLoading(true);
        setError(null);

        // =============================================
        // CULTURE
        // =============================================

        const cultureData =
          await getCultureById(
            parcelleId,
            cultureId,
          );

        setCulture(cultureData);


        // =============================================
        // PARCELLE
        // =============================================

        const parcelleData =
          await getParcelleById(
            parcelleId,
          );

        setParcelle(
          parcelleData as ParcelleDetail,
        );


        // =============================================
        // POINTS GPS CULTURE
        // =============================================

        const pointsData =
          await getPointsGPSCulture(
            parcelleId,
            cultureId,
          );

        setPointsCulture(
          pointsData.map(
            (
              point,
              index,
            ) => ({
              ...point,

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
          ),
        );

      } catch (err: any) {

        console.error(
          '❌ ERREUR DETAIL CULTURE:',
          err?.response?.data || err,
        );

        const message =
          err?.response?.data?.message ||
          'Impossible de récupérer les informations de la culture.';

        setError(message);

        Alert.alert(
          'Erreur',
          message,
        );

      } finally {

        setLoading(false);

      }


      // =============================================
      // RÉCOLTE
      // =============================================

      try {

        const recolteData =
          await getRecolte(
            cultureId,
          );

        setRecolte(
          recolteData,
        );

      } catch (err: any) {

        if (
          err?.response?.status === 404
        ) {

          setRecolte(null);

        } else {

          console.error(
            '❌ ERREUR RÉCOLTE:',
            err?.response?.data || err,
          );

        }

      }

    }, [
      parcelleId,
      cultureId,
    ]);


  // ===================================================
  // CHARGEMENT INITIAL
  // ===================================================

  useEffect(() => {

    chargerDonnees();

  }, [
    chargerDonnees,
  ]);


  // ===================================================
  // ACTUALISATION AU RETOUR
  // ===================================================

  useFocusEffect(
    useCallback(() => {

      if (
        !parcelleId ||
        !cultureId
      ) {
        return;
      }

      chargerDonnees();

      setRefreshKey(
        previous =>
          previous + 1,
      );

    }, [
      parcelleId,
      cultureId,
      chargerDonnees,
    ]),
  );


  // ===================================================
  // POINTS GPS PARCELLE
  // ===================================================

  const pointsParcelle =
    useMemo(() => {

      if (
        !parcelle?.pointsGPS
      ) {
        return [];
      }

      return [...parcelle.pointsGPS]
        .sort(
          (a, b) =>
            (a.ordre ?? 0) -
            (b.ordre ?? 0),
        )
        .map(
          point => ({
            latitude:
              Number(
                point.latitude,
              ),

            longitude:
              Number(
                point.longitude,
              ),

            ordre:
              point.ordre ?? 0,
          }),
        );

    }, [
      parcelle,
    ]);


  // ===================================================
  // POINTS GPS CULTURE
  // ===================================================

  const pointsCultureTries =
    useMemo(() => {

      return [...pointsCulture]
        .sort(
          (a, b) =>
            a.ordre -
            b.ordre,
        )
        .map(
          point => ({
            id:
              point.id,

            latitude:
              Number(
                point.latitude,
              ),

            longitude:
              Number(
                point.longitude,
              ),

            ordre:
              point.ordre,
          }),
        );

    }, [
      pointsCulture,
    ]);


  // ===================================================
  // SUPERFICIE CULTURE
  // ===================================================

  const superficieCulture =
    useMemo(() => {

      if (
        pointsCultureTries.length < 3
      ) {
        return 0;
      }

      const coordinates =
        pointsCultureTries.map(
          point => ({
            latitude:
              point.latitude,

            longitude:
              point.longitude,
          }),
        );

      return getAreaOfPolygon(
        coordinates,
      );

    }, [
      pointsCultureTries,
    ]);


  // ===================================================
  // CENTRE CARTE
  // ===================================================

  const centreCarte =
    useMemo(() => {

      if (
        pointsParcelle.length > 0
      ) {

        const latitude =
          pointsParcelle.reduce(
            (
              total,
              point,
            ) =>
              total +
              point.latitude,
            0,
          ) /
          pointsParcelle.length;

        const longitude =
          pointsParcelle.reduce(
            (
              total,
              point,
            ) =>
              total +
              point.longitude,
            0,
          ) /
          pointsParcelle.length;

        return {
          latitude,
          longitude,
        };

      }


      if (
        pointsCultureTries.length > 0
      ) {

        const latitude =
          pointsCultureTries.reduce(
            (
              total,
              point,
            ) =>
              total +
              point.latitude,
            0,
          ) /
          pointsCultureTries.length;

        const longitude =
          pointsCultureTries.reduce(
            (
              total,
              point,
            ) =>
              total +
              point.longitude,
            0,
          ) /
          pointsCultureTries.length;

        return {
          latitude,
          longitude,
        };

      }


      if (
        parcelle?.latitude != null &&
        parcelle?.longitude != null
      ) {

        return {
          latitude:
            Number(
              parcelle.latitude,
            ),

          longitude:
            Number(
              parcelle.longitude,
            ),
        };

      }


      return {
        latitude: -18.8792,
        longitude: 47.5079,
      };

    }, [
      pointsParcelle,
      pointsCultureTries,
      parcelle,
    ]);


  // ===================================================
  // SUPPRESSION
  // ===================================================

  const supprimerCulture =
    async () => {

      if (
        !parcelleId ||
        !cultureId
      ) {

        Alert.alert(
          'Erreur',
          'Identifiant de culture introuvable.',
        );

        return;
      }


      if (!culture) {

        Alert.alert(
          'Erreur',
          'Culture introuvable.',
        );

        return;
      }


      if (
        culture.statut === 'SUPPRIMEE'
      ) {

        Alert.alert(
          'Culture déjà supprimée',
          'Cette culture a déjà été supprimée.',
        );

        return;
      }


      if (
        !raisonSuppression.trim()
      ) {

        Alert.alert(
          'Raison obligatoire',
          'Veuillez saisir une raison avant de supprimer la culture.',
        );

        return;
      }


      const ok =
        await confirm({
          title:
            `Supprimer "${culture.nom}" ?`,

          description:
            `Vous êtes sur le point de supprimer définitivement la culture "${culture.nom}". Cette action est irréversible.`,

          confirmLabel:
            'Supprimer',

          cancelLabel:
            'Annuler',

          variant:
            'danger',
        });


      if (!ok) {
        return;
      }


      try {

        setLoading(true);

        await deleteCulture(
          parcelleId,
          cultureId,
          {
            raison:
              raisonSuppression.trim(),
          },
        );

        setRaisonSuppression('');
        setSuppressionOuverte(false);

        Alert.alert(
          'Succès',
          'La culture a été supprimée.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ],
        );

      } catch (err: any) {

        console.error(
          '❌ ERREUR SUPPRESSION CULTURE:',
          err?.response?.data || err,
        );

        Alert.alert(
          'Erreur',
          err?.response?.data?.message ||
            'Impossible de supprimer la culture.',
        );

      } finally {

        setLoading(false);

      }

    };


  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <View
          style={
            styles.loadingIcon
          }
        >
          <Sprout
            size={28}
            color="#3D7843"
          />
        </View>

        <ActivityIndicator
          size="small"
          color="#3D7843"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement de la culture...
        </Text>

      </View>
    );

  }


  // ===================================================
  // ERREUR
  // ===================================================

  if (
    error ||
    !culture
  ) {

    return (
      <View
        style={
          styles.errorContainer
        }
      >

        <View
          style={
            styles.errorIcon
          }
        >
          <Sprout
            size={30}
            color="#B42318"
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Culture introuvable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {error ||
            'Impossible de charger cette culture.'}
        </Text>

        <TouchableOpacity
          style={
            styles.errorBackButton
          }
          onPress={() =>
            router.back()
          }
        >

          <ArrowLeft
            size={18}
            color="#FFFFFF"
          />

          <Text
            style={
              styles.errorBackText
            }
          >
            Retour
          </Text>

        </TouchableOpacity>

      </View>
    );

  }


  // ===================================================
  // ÉTATS
  // ===================================================

  const estSupprimee =
    culture.statut === 'SUPPRIMEE';

  const estRecoltee =
    culture.statut === 'RECOLTEE';

  const estEnCours =
    culture.statut === 'EN_COURS';

  const peutModifier =
    culture.statut !== 'RECOLTEE' &&
    culture.statut !== 'SUPPRIMEE';


  // ===================================================
  // DATE UTILITAIRE
  // ===================================================

  const formatDate =
    (
      date?: string | null,
    ) => {

      if (!date) {
        return 'Non renseignée';
      }

      const parsed =
        new Date(date);

      if (
        Number.isNaN(
          parsed.getTime(),
        )
      ) {
        return 'Non renseignée';
      }

      return parsed.toLocaleDateString(
        'fr-FR',
        {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        },
      );

    };


  // ===================================================
  // DATE DE CRÉATION
  // ===================================================

  const dateCreation =
    (culture as any)?.createdAt ||
    (culture as any)?.dateCreation ||
    null;


  // ===================================================
  // PROGRESSION TIMELINE
  // ===================================================

  const timelineProgress =
    estRecoltee
      ? '100%'
      : estEnCours
        ? '50%'
        : '0%';


  // ===================================================
  // HTML CARTE
  // ===================================================

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

.legend {
  background: white;
  padding: 10px;
  border-radius: 10px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.25);
  font-family: Arial, sans-serif;
  font-size: 12px;
  line-height: 18px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 5px;
}

.legend-item {
  display: flex;
  align-items: center;
}

.legend-box {
  width: 20px;
  height: 10px;
  margin-right: 6px;
  border-radius: 4px;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const pointsParcelle =
  ${JSON.stringify(pointsParcelle)};

const pointsCulture =
  ${JSON.stringify(pointsCultureTries)};

const map =
  L.map('map', {

    zoomControl: true,

    scrollWheelZoom: true,

    doubleClickZoom: true,

    touchZoom: true,

    minZoom: 5,

    maxZoom: 22

  }).setView(

    [
      ${centreCarte.latitude},
      ${centreCarte.longitude}
    ],

    18

  );


const standard =
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors',

      maxZoom: 19
    }
  );


const satellite =
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri',

      maxZoom: 19
    }
  );


standard.addTo(map);


L.control.layers(

  {
    '🗺️ Standard': standard,

    '🛰️ Satellite': satellite

  },

  null,

  {
    position: 'topright'
  }

).addTo(map);


// =====================================================
// PARCELLE
// =====================================================

if (
  pointsParcelle.length >= 3
) {

  const coordinatesParcelle =
    pointsParcelle.map(
      function(point) {

        return [
          point.latitude,
          point.longitude
        ];

      }
    );


  const polygonParcelle =
    L.polygon(
      coordinatesParcelle,
      {
        color: '#1565c0',
        fillColor: '#1565c0',
        fillOpacity: 0.12,
        weight: 4
      }
    ).addTo(map);


  polygonParcelle.bindPopup(
    '<b>Parcelle</b><br/>${(parcelle?.nom || '').replace(/'/g, "\\'")}'
  );

}


// =====================================================
// POINTS PARCELLE
// =====================================================

pointsParcelle.forEach(
  function(point) {

    L.circleMarker(
      [
        point.latitude,
        point.longitude
      ],
      {
        radius: 5,
        color: '#1565c0',
        fillColor: '#1565c0',
        fillOpacity: 1,
        weight: 2
      }
    ).addTo(map);

  }
);


// =====================================================
// CULTURE
// =====================================================

if (
  pointsCulture.length >= 3
) {

  const coordinatesCulture =
    pointsCulture.map(
      function(point) {

        return [
          point.latitude,
          point.longitude
        ];

      }
    );


  const polygonCulture =
    L.polygon(
      coordinatesCulture,
      {
        color: '#2e7d32',
        fillColor: '#2e7d32',
        fillOpacity: 0.45,
        weight: 4
      }
    ).addTo(map);


  polygonCulture.bindPopup(
    '<b>Culture</b><br/>${(culture.nom || '').replace(/'/g, "\\'")}'
  );

}


// =====================================================
// POINTS CULTURE
// =====================================================

pointsCulture.forEach(
  function(point) {

    const marker =
      L.circleMarker(
        [
          point.latitude,
          point.longitude
        ],
        {
          radius: 6,
          color: '#2e7d32',
          fillColor: '#2e7d32',
          fillOpacity: 1,
          weight: 2
        }
      ).addTo(map);


    marker.bindPopup(
      '<b>Culture P' +
      point.ordre +
      '</b><br/>' +
      point.latitude.toFixed(6) +
      '<br/>' +
      point.longitude.toFixed(6)
    );

  }
);


// =====================================================
// AJUSTER LA CARTE
// =====================================================

const allCoordinates = [];

pointsParcelle.forEach(
  function(point) {

    allCoordinates.push([
      point.latitude,
      point.longitude
    ]);

  }
);


pointsCulture.forEach(
  function(point) {

    allCoordinates.push([
      point.latitude,
      point.longitude
    ]);

  }
);


if (
  allCoordinates.length > 0
) {

  const bounds =
    L.latLngBounds(
      allCoordinates
    );

  map.fitBounds(
    bounds,
    {
      padding: [30, 30]
    }
  );

}


// =====================================================
// LÉGENDE
// =====================================================

const legend =
  L.control({
    position: 'bottomright'
  });


legend.onAdd =
  function() {

    const div =
      L.DomUtil.create(
        'div',
        'legend'
      );


    div.innerHTML =

      '<div class="legend-title">' +
      'Légende' +
      '</div>' +

      '<div class="legend-item">' +

      '<div class="legend-box" ' +
      'style="background:#1565c0;">' +
      '</div>' +

      'Parcelle' +

      '</div>' +

      '<div class="legend-item">' +

      '<div class="legend-box" ' +
      'style="background:#2e7d32;">' +
      '</div>' +

      'Culture' +

      '</div>';


    return div;

  };


legend.addTo(map);

</script>

</body>

</html>
`;


  // ===================================================
  // CLÉ WEBVIEW
  // ===================================================

  const mapKey =
    `${parcelleId}-${cultureId}-${refreshKey}-${pointsCultureTries
      .map(
        point =>
          `${point.latitude},${point.longitude}`,
      )
      .join('|')}`;


  // ===================================================
  // RENDU
  // ===================================================

  return (

    <View
      style={
        styles.root
      }
    >

      {/* =================================================
          BACKGROUND DECOR
      ================================================= */}

      <View
        pointerEvents="none"
        style={
          styles.backgroundDecor
        }
      >

        <View
          style={
            styles.circleOne
          }
        />

        <View
          style={
            styles.circleTwo
          }
        />

        <View
          style={
            styles.circleThree
          }
        />

        <View
          style={
            styles.glowOne
          }
        />

        <View
          style={
            styles.glowTwo
          }
        />

      </View>


      {/* =================================================
          HEADER
      ================================================= */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          style={
            styles.headerButton
          }
          onPress={() =>
            router.back()
          }
          activeOpacity={0.8}
        >

          <ArrowLeft
            size={21}
            color="#244329"
          />

        </TouchableOpacity>


        <View
          style={
            styles.headerTitle
          }
        >

          <Text
            style={
              styles.headerTitleText
            }
          >
            Détail culture
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Informations de la culture
          </Text>

        </View>


        <TouchableOpacity
          style={
            styles.headerButton
          }
          activeOpacity={0.8}
        >

          <MoreVertical
            size={21}
            color="#244329"
          />

        </TouchableOpacity>

      </View>


      {/* =================================================
          CONTENU
      ================================================= */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >


        {/* =================================================
            CARTE HERO
        ================================================= */}

        <View
          style={
            styles.mapHero
          }
        >

          <WebView
            key={mapKey}
            originWhitelist={[
              '*',
            ]}
            javaScriptEnabled
            source={{
              html: mapHtml,
            }}
            style={
              styles.webview
            }
          />


          {/* GPS BADGE */}

          <View
            style={
              styles.gpsBadge
            }
          >

            <Navigation
              size={14}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.gpsBadgeText
              }
            >
              {pointsCultureTries.length} point
              {pointsCultureTries.length > 1
                ? 's'
                : ''}{' '}
              GPS
            </Text>

          </View>

        </View>


        {/* =================================================
            IDENTITÉ
        ================================================= */}

        <View
          style={
            styles.identitySection
          }
        >

          <View
            style={
              styles.identityIcon
            }
          >

            <Sprout
              size={24}
              color="#3D7843"
            />

          </View>


          <View
            style={
              styles.identityContent
            }
          >

            <Text
              style={
                styles.identityTitle
              }
            >
              {culture.nom}
            </Text>

            <Text
              style={
                styles.identitySubtitle
              }
            >
              {culture.variete ||
                culture.type ||
                'Culture agricole'}
            </Text>


            <View
              style={
                styles.identityMeta
              }
            >

              <MapPin
                size={14}
                color="#6B7F6D"
              />

              <Text
                style={
                  styles.identityMetaText
                }
              >
                {parcelle?.nom ||
                  'Parcelle non renseignée'}
              </Text>

            </View>

          </View>


          <View
            style={[
              styles.identityStatus,
              estRecoltee &&
                styles.identityStatusHarvested,
              estSupprimee &&
                styles.identityStatusDeleted,
            ]}
          >

            <Text
              style={
                styles.identityStatusText
              }
            >
              {culture.statut ===
              'EN_COURS'
                ? 'En cours'
                : culture.statut ===
                  'PLANIFIEE'
                  ? 'Planifiée'
                  : culture.statut ===
                    'RECOLTEE'
                    ? 'Récoltée'
                    : culture.statut ===
                      'ABANDONNEE'
                      ? 'Abandonnée'
                      : 'Supprimée'}
            </Text>

          </View>

        </View>


        {/* =================================================
            DESCRIPTION
        ================================================= */}

        <View
          style={
            styles.descriptionCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <FileText
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                À propos de cette culture
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Description et informations
              </Text>

            </View>

          </View>


          <Text
            style={
              styles.descriptionText
            }
          >
            {culture.description ||
              'Aucune description renseignée pour cette culture.'}
          </Text>

        </View>


        {/* =================================================
            STATISTIQUES
        ================================================= */}

        <View
          style={
            styles.statsCard
          }
        >

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={
                styles.statIcon
              }
            >

              <Ruler
                size={18}
                color="#3D7843"
              />

            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {superficieCulture > 0
                ? `${(
                    superficieCulture /
                    10000
                  ).toFixed(2)} ha`
                : '—'}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Surface
            </Text>

          </View>


          <View
            style={
              styles.statDivider
            }
          />


          <View
            style={
              styles.statItem
            }
          >

            <View
              style={
                styles.statIcon
              }
            >

              <Calendar
                size={18}
                color="#3D7843"
              />

            </View>

            <Text
              numberOfLines={1}
              style={
                styles.statValueSmall
              }
            >
              {formatDate(
                culture.datePlantation,
              )}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Plantation
            </Text>

          </View>


          <View
            style={
              styles.statDivider
            }
          />


          <View
            style={
              styles.statItem
            }
          >

            <View
              style={
                styles.statIcon
              }
            >

              <Wheat
                size={18}
                color="#3D7843"
              />

            </View>

            <Text
              numberOfLines={1}
              style={
                styles.statValueSmall
              }
            >
              {formatDate(
                culture.datePrevueRecolte,
              )}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Récolte prévue
            </Text>

          </View>

        </View>


        {/* =================================================
            TIMELINE HORIZONTALE
        ================================================= */}

        <View
          style={
            styles.timelineCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Sprout
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Cycle de la culture
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Suivi de l'évolution
              </Text>

            </View>

          </View>


          <View
            style={
              styles.timelineContainer
            }
          >

            {/* LIGNE DE FOND */}

            <View
              style={
                styles.timelineLineBackground
              }
            />


            {/* LIGNE ACTIVE */}

            <View
              style={[
                styles.timelineLineActive,
                {
                  width:
                    timelineProgress,
                },
              ]}
            />


            {/* ÉTAPES */}

            <View
              style={
                styles.timelineSteps
              }
            >

              {/* =====================================
                  PLANIFICATION
              ====================================== */}

              <View
                style={
                  styles.timelineStep
                }
              >

                <View
                  style={[
                    styles.timelineNode,
                    styles.timelineNodeCompleted,
                  ]}
                >

                  {culture.statut ===
                  'PLANIFIEE' ? (
                    <Calendar
                      size={15}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Check
                      size={16}
                      color="#FFFFFF"
                    />
                  )}

                </View>


                <Text
                  style={
                    styles.timelineTitle
                  }
                >
                  Planification
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.timelineDate
                  }
                >
                  {formatDate(
                    dateCreation ||
                      culture.datePlantation,
                  )}
                </Text>

                <Text
                  style={
                    styles.timelineDescription
                  }
                >
                  Culture planifiée
                </Text>

              </View>


              {/* =====================================
                  EN COURS
              ====================================== */}

              <View
                style={
                  styles.timelineStep
                }
              >

                <View
                  style={[
                    styles.timelineNode,

                    estEnCours ||
                    estRecoltee
                      ? styles.timelineNodeCompleted
                      : styles.timelineNodePending,

                    estEnCours &&
                      styles.timelineNodeCurrent,
                  ]}
                >

                  {estEnCours ? (
                    <Sprout
                      size={16}
                      color="#FFFFFF"
                    />
                  ) : estRecoltee ? (
                    <Check
                      size={16}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Sprout
                      size={15}
                      color="#8B9A8D"
                    />
                  )}

                </View>


                <Text
                  style={[
                    styles.timelineTitle,
                    !estEnCours &&
                      !estRecoltee &&
                      styles.timelineTitlePending,
                  ]}
                >
                  Plantation
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.timelineDate
                  }
                >
                  {formatDate(
                    culture.datePlantation,
                  )}
                </Text>

                <Text
                  style={
                    styles.timelineDescription
                  }
                >
                  {estEnCours
                    ? 'Culture en cours'
                    : estRecoltee
                      ? 'Étape terminée'
                      : 'À venir'}
                </Text>

              </View>


              {/* =====================================
                  RÉCOLTE
              ====================================== */}

              <View
                style={
                  styles.timelineStep
                }
              >

                <View
                  style={[
                    styles.timelineNode,

                    estRecoltee
                      ? styles.timelineNodeCompleted
                      : styles.timelineNodePending,
                  ]}
                >

                  {estRecoltee ? (
                    <Check
                      size={16}
                      color="#FFFFFF"
                    />
                  ) : (
                    <Wheat
                      size={15}
                      color="#8B9A8D"
                    />
                  )}

                </View>


                <Text
                  style={[
                    styles.timelineTitle,
                    !estRecoltee &&
                      styles.timelineTitlePending,
                  ]}
                >
                  Récolte
                </Text>

                <Text
                  numberOfLines={1}
                  style={
                    styles.timelineDate
                  }
                >
                  {recolte
                    ? formatDate(
                        recolte.dateRecolte,
                      )
                    : formatDate(
                        culture.datePrevueRecolte,
                      )}
                </Text>

                <Text
                  style={
                    styles.timelineDescription
                  }
                >
                  {estRecoltee
                    ? 'Récolte effectuée'
                    : 'Récolte prévue'}
                </Text>

              </View>

            </View>

          </View>


          {/* ABANDONNÉE */}

          {culture.statut ===
            'ABANDONNEE' && (

            <View
              style={
                styles.abandonedBanner
              }
            >

              <Clock3
                size={17}
                color="#A15C00"
              />

              <Text
                style={
                  styles.abandonedText
                }
              >
                Culture abandonnée
              </Text>

            </View>

          )}


          {/* SUPPRIMÉE */}

          {estSupprimee && (

            <View
              style={
                styles.deletedBanner
              }
            >

              <Trash2
                size={17}
                color="#B42318"
              />

              <Text
                style={
                  styles.deletedText
                }
              >
                Culture supprimée
              </Text>

            </View>

          )}

        </View>


        {/* =================================================
            PARCELLE ASSOCIÉE
        ================================================= */}

        <View
          style={
            styles.sectionCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <MapPinned
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Parcelle associée
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Terrain de la culture
              </Text>

            </View>

          </View>


          <TouchableOpacity
            style={
              styles.parcelleRow
            }
            activeOpacity={0.75}
            onPress={() => {

              if (!parcelleId) {
                return;
              }

              router.push({
                pathname:
                  '/detail-parcelle',
                params: {
                  parcelleId,
                },
              });

            }}
          >

            <View
              style={
                styles.parcelleIcon
              }
            >

              <MapPin
                size={20}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.parcelleInfo
              }
            >

              <Text
                style={
                  styles.parcelleTitle
                }
              >
                {parcelle?.nom ||
                  'Parcelle inconnue'}
              </Text>

              <Text
                style={
                  styles.parcelleSubtitle
                }
              >
                {parcelle?.superficie != null
                  ? `${(
                      Number(
                        parcelle.superficie,
                      ) / 10000
                    ).toFixed(2)} ha`
                  : 'Surface inconnue'}
                {' • '}
                {parcelle?.typeSol ||
                  'Sol non renseigné'}
              </Text>

            </View>


            <ChevronRight
              size={20}
              color="#7A8B7D"
            />

          </TouchableOpacity>

        </View>


        {/* =================================================
            INTERVENTIONS
        ================================================= */}

        <View
          style={
            styles.sectionCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Wrench
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Interventions
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Gestion des interventions
              </Text>

            </View>


            {!estSupprimee && (

              <TouchableOpacity
                style={
                  styles.seeButton
                }
                onPress={() =>
                  router.push({
                    pathname:
                      '/interventions-culture',
                    params: {
                      parcelleId,
                      cultureId,
                      parcelleNom:
                        parcelle?.nom ||
                        '',
                      cultureNom:
                        culture.nom,
                      statut:
                        culture.statut,
                    },
                  })
                }
              >

                <Text
                  style={
                    styles.seeButtonText
                  }
                >
                  Voir
                </Text>

                <ChevronRight
                  size={16}
                  color="#3D7843"
                />

              </TouchableOpacity>

            )}

          </View>


          <View
            style={
              styles.emptySection
            }
          >

            <Wrench
              size={20}
              color="#91A193"
            />

            <Text
              style={
                styles.emptySectionText
              }
            >
              Consultez les interventions
              de cette culture.
            </Text>

          </View>

        </View>


        {/* =================================================
            OBSERVATIONS
        ================================================= */}

        <View
          style={
            styles.sectionCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Eye
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Observations
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Suivi de la culture
              </Text>

            </View>


            {!estSupprimee && (

              <TouchableOpacity
                style={
                  styles.seeButton
                }
                onPress={() =>
                  router.push({
                    pathname:
                      '/observations',
                    params: {
                      parcelleId,
                      cultureId,
                      parcelleNom:
                        parcelle?.nom ||
                        '',
                      cultureNom:
                        culture.nom,
                      statut:
                        culture.statut,
                    },
                  })
                }
              >

                <Text
                  style={
                    styles.seeButtonText
                  }
                >
                  Voir
                </Text>

                <ChevronRight
                  size={16}
                  color="#3D7843"
                />

              </TouchableOpacity>

            )}

          </View>


          <View
            style={
              styles.emptySection
            }
          >

            <Eye
              size={20}
              color="#91A193"
            />

            <Text
              style={
                styles.emptySectionText
              }
            >
              Consultez les observations
              de cette culture.
            </Text>

          </View>

        </View>


        {/* =================================================
            INFORMATION RÉCOLTE
        ================================================= */}

        {recolte && (

          <View
            style={
              styles.harvestCard
            }
          >

            <View
              style={
                styles.sectionHeader
              }
            >

              <View
                style={
                  styles.harvestIcon
                }
              >

                <Wheat
                  size={19}
                  color="#7B5A00"
                />

              </View>


              <View
                style={
                  styles.sectionHeaderText
                }
              >

                <Text
                  style={
                    styles.sectionTitle
                  }
                >
                  Information de récolte
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Données enregistrées
                </Text>

              </View>

            </View>


            <View
              style={
                styles.harvestGrid
              }
            >

              <View
                style={
                  styles.harvestItem
                }
              >

                <Text
                  style={
                    styles.harvestLabel
                  }
                >
                  Date
                </Text>

                <Text
                  style={
                    styles.harvestValue
                  }
                >
                  {formatDate(
                    recolte.dateRecolte,
                  )}
                </Text>

              </View>


              <View
                style={
                  styles.harvestItem
                }
              >

                <Text
                  style={
                    styles.harvestLabel
                  }
                >
                  Quantité
                </Text>

                <Text
                  style={
                    styles.harvestValue
                  }
                >
                  {recolte.quantite}{' '}
                  {recolte.unite}
                </Text>

              </View>


              {recolte.prixVente != null && (

                <View
                  style={
                    styles.harvestItem
                  }
                >

                  <Text
                    style={
                      styles.harvestLabel
                    }
                  >
                    Prix de vente
                  </Text>

                  <Text
                    style={
                      styles.harvestValue
                    }
                  >
                    {recolte.prixVente} Ar
                  </Text>

                </View>

              )}


              {recolte.coutRecolte != null && (

                <View
                  style={
                    styles.harvestItem
                  }
                >

                  <Text
                    style={
                      styles.harvestLabel
                    }
                  >
                    Coût récolte
                  </Text>

                  <Text
                    style={
                      styles.harvestValue
                    }
                  >
                    {recolte.coutRecolte} Ar
                  </Text>

                </View>

              )}

            </View>


            {recolte.description && (

              <View
                style={
                  styles.harvestDescription
                }
              >

                <Text
                  style={
                    styles.harvestLabel
                  }
                >
                  Remarque
                </Text>

                <Text
                  style={
                    styles.harvestDescriptionText
                  }
                >
                  {recolte.description}
                </Text>

              </View>

            )}


            {recolte.photos &&
              recolte.photos.length > 0 && (

              <View
                style={
                  styles.photosContainer
                }
              >

                <Text
                  style={
                    styles.harvestLabel
                  }
                >
                  Photos de la récolte
                </Text>


                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.photosList
                  }
                >

                  {recolte.photos.map(
                    photo => (

                      <Image
                        key={
                          photo.id
                        }
                        source={{
                          uri:
                            getMediaUrl(photo.url),
                        }}
                        style={
                          styles.recoltePhoto
                        }
                        resizeMode="cover"
                      />

                    ),
                  )}

                </ScrollView>

              </View>

            )}

          </View>

        )}


        {/* =================================================
            SUPERFICIE / GPS
        ================================================= */}

        <View
          style={
            styles.sectionCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Ruler
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Délimitation
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Surface et points GPS
              </Text>

            </View>

          </View>


          <View
            style={
              styles.delimitationStats
            }
          >

            <View
              style={
                styles.delimitationStat
              }
            >

              <Text
                style={
                  styles.delimitationValue
                }
              >
                {superficieCulture > 0
                  ? `${(
                      superficieCulture /
                      10000
                    ).toFixed(2)} ha`
                  : '—'}
              </Text>

              <Text
                style={
                  styles.delimitationLabel
                }
              >
                Surface culture
              </Text>

            </View>


            <View
              style={
                styles.delimitationDivider
              }
            />


            <View
              style={
                styles.delimitationStat
              }
            >

              <Text
                style={
                  styles.delimitationValue
                }
              >
                {pointsCultureTries.length}
              </Text>

              <Text
                style={
                  styles.delimitationLabel
                }
              >
                Points GPS
              </Text>

            </View>

          </View>


          {pointsCultureTries.length > 0 && (

            <View
              style={
                styles.pointsList
              }
            >

              {pointsCultureTries.map(
                (
                  point,
                  index,
                ) => (

                  <View
                    key={
                      point.id ||
                      `${point.ordre}-${index}`
                    }
                    style={
                      styles.pointRow
                    }
                  >

                    <View
                      style={
                        styles.pointIcon
                      }
                    >

                      <Navigation
                        size={16}
                        color="#3D7843"
                      />

                    </View>


                    <View
                      style={
                        styles.pointInfo
                      }
                    >

                      <Text
                        style={
                          styles.pointTitle
                        }
                      >
                        Point P{point.ordre}
                      </Text>

                      <Text
                        style={
                          styles.coordinate
                        }
                      >
                        {point.latitude.toFixed(
                          6,
                        )}
                        {'  •  '}
                        {point.longitude.toFixed(
                          6,
                        )}
                      </Text>

                    </View>

                  </View>

                ),
              )}

            </View>

          )}


          {pointsCultureTries.length ===
            0 && (

            <View
              style={
                styles.noGPSBox
              }
            >

              <Map
                size={20}
                color="#89978B"
              />

              <Text
                style={
                  styles.noGPSText
                }
              >
                La culture n'est pas
                encore délimitée.
              </Text>

            </View>

          )}

        </View>


        {/* =================================================
            MODIFIER DÉLIMITATION
        ================================================= */}

        {peutModifier && (

          <TouchableOpacity
            style={
              styles.outlineAction
            }
            onPress={() =>
              router.push({
                pathname:
                  '/delimiter-culture',
                params: {
                  parcelleId,
                  cultureId,
                },
              })
            }
            activeOpacity={0.8}
          >

            <Navigation
              size={18}
              color="#3D7843"
            />

            <Text
              style={
                styles.outlineActionText
              }
            >
              Modifier la délimitation
            </Text>

            <ChevronRight
              size={18}
              color="#3D7843"
            />

          </TouchableOpacity>

        )}


        {/* =================================================
            INFORMATIONS TECHNIQUES
        ================================================= */}

        <View
          style={
            styles.technicalCard
          }
        >

          <View
            style={
              styles.sectionHeader
            }
          >

            <View
              style={
                styles.sectionIcon
              }
            >

              <Settings2
                size={18}
                color="#3D7843"
              />

            </View>


            <View
              style={
                styles.sectionHeaderText
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Informations techniques
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Informations système
              </Text>

            </View>

          </View>


          <View
            style={
              styles.technicalRow
            }
          >

            <Text
              style={
                styles.technicalLabel
              }
            >
              Identifiant
            </Text>

            <Text
              numberOfLines={1}
              style={
                styles.technicalValue
              }
            >
              {culture.id}
            </Text>

          </View>


          <View
            style={
              styles.technicalRow
            }
          >

            <Text
              style={
                styles.technicalLabel
              }
            >
              Créée le
            </Text>

            <Text
              style={
                styles.technicalValue
              }
            >
              {formatDate(
                dateCreation ||
                  culture.datePlantation,
              )}
            </Text>

          </View>


          <View
            style={
              styles.technicalRow
            }
          >

            <Text
              style={
                styles.technicalLabel
              }
            >
              Plantation
            </Text>

            <Text
              style={
                styles.technicalValue
              }
            >
              {formatDate(
                culture.datePlantation,
              )}
            </Text>

          </View>


          <View
            style={
              styles.technicalRow
            }
          >

            <Text
              style={
                styles.technicalLabel
              }
            >
              Récolte prévue
            </Text>

            <Text
              style={
                styles.technicalValue
              }
            >
              {formatDate(
                culture.datePrevueRecolte,
              )}
            </Text>

          </View>

        </View>


        {/* =================================================
            ACTIONS
        ================================================= */}

        <View
          style={
            styles.actionsSection
          }
        >

          <Text
            style={
              styles.actionsLabel
            }
          >
            ACTIONS
          </Text>


          {/* RÉCOLTE */}

          {estEnCours &&
            !recolte && (

            <TouchableOpacity
              style={
                styles.primaryAction
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/ajout-recolte',
                  params: {
                    cultureId,
                    parcelleId,
                  },
                })
              }
              activeOpacity={0.85}
            >

              <View
                style={
                  styles.actionIcon
                }
              >

                <Wheat
                  size={19}
                  color="#FFFFFF"
                />

              </View>


              <Text
                style={
                  styles.primaryActionText
                }
              >
                Enregistrer la récolte
              </Text>


              <ChevronRight
                size={19}
                color="#FFFFFF"
              />

            </TouchableOpacity>

          )}


          {/* INFORMATION RÉCOLTE */}

          {estRecoltee &&
            recolte && (

            <TouchableOpacity
              style={
                styles.harvestAction
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/recoltes',
                  params: {
                    cultureId,
                    parcelleId,
                  },
                })
              }
              activeOpacity={0.85}
            >

              <View
                style={
                  styles.harvestActionIcon
                }
              >

                <Wheat
                  size={19}
                  color="#7B5A00"
                />

              </View>


              <Text
                style={
                  styles.harvestActionText
                }
              >
                Information de récolte
              </Text>


              <ChevronRight
                size={19}
                color="#7B5A00"
              />

            </TouchableOpacity>

          )}


          {/* MODIFIER */}

          {peutModifier && (

            <TouchableOpacity
              style={
                styles.outlineActionLarge
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/modifier-culture',
                  params: {
                    parcelleId,
                    cultureId,
                    parcelleNom:
                      parcelle?.nom ||
                      '',
                  },
                })
              }
              activeOpacity={0.8}
            >

              <Edit3
                size={18}
                color="#3D7843"
              />

              <Text
                style={
                  styles.outlineActionText
                }
              >
                Modifier la culture
              </Text>

              <ChevronRight
                size={18}
                color="#3D7843"
              />

            </TouchableOpacity>

          )}


          {/* INTERVENTIONS */}

          {!estSupprimee && (

            <TouchableOpacity
              style={
                styles.outlineActionLarge
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/interventions-culture',
                  params: {
                    parcelleId,
                    cultureId,
                    parcelleNom:
                      parcelle?.nom ||
                      '',
                    cultureNom:
                      culture.nom,
                    statut:
                      culture.statut,
                  },
                })
              }
              activeOpacity={0.8}
            >

              <Wrench
                size={18}
                color="#3D7843"
              />

              <Text
                style={
                  styles.outlineActionText
                }
              >
                Gérer les interventions
              </Text>

              <ChevronRight
                size={18}
                color="#3D7843"
              />

            </TouchableOpacity>

          )}


          {/* OBSERVATIONS */}

          {!estSupprimee && (

            <TouchableOpacity
              style={
                styles.outlineActionLarge
              }
              onPress={() =>
                router.push({
                  pathname:
                    '/observations',
                  params: {
                    parcelleId,
                    cultureId,
                    parcelleNom:
                      parcelle?.nom ||
                      '',
                    cultureNom:
                      culture.nom,
                    statut:
                      culture.statut,
                  },
                })
              }
              activeOpacity={0.8}
            >

              <Eye
                size={18}
                color="#3D7843"
              />

              <Text
                style={
                  styles.outlineActionText
                }
              >
                Gérer les observations
              </Text>

              <ChevronRight
                size={18}
                color="#3D7843"
              />

            </TouchableOpacity>

          )}

        </View>


        {/* =================================================
            SUPPRESSION
        ================================================= */}

        {culture.statut !==
          'RECOLTEE' &&
          !estSupprimee && (

          <View
            style={
              styles.deleteCard
            }
          >

            <View
              style={
                styles.deleteHeader
              }
            >

              <View
                style={
                  styles.deleteIcon
                }
              >

                <Trash2
                  size={18}
                  color="#B42318"
                />

              </View>


              <View
                style={
                  styles.deleteHeaderText
                }
              >

                <Text
                  style={
                    styles.deleteTitle
                  }
                >
                  Suppression de la culture
                </Text>

                <Text
                  style={
                    styles.deleteSubtitle
                  }
                >
                  Cette action est irréversible
                </Text>

              </View>

            </View>


            {!suppressionOuverte ? (

              <TouchableOpacity
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  setSuppressionOuverte(
                    true,
                  )
                }
                activeOpacity={0.85}
              >

                <Trash2
                  size={17}
                  color="#FFFFFF"
                />

                <Text
                  style={
                    styles.deleteButtonText
                  }
                >
                  Supprimer la culture
                </Text>

              </TouchableOpacity>

            ) : (

              <>

                <Text
                  style={
                    styles.reasonLabel
                  }
                >
                  Raison de la suppression *
                </Text>


                <TextInput
                  style={
                    styles.reasonInput
                  }
                  placeholder="Ex : Culture abandonnée à cause du manque d'eau"
                  placeholderTextColor="#98A29A"
                  value={
                    raisonSuppression
                  }
                  onChangeText={
                    setRaisonSuppression
                  }
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />


                <View
                  style={
                    styles.suppressionActions
                  }
                >

                  <TouchableOpacity
                    style={
                      styles.cancelButton
                    }
                    onPress={() => {

                      setSuppressionOuverte(
                        false,
                      );

                      setRaisonSuppression(
                        '',
                      );

                    }}
                  >

                    <Text
                      style={
                        styles.cancelButtonText
                      }
                    >
                      Annuler
                    </Text>

                  </TouchableOpacity>


                  <TouchableOpacity
                    style={
                      styles.deleteConfirmButton
                    }
                    onPress={
                      supprimerCulture
                    }
                  >

                    <Trash2
                      size={16}
                      color="#FFFFFF"
                    />

                    <Text
                      style={
                        styles.deleteButtonText
                      }
                    >
                      Confirmer
                    </Text>

                  </TouchableOpacity>

                </View>

              </>

            )}

          </View>

        )}


        {/* =================================================
            FOOTER
        ================================================= */}

        <View
          style={
            styles.footer
          }
        >

          <Sprout
            size={17}
            color="#3D7843"
          />

          <Text
            style={
              styles.footerText
            }
          >
            HaiVoly · Gestion agricole
          </Text>

        </View>


      </ScrollView>

    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // =================================================
    // ROOT
    // =================================================

    root: {
      flex: 1,
      backgroundColor:
        '#DCEADB',
      position: 'relative',
    },


    backgroundDecor: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      overflow: 'hidden',
    },


    circleOne: {
      position: 'absolute',
      width: 340,
      height: 340,
      borderRadius: 170,
      backgroundColor: '#89BA8D',
      opacity: 0.18,
      right: -180,
      top: 120,
    },


    circleTwo: {
      position: 'absolute',
      width: 240,
      height: 240,
      borderRadius: 120,
      backgroundColor: '#5D9564',
      opacity: 0.11,
      left: -145,
      top: 500,
    },


    circleThree: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: '#3D7843',
      opacity: 0.08,
      right: -55,
      bottom: 120,
    },


    glowOne: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: '#FFFFFF',
      opacity: 0.25,
      left: -50,
      top: 165,
    },


    glowTwo: {
      position: 'absolute',
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: '#FFFFFF',
      opacity: 0.20,
      right: -25,
      top: 760,
    },


    // =================================================
    // HEADER
    // =================================================

    header: {
      height: 67,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(220,234,219,0.96)',
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(65,100,70,0.10)',
    },


    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        'rgba(255,255,255,0.58)',
    },


    headerTitle: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: 10,
    },


    headerTitleText: {
      fontSize: 17,
      fontWeight: '800',
      color: '#263D2A',
    },


    headerSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color: '#6B7F6D',
      fontWeight: '500',
    },


    // =================================================
    // SCROLL
    // =================================================

    scrollContent: {
      paddingHorizontal: 15,
      paddingTop: 8,
      paddingBottom: 35,
      gap: 13,
    },


    // =================================================
    // MAP
    // =================================================

    mapHero: {
      height: 255,
      borderRadius: 24,
      overflow: 'hidden',
      backgroundColor: '#C7D7C8',

      shadowColor: '#29472D',
      shadowOffset: {
        width: 0,
        height: 7,
      },
      shadowOpacity: 0.12,
      shadowRadius: 14,
      elevation: 4,
    },


    webview: {
      flex: 1,
      backgroundColor: 'transparent',
    },


    gpsBadge: {
      position: 'absolute',
      top: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 13,
      backgroundColor:
        'rgba(27,45,30,0.82)',
    },


    gpsBadgeText: {
      color: '#FFFFFF',
      fontSize: 11,
      fontWeight: '700',
    },


    // =================================================
    // IDENTITÉ
    // =================================================

    identitySection: {
      paddingHorizontal: 3,
      flexDirection: 'row',
      alignItems: 'center',
    },


    identityIcon: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor:
        'rgba(255,255,255,0.72)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },


    identityContent: {
      flex: 1,
      minWidth: 0,
    },


    identityTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#243A28',
    },


    identitySubtitle: {
      marginTop: 2,
      fontSize: 13,
      color: '#657666',
      fontWeight: '600',
    },


    identityMeta: {
      marginTop: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },


    identityMetaText: {
      fontSize: 11,
      color: '#718071',
      fontWeight: '500',
    },


    identityStatus: {
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 11,
      backgroundColor:
        '#D8EEDB',
      marginLeft: 8,
    },


    identityStatusHarvested: {
      backgroundColor: '#EDE5C6',
    },


    identityStatusDeleted: {
      backgroundColor: '#F3D5D2',
    },


    identityStatusText: {
      fontSize: 10,
      color: '#315A36',
      fontWeight: '800',
    },


    // =================================================
    // SECTION HEADER
    // =================================================

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },


    sectionIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#E4F0E5',
      marginRight: 10,
    },


    sectionHeaderText: {
      flex: 1,
      minWidth: 0,
    },


    sectionTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#263B2A',
    },


    sectionSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color: '#7A887C',
    },


    // =================================================
    // DESCRIPTION
    // =================================================

    descriptionCard: {
      borderRadius: 17,
      padding: 16,
      backgroundColor:
        'rgba(245,249,245,0.80)',
      borderWidth: 1,
      borderColor:
        'rgba(78,112,82,0.08)',
    },


    descriptionText: {
      fontSize: 14,
      color: '#59685B',
      lineHeight: 21,
    },


    // =================================================
    // STATS
    // =================================================

    statsCard: {
      minHeight: 112,
      borderRadius: 20,
      paddingVertical: 15,
      paddingHorizontal: 7,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.91)',

      shadowColor: '#35583A',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 2,
    },


    statItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 4,
    },


    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        '#E7F1E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 7,
    },


    statValue: {
      fontSize: 14,
      fontWeight: '800',
      color: '#2D4A31',
    },


    statValueSmall: {
      maxWidth: '100%',
      fontSize: 11,
      fontWeight: '800',
      color: '#2D4A31',
    },


    statLabel: {
      marginTop: 3,
      fontSize: 10,
      color: '#7B897D',
      textAlign: 'center',
    },


    statDivider: {
      width: 1,
      height: 50,
      backgroundColor:
        '#E1E8E2',
    },


    // =================================================
    // TIMELINE
    // =================================================

    timelineCard: {
      borderRadius: 20,
      padding: 16,
      backgroundColor:
        'rgba(255,255,255,0.92)',

      shadowColor: '#35583A',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 2,
    },


    timelineContainer: {
      position: 'relative',
      minHeight: 112,
      marginTop: 2,
      paddingTop: 3,
    },


    timelineLineBackground: {
      position: 'absolute',
      left: '16.66%',
      right: '16.66%',
      top: 18,
      height: 4,
      borderRadius: 4,
      backgroundColor:
        '#DDE5DE',
    },


    timelineLineActive: {
      position: 'absolute',
      left: '16.66%',
      top: 18,
      height: 4,
      borderRadius: 4,
      backgroundColor:
        '#5D9564',
    },


    timelineSteps: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },


    timelineStep: {
      width: '33.33%',
      alignItems: 'center',
    },


    timelineNode: {
      width: 36,
      height: 36,
      borderRadius: 18,
      borderWidth: 3,
      borderColor:
        '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,

      shadowColor: '#35583A',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.12,
      shadowRadius: 4,
      elevation: 2,
    },


    timelineNodeCompleted: {
      backgroundColor:
        '#5D9564',
    },


    timelineNodeCurrent: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginTop: -2,
      backgroundColor:
        '#3D7843',
    },


    timelineNodePending: {
      backgroundColor:
        '#EEF2EE',
      borderColor:
        '#FFFFFF',
    },


    timelineTitle: {
      marginTop: 8,
      fontSize: 11,
      fontWeight: '800',
      color: '#304A34',
      textAlign: 'center',
      textTransform: 'uppercase',
    },


    timelineTitlePending: {
      color: '#8A958B',
    },


    timelineDate: {
      marginTop: 4,
      fontSize: 10,
      fontWeight: '700',
      color: '#68776A',
      textAlign: 'center',
    },


    timelineDescription: {
      marginTop: 2,
      paddingHorizontal: 2,
      fontSize: 9,
      lineHeight: 12,
      color: '#8A958B',
      textAlign: 'center',
    },


    abandonedBanner: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor:
        '#FFF3D6',
    },


    abandonedText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#A15C00',
    },


    deletedBanner: {
      marginTop: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor:
        '#FDECEA',
    },


    deletedText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#B42318',
    },


    // =================================================
    // SECTION CARD
    // =================================================

    sectionCard: {
      borderRadius: 20,
      padding: 16,
      backgroundColor:
        'rgba(255,255,255,0.90)',

      shadowColor: '#35583A',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.06,
      shadowRadius: 11,
      elevation: 2,
    },


    // =================================================
    // PARCELLE
    // =================================================

    parcelleRow: {
      minHeight: 64,
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: 4,
    },


    parcelleIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        '#E7F1E8',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 11,
    },


    parcelleInfo: {
      flex: 1,
      minWidth: 0,
    },


    parcelleTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#2E4431',
    },


    parcelleSubtitle: {
      marginTop: 4,
      fontSize: 11,
      color: '#7A887C',
    },


    // =================================================
    // VOIR
    // =================================================

    seeButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      paddingHorizontal: 5,
      paddingVertical: 5,
    },


    seeButtonText: {
      fontSize: 11,
      fontWeight: '800',
      color: '#3D7843',
    },


    // =================================================
    // EMPTY SECTION
    // =================================================

    emptySection: {
      minHeight: 55,
      borderRadius: 13,
      backgroundColor:
        '#F4F7F4',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 12,
    },


    emptySectionText: {
      fontSize: 12,
      color: '#7D897F',
      textAlign: 'center',
    },


    // =================================================
    // HARVEST
    // =================================================

    harvestCard: {
      borderRadius: 20,
      padding: 16,
      backgroundColor:
        '#FFF9E8',
      borderWidth: 1,
      borderColor:
        '#E8DCA9',
    },


    harvestIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      backgroundColor:
        '#F4EBCB',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    harvestGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 2,
    },


    harvestItem: {
      width: '50%',
      paddingVertical: 9,
      paddingRight: 8,
    },


    harvestLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: '#887B51',
      marginBottom: 3,
    },


    harvestValue: {
      fontSize: 14,
      fontWeight: '800',
      color: '#4D442A',
    },


    harvestDescription: {
      marginTop: 8,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor:
        '#E9DFB9',
    },


    harvestDescriptionText: {
      fontSize: 13,
      color: '#625A3B',
      lineHeight: 20,
    },


    photosContainer: {
      marginTop: 13,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor:
        '#E9DFB9',
    },


    photosList: {
      paddingTop: 7,
      paddingRight: 8,
    },


    recoltePhoto: {
      width: 105,
      height: 105,
      borderRadius: 14,
      marginRight: 9,
      backgroundColor:
        '#E8E2CB',
    },


    // =================================================
    // DÉLIMITATION
    // =================================================

    delimitationStats: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 70,
      borderRadius: 15,
      backgroundColor:
        '#F3F7F3',
    },


    delimitationStat: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },


    delimitationValue: {
      fontSize: 16,
      fontWeight: '800',
      color: '#315936',
    },


    delimitationLabel: {
      marginTop: 3,
      fontSize: 10,
      color: '#7A887C',
    },


    delimitationDivider: {
      width: 1,
      height: 38,
      backgroundColor:
        '#DDE5DE',
    },


    pointsList: {
      marginTop: 12,
      gap: 7,
    },


    pointRow: {
      minHeight: 51,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 10,
      borderRadius: 13,
      backgroundColor:
        '#F7F9F7',
      borderWidth: 1,
      borderColor:
        '#E8EDE8',
    },


    pointIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor:
        '#E5F0E6',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },


    pointInfo: {
      flex: 1,
    },


    pointTitle: {
      fontSize: 12,
      fontWeight: '800',
      color: '#344A37',
    },


    coordinate: {
      marginTop: 2,
      fontSize: 10,
      color: '#7B897D',
    },


    noGPSBox: {
      minHeight: 60,
      borderRadius: 13,
      backgroundColor:
        '#F4F7F4',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },


    noGPSText: {
      fontSize: 12,
      color: '#7B897D',
    },


    // =================================================
    // TECHNIQUE
    // =================================================

    technicalCard: {
      borderRadius: 18,
      padding: 16,
      backgroundColor:
        'rgba(255,255,255,0.72)',
      borderWidth: 1,
      borderColor:
        'rgba(76,108,80,0.08)',
    },


    technicalRow: {
      minHeight: 39,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 15,
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(89,112,92,0.09)',
    },


    technicalLabel: {
      flex: 1,
      fontSize: 12,
      color: '#7A887C',
    },


    technicalValue: {
      flex: 1.5,
      textAlign: 'right',
      fontSize: 12,
      fontWeight: '700',
      color: '#405443',
    },


    // =================================================
    // ACTIONS
    // =================================================

    actionsSection: {
      gap: 9,
    },


    actionsLabel: {
      marginLeft: 3,
      marginBottom: 1,
      fontSize: 11,
      fontWeight: '800',
      letterSpacing: 1,
      color: '#738074',
    },


    primaryAction: {
      minHeight: 53,
      borderRadius: 16,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#3D7843',
    },


    actionIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      backgroundColor:
        'rgba(255,255,255,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    primaryActionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
      color: '#FFFFFF',
    },


    harvestAction: {
      minHeight: 53,
      borderRadius: 16,
      paddingHorizontal: 13,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        '#F4EBCB',
      borderWidth: 1,
      borderColor:
        '#DCCB8E',
    },


    harvestActionIcon: {
      width: 35,
      height: 35,
      borderRadius: 11,
      backgroundColor:
        '#E8DDAF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    harvestActionText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '800',
      color: '#695A24',
    },


    outlineActionLarge: {
      minHeight: 53,
      borderRadius: 16,
      paddingHorizontal: 15,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.74)',
      borderWidth: 1,
      borderColor:
        '#C9DCCB',
      gap: 9,
    },


    outlineAction: {
      minHeight: 51,
      borderRadius: 15,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.68)',
      borderWidth: 1,
      borderColor:
        '#C9DCCB',
      gap: 9,
    },


    outlineActionText: {
      flex: 1,
      fontSize: 13,
      fontWeight: '800',
      color: '#3D7843',
    },


    // =================================================
    // DELETE
    // =================================================

    deleteCard: {
      borderRadius: 18,
      padding: 16,
      backgroundColor:
        'rgba(253,236,234,0.90)',
      borderWidth: 1,
      borderColor:
        '#F1C7C3',
    },


    deleteHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 13,
    },


    deleteIcon: {
      width: 37,
      height: 37,
      borderRadius: 12,
      backgroundColor:
        '#F9D9D5',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },


    deleteHeaderText: {
      flex: 1,
    },


    deleteTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#7F211A',
    },


    deleteSubtitle: {
      marginTop: 2,
      fontSize: 11,
      color: '#A15C55',
    },


    deleteButton: {
      minHeight: 49,
      borderRadius: 13,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor:
        '#B42318',
    },


    deleteButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#FFFFFF',
    },


    reasonLabel: {
      marginBottom: 7,
      fontSize: 12,
      fontWeight: '800',
      color: '#7F211A',
    },


    reasonInput: {
      minHeight: 100,
      borderWidth: 1,
      borderColor:
        '#E5B6B1',
      borderRadius: 13,
      backgroundColor:
        '#FFFFFF',
      paddingHorizontal: 13,
      paddingVertical: 11,
      fontSize: 13,
      color: '#3E3433',
    },


    suppressionActions: {
      marginTop: 10,
      flexDirection: 'row',
      gap: 9,
    },


    cancelButton: {
      flex: 1,
      minHeight: 47,
      borderRadius: 13,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#E9E4E3',
    },


    cancelButtonText: {
      fontSize: 13,
      fontWeight: '800',
      color: '#5F5654',
    },


    deleteConfirmButton: {
      flex: 1,
      minHeight: 47,
      borderRadius: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      backgroundColor:
        '#B42318',
    },


    // =================================================
    // FOOTER
    // =================================================

    footer: {
      minHeight: 45,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 2,
    },


    footerText: {
      fontSize: 11,
      color: '#6E7E70',
      fontWeight: '600',
    },


    // =================================================
    // LOADING
    // =================================================

    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor:
        '#DCEADB',
      gap: 10,
    },


    loadingIcon: {
      width: 58,
      height: 58,
      borderRadius: 19,
      backgroundColor:
        'rgba(255,255,255,0.72)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 3,
    },


    loadingText: {
      fontSize: 13,
      color: '#607061',
      fontWeight: '600',
    },


    // =================================================
    // ERROR
    // =================================================

    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 25,
      backgroundColor:
        '#DCEADB',
    },


    errorIcon: {
      width: 62,
      height: 62,
      borderRadius: 20,
      backgroundColor:
        '#FDECEA',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 14,
    },


    errorTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#3D302F',
      marginBottom: 7,
    },


    errorText: {
      fontSize: 13,
      color: '#766D6B',
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },


    errorBackButton: {
      minHeight: 48,
      paddingHorizontal: 22,
      borderRadius: 14,
      backgroundColor:
        '#3D7843',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
    },


    errorBackText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

  });