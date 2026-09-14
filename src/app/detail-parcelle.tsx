import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { router, useLocalSearchParams } from 'expo-router';
import { useParcelle } from '@/hooks/useParcelles';

const formatSuperficie = (superficie?: number) => {
  if (superficie === undefined || superficie === null) {
    return null;
  }

  return {
    m2: superficie,
    are: superficie / 100,
    ha: superficie / 10000,
  };
};

export default function DetailParcelleScreen() {
  const { parcelleId } = useLocalSearchParams<{
    parcelleId: string;
  }>();

  const {
    data: parcelle,
    isLoading,
    isError,
    refetch,
  } = useParcelle(parcelleId);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text>Chargement de la parcelle...</Text>
      </View>
    );
  }

  if (isError || !parcelle) {
    return (
      <View style={styles.center}>
        <Text>Impossible de récupérer la parcelle.</Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => refetch()}
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const superficie = formatSuperficie(parcelle.superficie);

const pointsGPS = (parcelle.pointsGPS || []).map(
  (point, index) => ({
    id: point.id,
    ordre: point.ordre ?? index + 1,
    latitude: Number(point.latitude),
    longitude: Number(point.longitude),
  }),
);

const mapLatitude =
  pointsGPS.length > 0
    ? pointsGPS[0].latitude
    : parcelle.latitude;

const mapLongitude =
  pointsGPS.length > 0
    ? pointsGPS[0].longitude
    : parcelle.longitude;

const canShowMap =
  mapLatitude !== undefined &&
  mapLongitude !== undefined;

  console.log(
  'DETAIL PARCELLE:',
  JSON.stringify(parcelle, null, 2),
);

const isDeleted = parcelle?.statut === 'SUPPRIMEE';

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Détail de la parcelle
        </Text>

        {/* NOM */}
        <View style={styles.card}>
          <Text style={styles.label}>Nom</Text>

          <Text style={styles.nom}>
            {parcelle.nom}
          </Text>
        </View>

        {/* STATUT */}
        <View style={styles.card}>
          <Text style={styles.label}>Statut</Text>

          <Text style={styles.value}>
            {parcelle.statut}
          </Text>
        </View>

        {/* RAISON DE SUPPRESSION */}
        {parcelle.statut === 'SUPPRIMEE' &&
          parcelle.raisonSuppression && (
            <View style={styles.suppressionCard}>
              <Text style={styles.label}>
                Raison de suppression
              </Text>

              <Text style={styles.value}>
                {parcelle.raisonSuppression}
              </Text>
            </View>
          )}

        {/* DESCRIPTION */}
        {parcelle.description && (
          <View style={styles.card}>
            <Text style={styles.label}>
              Description
            </Text>

            <Text style={styles.value}>
              {parcelle.description}
            </Text>
          </View>
        )}

        {/* SUPERFICIE */}
        {superficie && (
          <View style={styles.card}>
            <Text style={styles.label}>
              Superficie
            </Text>

            <Text style={styles.value}>
              {superficie.m2.toFixed(2)} m²
            </Text>

            <Text style={styles.value}>
              {superficie.are.toFixed(2)} a
            </Text>

            <Text style={styles.value}>
              {superficie.ha.toFixed(4)} ha
            </Text>
          </View>
        )}

        {/* TYPE DE SOL */}
        {parcelle.typeSol && (
          <View style={styles.card}>
            <Text style={styles.label}>
              Type de sol
            </Text>

            <Text style={styles.value}>
              {parcelle.typeSol}
            </Text>
          </View>
        )}

        {/* COORDONNEES GPS */}
        {(parcelle.latitude !== undefined ||
          parcelle.longitude !== undefined) && (
          <View style={styles.card}>
            <Text style={styles.label}>
              Coordonnées GPS
            </Text>

            {parcelle.latitude !== undefined && (
              <Text style={styles.value}>
                Latitude : {parcelle.latitude}
              </Text>
            )}

            {parcelle.longitude !== undefined && (
              <Text style={styles.value}>
                Longitude : {parcelle.longitude}
              </Text>
            )}
          </View>
        )}

        {/* DATES */}
        {parcelle.creeA && (
          <View style={styles.card}>
            <Text style={styles.label}>
              Informations
            </Text>

            <Text style={styles.value}>
              Créée le :{' '}
              {new Date(
                parcelle.creeA,
              ).toLocaleString()}
            </Text>

            {parcelle.modifieA && (
              <Text style={styles.value}>
                Modifiée le :{' '}
                {new Date(
                  parcelle.modifieA,
                ).toLocaleString()}
              </Text>
            )}
          </View>
        )}

        {/* ================================================= */}
{/* CARTE ET DELIMITATION GPS */}
{/* ================================================= */}

{canShowMap && (
  <View style={styles.card}>
    <Text style={styles.label}>
      Carte et délimitation GPS
    </Text>

    <View style={styles.map}>
      <WebView
        originWhitelist={['*']}
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
    ${mapLatitude},
    ${mapLongitude}
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
// AFFICHER LES POINTS GPS
// =====================================================

points.forEach(function(point) {

  const marker =
    L.marker(
      [
        point.latitude,
        point.longitude
      ]
    )
    .addTo(map);


  marker.bindPopup(

    '<b>P' +
    point.ordre +
    '</b><br>' +
    'Latitude : ' +
    point.latitude +
    '<br>' +
    'Longitude : ' +
    point.longitude

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


  // ===============================================
  // CENTRER LA CARTE SUR TOUTE LA PARCELLE
  // ===============================================

  const bounds =
    L.latLngBounds(coordinates);

  map.fitBounds(
    bounds,
    {
      padding: [30, 30],
    }
  );

}

</script>

</body>

</html>
          `,
        }}
      />
    </View>
  </View>
)}

{isDeleted ? (
  <Text style={{ color: '#d32f2f' }}>
    Cette parcelle est supprimée et ne peut plus être modifiée.
  </Text>
) : (
  <TouchableOpacity
    style={styles.editGpsButton}
    onPress={() =>
      router.push({
        pathname: '/delimiter-parcelle',
        params: {
          parcelleId: parcelle.id,
          mode: 'EDIT',
        },
      })
    }
  >
    <Text style={styles.editGpsButtonText}>
      Modifier la délimitation GPS
    </Text>
  </TouchableOpacity>
)}

        {/* POINTS GPS */}
{parcelle.pointsGPS && parcelle.pointsGPS.length > 0 && (
  <View style={styles.card}>
    <Text style={styles.label}>
      Points de délimitation GPS
    </Text>

    {parcelle.pointsGPS.map((point, index) => (
      <View
        key={point.id}
        style={styles.pointRow}
      >
        <Text style={styles.pointTitle}>
          P{index + 1}
        </Text>

        <Text style={styles.value}>
          Latitude : {point.latitude}
        </Text>

        <Text style={styles.value}>
          Longitude : {point.longitude}
        </Text>
      </View>
    ))}
  </View>
)}

      {/* ================================================= */}
{/* GESTION DES CULTURES */}
{/* ================================================= */}

<TouchableOpacity
  style={styles.culturesButton}
  onPress={() =>
    router.push({
      pathname: '/cultures',
      params: {
        parcelleId: parcelle.id,
        parcelleNom: parcelle.nom,
      },
    })
  }
>
  <Text style={styles.culturesButtonText}>
    Voir les cultures
  </Text>
</TouchableOpacity>

      </ScrollView>

      <TouchableOpacity
        style={styles.backButtonBottom}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>
          Retour
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  content: {
    paddingBottom: 100,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 15,
  },

  culturesButton: {
  marginTop: 12,
  marginBottom: 12,
  backgroundColor: '#2e7d32',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
},

culturesButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  map: {
  width: '100%',
  height: 300,
  borderRadius: 12,
  overflow: 'hidden',
},

editGpsButton: {
  marginTop: 12,
  backgroundColor: '#2e7d32',
  paddingVertical: 14,
  borderRadius: 10,
  alignItems: 'center',
},

editGpsButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

warningText: {
  marginTop: 10,
  fontSize: 14,
  color: '#777',
},

  card: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    marginBottom: 12,
  },

  pointRow: {
  paddingTop: 10,
  marginTop: 10,
  borderTopWidth: 1,
  borderTopColor: '#ddd',
},

pointTitle: {
  fontSize: 16,
  fontWeight: 'bold',
  marginBottom: 4,
},

  suppressionCard: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#ffebee',
    marginBottom: 12,
  },

  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#555',
  },

  nom: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  value: {
    fontSize: 16,
    marginTop: 4,
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backButtonBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});