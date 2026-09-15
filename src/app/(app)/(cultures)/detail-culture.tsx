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
  Culture,
  getCultureById,
  getPointsGPSCulture,
  deleteCulture,
  PointGPSCulture,
} from '@/api/cultures';

import { getParcelleById } from '@/api/parcelles';

import { getRecolte, type Recolte } from '@/api/recoltes';

import { getAreaOfPolygon } from 'geolib';
import { useConfirm } from '@/components/ui/ConfirmProvider';

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
  // ÉTAT SUPPRESSION
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

        console.log(
          '🌾 PARCELLE:',
          parcelleData,
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
  const recolteData = await getRecolte(cultureId);

  console.log('🌾 RÉCOLTE:', recolteData);

  setRecolte(recolteData);
} catch (err: any) {
  // Une culture EN_COURS peut ne pas encore avoir de récolte.
  // Dans ce cas, ce n'est pas une erreur pour l'écran.
  if (err?.response?.status === 404) {
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
  // ACTUALISATION AU RETOUR SUR L'ÉCRAN
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
  // POINTS GPS PARCELLE TRIÉS
  // ===================================================

  const pointsParcelle =
    useMemo(() => {
      if (!parcelle?.pointsGPS) {
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
  // POINTS GPS CULTURE TRIÉS
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
  // SUPPRIMER LA CULTURE
  // ===================================================

  const supprimerCulture = async () => {
    if (!parcelleId || !cultureId) {
      Alert.alert('Erreur', 'Identifiant de culture introuvable.');
      return;
    }
    if (!culture) {
      Alert.alert('Erreur', 'Culture introuvable.');
      return;
    }
    if (culture.statut === 'SUPPRIMEE') {
      Alert.alert('Culture déjà supprimée', 'Cette culture a déjà été supprimée.');
      return;
    }
    if (!raisonSuppression.trim()) {
      Alert.alert('Raison obligatoire', 'Veuillez saisir une raison avant de supprimer la culture.');
      return;
    }

    const ok = await confirm({
      title: `Supprimer "${culture.nom}" ?`,
      description: `Vous êtes sur le point de supprimer définitivement la culture "${culture.nom}". Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      cancelLabel: 'Annuler',
      variant: 'danger',
    });
    if (!ok) return;

    try {
      setLoading(true);
      await deleteCulture(parcelleId, cultureId, { raison: raisonSuppression.trim() });
      setRaisonSuppression('');
      setSuppressionOuverte(false);
      Alert.alert('Succès', 'La culture a été supprimée.', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (err: any) {
      console.error('❌ ERREUR SUPPRESSION CULTURE:', err?.response?.data || err);
      Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de supprimer la culture.');
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // CHARGEMENT
  // ===================================================

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
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
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
  border-radius: 8px;
  box-shadow: 0 1px 5px rgba(0,0,0,0.3);
  font-family: Arial, sans-serif;
  font-size: 13px;
  line-height: 20px;
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


      const estSupprimee =
  culture?.statut === 'SUPPRIMEE';
  // ===================================================
  // AFFICHAGE
  // ===================================================

  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >

        {/* ============================================= */}
        {/* TITRE */}
        {/* ============================================= */}

        <Text
          style={styles.title}
        >
          Détail de la culture
        </Text>


        {/* ============================================= */}
        {/* NOM */}
        {/* ============================================= */}

        <View
          style={
            styles.headerCard
          }
        >
          <Text
            style={
              styles.cultureName
            }
          >
            {culture.nom}
          </Text>

          <Text
            style={
              styles.parcelleName
            }
          >
            Parcelle :{' '}
            {parcelle?.nom ||
              parcelleId}
          </Text>
        </View>


        {/* ============================================= */}
        {/* INFORMATIONS */}
        {/* ============================================= */}

        <View
          style={styles.card}
        >
          <Text
            style={styles.cardTitle}
          >
            Informations
          </Text>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Type
            </Text>

            <Text
              style={styles.infoValue}
            >
              {culture.type ||
                'Non renseigné'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Variété
            </Text>

            <Text
              style={styles.infoValue}
            >
              {culture.variete ||
                'Non renseignée'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Stade
            </Text>

            <Text
              style={styles.infoValue}
            >
              {culture.stade ||
                'Non renseigné'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Statut
            </Text>

            <Text
              style={styles.infoValue}
            >
              {culture.statut}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Plantation
            </Text>

            <Text
              style={styles.infoValue}
            >
              {culture.datePlantation
                ? new Date(
                    culture.datePlantation,
                  ).toLocaleDateString(
                    'fr-FR',
                  )
                : 'Non renseignée'}
            </Text>
          </View>

          <View
            style={styles.infoRow}
          >
            <Text
              style={styles.infoLabel}
            >
              Récolte prévue
            </Text>

            <Text
              style={styles.infoValue}
            >
              {culture.datePrevueRecolte
                ? new Date(
                    culture.datePrevueRecolte,
                  ).toLocaleDateString(
                    'fr-FR',
                  )
                : 'Non renseignée'}
            </Text>
          </View>

          {culture.description && (
            <View
              style={
                styles.descriptionContainer
              }
            >
              <Text
                style={
                  styles.infoLabel
                }
              >
                Description
              </Text>

              <Text
                style={
                  styles.description
                }
              >
                {culture.description}
              </Text>
            </View>
          )}
        </View>


{/* ============================================= */}
{/* RÉCOLTE */}
{/* ============================================= */}

{recolte && (
  <View style={styles.card}>
    <Text style={styles.cardTitle}>
      🌾 Récolte
    </Text>

    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        Date de récolte
      </Text>

      <Text style={styles.infoValue}>
        {new Date(
          recolte.dateRecolte,
        ).toLocaleDateString('fr-FR')}
      </Text>
    </View>

    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>
        Quantité
      </Text>

      <Text style={styles.infoValue}>
        {recolte.quantite} {recolte.unite}
      </Text>
    </View>

    {recolte.prixVente != null && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          Prix de vente
        </Text>

        <Text style={styles.infoValue}>
          {recolte.prixVente} Ar
        </Text>
      </View>
    )}

    {recolte.coutRecolte != null && (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>
          Coût de récolte
        </Text>

        <Text style={styles.infoValue}>
          {recolte.coutRecolte} Ar
        </Text>
      </View>
    )}

    {recolte.description && (
      <View style={styles.descriptionContainer}>
        <Text style={styles.infoLabel}>
          Remarque
        </Text>

        <Text style={styles.description}>
          {recolte.description}
        </Text>
      </View>
    )}

    {/* ========================================= */}
    {/* PHOTOS */}
    {/* ========================================= */}

    {recolte.photos && recolte.photos.length > 0 && (
      <View style={styles.photosContainer}>
        <Text style={styles.infoLabel}>
          📷 Photos de la récolte
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photosList}
        >
          {recolte.photos.map((photo) => (
            <Image
              key={photo.id}
              source={{
                uri: photo.url,
              }}
              style={styles.recoltePhoto}
              resizeMode="cover"
              onLoad={() =>
                console.log(
                  '✅ PHOTO CHARGÉE:',
                  photo.url,
                )
              }
              onError={(event) =>
                console.log(
                  '❌ ERREUR PHOTO:',
                  photo.url,
                  event.nativeEvent,
                )
              }
            />
          ))}
        </ScrollView>
      </View>
    )}
  </View>
)}

        {/* ============================================= */}
        {/* SUPERFICIE PARCELLE */}
        {/* ============================================= */}

        <View
          style={styles.card}
        >
          <Text
            style={styles.cardTitle}
          >
            Superficie de la parcelle
          </Text>

          <Text
            style={styles.areaValue}
          >
            {parcelle?.superficie != null
              ? Number(
                  parcelle.superficie,
                ).toFixed(2)
              : '0.00'}{' '}
            m²
          </Text>

          <Text
            style={
              styles.areaHectare
            }
          >
            {parcelle?.superficie != null
              ? (
                  Number(
                    parcelle.superficie,
                  ) / 10000
                ).toFixed(4)
              : '0.0000'}{' '}
            ha
          </Text>
        </View>


        {/* ============================================= */}
        {/* SUPERFICIE CULTURE */}
        {/* ============================================= */}

        <View
          style={styles.card}
        >
          <Text
            style={styles.cardTitle}
          >
            Superficie de la culture
          </Text>

          {pointsCultureTries.length >=
          3 ? (
            <>
              <Text
                style={
                  styles.areaValueCulture
                }
              >
                {superficieCulture.toFixed(
                  2,
                )}{' '}
                m²
              </Text>

              <Text
                style={
                  styles.areaHectare
                }
              >
                {(
                  superficieCulture /
                  10000
                ).toFixed(4)}{' '}
                ha
              </Text>
            </>
          ) : (
            <Text
              style={
                styles.noDataText
              }
            >
              La culture n'est pas
              encore délimitée.
            </Text>
          )}
        </View>


        {/* ============================================= */}
        {/* CARTE */}
        {/* ============================================= */}

        <View
          style={styles.mapCard}
        >
          <Text
            style={styles.mapTitle}
          >
            Parcelle et délimitation
            de la culture
          </Text>

          <Text
            style={styles.mapDescription}
          >
            Le contour bleu représente
            la parcelle. Le contour vert
            représente la culture.
          </Text>

          <View
            style={styles.map}
          >
            <WebView
              key={mapKey}
              originWhitelist={[
                '*',
              ]}
              javaScriptEnabled={
                true
              }
              source={{
                html: mapHtml,
              }}
            />
          </View>
        </View>


        {/* ============================================= */}
        {/* POINTS GPS */}
        {/* ============================================= */}

        <View
          style={styles.card}
        >
          <Text
            style={styles.cardTitle}
          >
            Points GPS de la culture
          </Text>

          {pointsCultureTries.length ===
          0 ? (
            <Text
              style={
                styles.noDataText
              }
            >
              Aucun point GPS enregistré.
            </Text>
          ) : (
            pointsCultureTries.map(
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
            )
          )}
        </View>


        {/* ============================================= */}
        {/* MODIFIER DÉLIMITATION */}
        {/* ============================================= */}
{culture.statut !== 'RECOLTEE' &&
!estSupprimee && (
        <TouchableOpacity
          style={
            styles.editButton
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
        >
          <Text
            style={
              styles.actionButtonText
            }
          >
            Modifier la délimitation
          </Text>
        </TouchableOpacity>
)}

        {/* ============================================= */}
        {/* ACTIONS */}
        {/* ============================================= */}

        <View
          style={
            styles.actionsContainer
          }
        >

{/* ========================================= */}
{/* RÉCOLTE */}
{/* ========================================= */}

{culture.statut === 'EN_COURS' && !recolte && (
  <TouchableOpacity
    style={styles.recolteButton}
    onPress={() =>
      router.push({
        pathname: '/ajout-recolte',
        params: {
          cultureId,
          parcelleId,
        },
      })
    }
  >
    <Text style={styles.actionButtonText}>
      🌾 Enregistrer la récolte
    </Text>
  </TouchableOpacity>
)}

{culture.statut === 'RECOLTEE' && recolte && (
  <TouchableOpacity
    style={styles.recolteButton}
    onPress={() =>
      router.push({
        pathname: '/recoltes',
        params: {
          cultureId,
          parcelleId,
        },
      })
    }
  >
    <Text style={styles.actionButtonText}>
      ℹ️ Information de récolte
    </Text>
  </TouchableOpacity>
)}

          {/* MODIFIER CULTURE */}
{culture.statut !== 'RECOLTEE' &&
 culture.statut !== 'SUPPRIMEE' &&(
          <TouchableOpacity
            style={
              styles.editButton
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
          >
            <Text
              style={
                styles.actionButtonText
              }
            >
              Modifier la culture
            </Text>
          </TouchableOpacity>
)}


{/* ========================================= */}
{/* INTERVENTIONS AGRICOLES */}
{/* ========================================= */}

{culture.statut !== 'SUPPRIMEE' && (
  <TouchableOpacity
    style={styles.interventionButton}
    onPress={() =>
      router.push({
  pathname: '/interventions-culture',
  params: {
    parcelleId,
    cultureId,
    parcelleNom: parcelle?.nom || '',
    cultureNom: culture.nom,
    statut: culture.statut,
  },
})
    }
  >
    <Text style={styles.actionButtonText}>
      🌱 Gérer les interventions
    </Text>
  </TouchableOpacity>
)}

      {/* ========================================= */}
      {/* OBSERVATIONS AGRICOLES */}
      {/* ========================================= */}
{culture.statut !== 'SUPPRIMEE' && (
  <TouchableOpacity
    style={styles.observationButton}
    onPress={() =>
      router.push({
        pathname: '/observations',
        params: {
          parcelleId,
          cultureId,
          parcelleNom: parcelle?.nom || '',
          cultureNom: culture.nom,
          statut: culture.statut,
        },
      })
    }
  >
    <Text style={styles.observationButtonText}>
      🌿 Gérer les observations
    </Text>
  </TouchableOpacity>
)}

          {/* ========================================= */}
          {/* SUPPRESSION */}
          {/* ========================================= */}

          {culture.statut !== 'RECOLTEE' && 
          culture.statut !== 'SUPPRIMEE' && (
            <View
              style={
                styles.card
              }
            >

              <Text
                style={
                  styles.cardTitle
                }
              >
                Suppression de la
                culture
              </Text>


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
                >
                  <Text
                    style={
                      styles.actionButtonText
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
                    Raison de la
                    suppression *
                  </Text>

                  <TextInput
                    style={
                      styles.reasonInput
                    }
                    placeholder="Ex : Culture abandonnée à cause du manque d'eau"
                    value={
                      raisonSuppression
                    }
                    onChangeText={
                      setRaisonSuppression
                    }
                    multiline
                    numberOfLines={
                      4
                    }
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
                        styles.deleteButton
                      }
                      onPress={
                        supprimerCulture
                      }
                    >
                      <Text
                        style={
                          styles.actionButtonText
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

        </View>


        {/* ============================================= */}
        {/* RETOUR */}
        {/* ============================================= */}

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#f5f5f5',
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    // ================================================
    // LOADING
    // ================================================

    loadingContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      gap: 15,
    },

    loadingText: {
      fontSize: 16,
      color: '#555',
    },

    // ================================================
    // ERREUR
    // ================================================

    errorContainer: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 25,
    },

    errorTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
    },

    errorText: {
      fontSize: 16,
      color: '#666',
      textAlign: 'center',
      marginBottom: 20,
    },

    // ================================================
    // TITRE
    // ================================================

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 15,
    },

    // ================================================
    // HEADER
    // ================================================

    headerCard: {
      backgroundColor:
        '#e8f5e9',
      borderRadius: 10,
      padding: 18,
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        '#c8e6c9',
    },

    cultureName: {
      fontSize: 24,
      fontWeight: 'bold',
      color: '#2e7d32',
    },

    parcelleName: {
      fontSize: 15,
      color: '#555',
      marginTop: 6,
    },

    // ================================================
    // CARTE INFORMATION
    // ================================================

    card: {
      backgroundColor:
        '#fff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
    },

    cardTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      marginBottom: 14,
    },

    // ================================================
    // INFORMATIONS
    // ================================================

    infoRow: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      paddingVertical: 9,
      borderBottomWidth: 1,
      borderBottomColor:
        '#eee',
      gap: 10,
    },

    infoLabel: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#555',
      flex: 1,
    },

    infoValue: {
      fontSize: 15,
      color: '#222',
      flex: 1,
      textAlign: 'right',
    },

    descriptionContainer: {
      marginTop: 15,
    },

    description: {
      marginTop: 7,
      fontSize: 15,
      color: '#444',
      lineHeight: 22,
    },

    // ================================================
    // SUPERFICIE
    // ================================================

    areaValue: {
      fontSize: 25,
      fontWeight: 'bold',
      color: '#1565c0',
    },

    areaValueCulture: {
      fontSize: 25,
      fontWeight: 'bold',
      color: '#2e7d32',
    },

    areaHectare: {
      fontSize: 14,
      color: '#666',
      marginTop: 4,
    },

    noDataText: {
      fontSize: 15,
      color: '#777',
    },

    // ================================================
    // CARTE
    // ================================================

    mapCard: {
      backgroundColor:
        '#fff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor: '#ddd',
    },

    mapTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      marginBottom: 5,
    },

    mapDescription: {
      fontSize: 14,
      color: '#666',
      marginBottom: 12,
      lineHeight: 20,
    },

    map: {
      width: '100%',
      height: 500,
      borderRadius: 10,
      overflow: 'hidden',
    },

    // ================================================
    // POINTS GPS
    // ================================================

    pointCard: {
      backgroundColor:
        '#f8f8f8',
      borderRadius: 8,
      padding: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor:
        '#e0e0e0',
    },

    pointTitle: {
      fontSize: 17,
      fontWeight: 'bold',
      color: '#2e7d32',
      marginBottom: 5,
    },

    coordinate: {
      fontSize: 14,
      color: '#444',
      marginTop: 3,
    },

    // ================================================
    // ACTIONS
    // ================================================

    actionsContainer: {
      marginBottom: 15,
      gap: 10,
    },

    editButton: {
      minHeight: 50,
      borderRadius: 10,
      backgroundColor:
        '#2e7d32',
      justifyContent:
        'center',
      alignItems: 'center',
      marginTop: 5,
      marginBottom: 10,
      paddingHorizontal: 12,
    },

    deleteButton: {
      minHeight: 50,
      borderRadius: 10,
      backgroundColor:
        '#c62828',
      justifyContent:
        'center',
      alignItems: 'center',
      paddingHorizontal: 12,
      flex: 1,
    },

    actionButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },

    // ================================================
    // SUPPRESSION
    // ================================================

    reasonLabel: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#555',
      marginBottom: 8,
    },

    reasonInput: {
      minHeight: 100,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      backgroundColor: '#fff',
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },

    suppressionActions: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },

    cancelButton: {
      flex: 1,
      minHeight: 50,
      borderRadius: 10,
      backgroundColor:
        '#e0e0e0',
      justifyContent:
        'center',
      alignItems: 'center',
    },

    cancelButtonText: {
      color: '#333',
      fontSize: 16,
      fontWeight: 'bold',
    },

    // ================================================
    // RETOUR
    // ================================================

    backButton: {
      height: 50,
      borderRadius: 10,
      backgroundColor:
        '#1565c0',
      justifyContent:
        'center',
      alignItems: 'center',
      marginTop: 5,
    },

    backButtonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },

    interventionButton: {
  minHeight: 50,
  borderRadius: 10,
  backgroundColor: '#558b2f',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 5,
  marginBottom: 10,
  paddingHorizontal: 12,
},

observationButton: {
  backgroundColor: '#f0fdf4',
  borderWidth: 1,
  borderColor: '#86efac',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
},

observationButtonText: {
  color: '#15803d',
  fontSize: 16,
  fontWeight: '700',
},

recolteButton: {
  minHeight: 50,
  borderRadius: 10,
  backgroundColor: '#8d6e63',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 5,
  marginBottom: 10,
  paddingHorizontal: 12,
},

photosContainer: {
  marginTop: 16,
},

photosList: {
  paddingTop: 10,
  paddingRight: 10,
},

recoltePhoto: {
  width: 120,
  height: 120,
  borderRadius: 10,
  marginRight: 10,
},
  });
