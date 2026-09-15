/* eslint-disable react/no-unescaped-entities, @typescript-eslint/no-unused-vars */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
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
  getPointsGPSCulture,
  PointGPSCulture,
} from '@/api/cultures';

import {
  useCultures,
} from '@/hooks/useCultures';

import {
  useParcelle,
} from '@/hooks/useParcelles';


// =====================================================
// TYPES
// =====================================================

interface CultureAvecPoints extends Culture {
  pointsGPS: PointGPSCulture[];
}


// =====================================================
// ÉCRAN
// =====================================================

export default function HistoriqueCulturesScreen() {

  // ===================================================
  // PARAMÈTRES
  // ===================================================

  const {
    parcelleId,
    parcelleNom,
  } = useLocalSearchParams<{
    parcelleId?: string;
    parcelleNom?: string;
  }>();


  // ===================================================
  // PARCELLE
  // ===================================================

  const {
    data: parcelle,
    isLoading: isLoadingParcelle,
    isError: isErrorParcelle,
    refetch: refetchParcelle,
  } = useParcelle(
    parcelleId ?? '',
  );


  // ===================================================
  // CULTURES
  // ===================================================

  const {
    data: cultures,
    isLoading: isLoadingCultures,
    isError: isErrorCultures,
    refetch: refetchCultures,
  } = useCultures(
    parcelleId ?? '',
  );


  // ===================================================
  // CULTURES AVEC POINTS GPS
  // ===================================================

  const [
    culturesAvecPoints,
    setCulturesAvecPoints,
  ] = useState<CultureAvecPoints[]>([]);


  const [
    loadingPoints,
    setLoadingPoints,
  ] = useState(false);


  const [
    refreshKey,
    setRefreshKey,
  ] = useState(0);


  // ===================================================
  // RECHERCHE / FILTRE / TRI
  // ===================================================

  const [
    recherche,
    setRecherche,
  ] = useState('');


  const [
    filtreOuvert,
    setFiltreOuvert,
  ] = useState(false);


  const [
    triOuvert,
    setTriOuvert,
  ] = useState(false);


  const [
    statutFiltre,
    setStatutFiltre,
  ] = useState('TOUS');


  const [
    typeFiltre,
    setTypeFiltre,
  ] = useState('TOUS');


  const [
    delimitationFiltre,
    setDelimitationFiltre,
  ] = useState('TOUTES');


  const [
    tri,
    setTri,
  ] = useState('NOM_ASC');


  // ===================================================
  // TYPES DISPONIBLES
  // ===================================================

  const typesDisponibles = useMemo(() => {

    if (!cultures) {
      return [];
    }

    const types = cultures
      .filter(
        (culture) =>
          culture.statut === 'RECOLTEE' ||
          culture.statut === 'ABANDONNEE' ||
          culture.statut === 'SUPPRIMEE',
      )
      .map((culture) => culture.type)
      .filter(
        (type): type is string =>
          Boolean(type),
      );

    return Array.from(
      new Set(types),
    );

  }, [
    cultures,
  ]);


  // ===================================================
  // RAFRAÎCHISSEMENT
  // ===================================================

  useFocusEffect(
    useCallback(() => {

      if (!parcelleId) {
        return;
      }

      console.log(
        '🔄 Retour sur historique-cultures.tsx : actualisation...',
      );

      refetchParcelle();
      refetchCultures();

      setRefreshKey(
        previous => previous + 1,
      );

    }, [
      parcelleId,
      refetchParcelle,
      refetchCultures,
    ]),
  );


  // ===================================================
  // RÉCUPÉRER LES POINTS GPS
  // ===================================================

  useEffect(() => {

    let actif = true;


    const chargerPointsGPS = async () => {

      if (
        !parcelleId ||
        !cultures
      ) {

        if (actif) {
          setCulturesAvecPoints([]);
        }

        return;
      }


      const culturesHistorique =
        cultures.filter(
          (culture) =>
            culture.statut === 'RECOLTEE' ||
            culture.statut === 'ABANDONNEE' ||
            culture.statut === 'SUPPRIMEE',
        );


      if (
        culturesHistorique.length === 0
      ) {

        if (actif) {
          setCulturesAvecPoints([]);
        }

        return;
      }


      try {

        setLoadingPoints(true);


        console.log(
          '📜 Chargement des points GPS de l’historique...',
        );


        const result =
          await Promise.all(

            culturesHistorique.map(
              async (culture) => {

                try {

                  const points =
                    await getPointsGPSCulture(
                      parcelleId,
                      culture.id,
                    );


                  console.log(
                    `📜 Historique Culture ${culture.nom}:`,
                    points,
                  );


                  return {
                    ...culture,

                    pointsGPS:
                      points.map(
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
                  };

                } catch (error) {

                  console.log(
                    `ERREUR POINTS GPS HISTORIQUE ${culture.id}:`,
                    error,
                  );


                  return {
                    ...culture,
                    pointsGPS: [],
                  };

                }

              },
            ),
          );


        if (actif) {

          setCulturesAvecPoints(
            result,
          );

        }

      } catch (error) {

        console.error(
          'ERREUR CHARGEMENT POINTS HISTORIQUE:',
          error,
        );

      } finally {

        if (actif) {
          setLoadingPoints(false);
        }

      }

    };


    chargerPointsGPS();


    return () => {
      actif = false;
    };

  }, [
    parcelleId,
    cultures,
    refreshKey,
  ]);


  // ===================================================
  // CENTRE DE LA CARTE
  // ===================================================

  const centreCarte = useMemo(() => {

    if (
      parcelle?.pointsGPS &&
      parcelle.pointsGPS.length > 0
    ) {

      return {
        latitude:
          Number(
            parcelle.pointsGPS[0].latitude,
          ),

        longitude:
          Number(
            parcelle.pointsGPS[0].longitude,
          ),
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
    parcelle,
  ]);


  // ===================================================
  // NOMBRE DE CULTURES DÉLIMITÉES
  // ===================================================

  const nombreCulturesDelimitees =
    culturesAvecPoints.filter(
      (culture) =>
        culture.pointsGPS.length >= 3,
    ).length;


  // ===================================================
  // CULTURES HISTORIQUES
  // ===================================================

  const culturesHistorique =
    useMemo(() => {

      if (!cultures) {
        return [];
      }

      return cultures.filter(
        (culture) =>
          culture.statut === 'RECOLTEE' ||
          culture.statut === 'ABANDONNEE' ||
          culture.statut === 'SUPPRIMEE',
      );

    }, [
      cultures,
    ]);


  // ===================================================
  // RECHERCHE + FILTRE + TRI
  // ===================================================

  const culturesFiltreesEtTriees =
    useMemo(() => {

      let resultat =
        [...culturesHistorique];


      // -----------------------------------------------
      // RECHERCHE
      // -----------------------------------------------

      const rechercheNormalisee =
        recherche
          .trim()
          .toLowerCase();


      if (rechercheNormalisee) {

        resultat =
          resultat.filter(
            (culture) => {

              return (

                culture.nom
                  ?.toLowerCase()
                  .includes(
                    rechercheNormalisee,
                  ) ||

                culture.type
                  ?.toLowerCase()
                  .includes(
                    rechercheNormalisee,
                  ) ||

                culture.variete
                  ?.toLowerCase()
                  .includes(
                    rechercheNormalisee,
                  ) ||

                culture.stade
                  ?.toLowerCase()
                  .includes(
                    rechercheNormalisee,
                  ) ||

                culture.statut
                  ?.toLowerCase()
                  .includes(
                    rechercheNormalisee,
                  )

              );

            },
          );

      }


      // -----------------------------------------------
      // FILTRE STATUT
      // -----------------------------------------------

      if (
        statutFiltre !== 'TOUS'
      ) {

        resultat =
          resultat.filter(
            (culture) =>
              culture.statut ===
              statutFiltre,
          );

      }


      // -----------------------------------------------
      // FILTRE TYPE
      // -----------------------------------------------

      if (
        typeFiltre !== 'TOUS'
      ) {

        resultat =
          resultat.filter(
            (culture) =>
              culture.type ===
              typeFiltre,
          );

      }


      // -----------------------------------------------
      // FILTRE DÉLIMITATION
      // -----------------------------------------------

      if (
        delimitationFiltre !==
        'TOUTES'
      ) {

        resultat =
          resultat.filter(
            (culture) => {

              const points =
                culturesAvecPoints.find(
                  (item) =>
                    item.id ===
                    culture.id,
                )?.pointsGPS ?? [];


              const estDelimitee =
                points.length >= 3;


              if (
                delimitationFiltre ===
                'DELIMITEES'
              ) {
                return estDelimitee;
              }


              if (
                delimitationFiltre ===
                'NON_DELIMITEES'
              ) {
                return !estDelimitee;
              }


              return true;

            },
          );

      }


      // -----------------------------------------------
      // TRI
      // -----------------------------------------------

      resultat.sort(
        (a, b) => {

          switch (tri) {

            case 'NOM_ASC':

              return a.nom.localeCompare(
                b.nom,
                'fr',
              );


            case 'NOM_DESC':

              return b.nom.localeCompare(
                a.nom,
                'fr',
              );


            case 'PLANTATION_RECENTE':

              return (
                new Date(
                  b.datePlantation || 0,
                ).getTime() -
                new Date(
                  a.datePlantation || 0,
                ).getTime()
              );


            case 'PLANTATION_ANCIENNE':

              return (
                new Date(
                  a.datePlantation || 0,
                ).getTime() -
                new Date(
                  b.datePlantation || 0,
                ).getTime()
              );


            case 'MODIFICATION_RECENTE':

              return (
                new Date(
                  b.modifieA || 0,
                ).getTime() -
                new Date(
                  a.modifieA || 0,
                ).getTime()
              );


            case 'MODIFICATION_ANCIENNE':

              return (
                new Date(
                  a.modifieA || 0,
                ).getTime() -
                new Date(
                  b.modifieA || 0,
                ).getTime()
              );


            default:

              return 0;

          }

        },
      );


      return resultat;

    }, [
      culturesHistorique,
      culturesAvecPoints,
      recherche,
      statutFiltre,
      typeFiltre,
      delimitationFiltre,
      tri,
    ]);


  // ===================================================
  // CARTE HTML
  // ===================================================

  const mapHtml = useMemo(() => {

    const pointsParcelle =
      parcelle?.pointsGPS?.map(
        (
          point: any,
          index: number,
        ) => ({

          id:
            point.id ??
            `parcelle-${index}`,

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
      ) ?? [];


    const culturesMap =
      culturesAvecPoints
        .filter(
          (culture) =>
            (
              culture.statut ===
                'RECOLTEE' ||

              culture.statut ===
                'ABANDONNEE' ||

              culture.statut ===
                'SUPPRIMEE'
            ) &&

            culture.pointsGPS &&
            culture.pointsGPS.length >= 3,
        )
        .map(
          (culture) => ({

            id:
              culture.id,

            nom:
              culture.nom,

            statut:
              culture.statut,

            points:
              [...culture.pointsGPS]
                .sort(
                  (a, b) =>
                    a.ordre - b.ordre,
                )
                .map(
                  (point) => ({

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

          }),
        );


    const couleurs = [
      '#1976D2',
      '#F57C00',
      '#7B1FA2',
      '#00838F',
      '#C2185B',
      '#5D4037',
      '#455A64',
      '#388E3C',
    ];


    return `
<!DOCTYPE html>

<html>

<head>

<meta
  name="viewport"
  content="
    width=device-width,
    initial-scale=1.0,
    maximum-scale=1.0
  "
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
></script>

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

  box-shadow:
    0 2px 8px
    rgba(0,0,0,0.25);

  font-size: 13px;

  max-width: 190px;

}

.legend-title {

  font-weight: bold;

  margin-bottom: 7px;

}

.legend-item {

  display: flex;

  align-items: center;

  margin-bottom: 5px;

}

.legend-color {

  width: 14px;
  height: 14px;

  margin-right: 7px;

  border-radius: 3px;

}

.culture-label {

  background: white;

  border: 2px solid #333;

  border-radius: 8px;

  padding: 5px 8px;

  font-size: 13px;

  font-weight: bold;

  white-space: nowrap;

}

</style>

</head>

<body>

<div id="map"></div>

<script>

const pointsParcelle =
  ${JSON.stringify(pointsParcelle)};

const cultures =
  ${JSON.stringify(culturesMap)};

const couleurs =
  ${JSON.stringify(couleurs)};


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


const bounds = [];


if (
  pointsParcelle.length >= 3
) {

  const coordinates =
    pointsParcelle.map(
      function(point) {

        const position = [
          Number(point.latitude),
          Number(point.longitude),
        ];

        bounds.push(position);

        return position;

      }
    );


  const parcellePolygon =
    L.polygon(
      coordinates,
      {

        color: '#2e7d32',

        fillColor: '#2e7d32',

        fillOpacity: 0.12,

        weight: 4,

      }
    ).addTo(map);


  parcellePolygon.bindPopup(
    '<b>Parcelle</b>'
  );

}


cultures.forEach(
  function(culture, index) {

    const couleur =
      couleurs[
        index % couleurs.length
      ];


    const coordinates =
      culture.points.map(
        function(point) {

          const position = [
            Number(point.latitude),
            Number(point.longitude),
          ];

          bounds.push(position);

          return position;

        }
      );


    const polygon =
      L.polygon(
        coordinates,
        {

          color:
            couleur,

          fillColor:
            couleur,

          fillOpacity:
            0.35,

          weight:
            3,

        }
      ).addTo(map);


    polygon.bindPopup(

      '<div style="min-width:150px">' +

      '<b>' +
      culture.nom +
      '</b>' +

      '<br/>' +

      'Statut : ' +
      culture.statut +

      '</div>'

    );


    const center =
      polygon
        .getBounds()
        .getCenter();


    L.marker(
      center,
      {

        interactive: false,

        icon:
          L.divIcon({

            className:
              '',

            html:
              '<div class="culture-label">' +
              culture.nom +
              '</div>',

            iconSize:
              [30, 30],

            iconAnchor:
              [25, 15],

          }),

      }
    ).addTo(map);

  }
);


if (bounds.length > 0) {

  map.fitBounds(
    bounds,
    {
      padding: [30, 30],
    }
  );

}


const legend =
  L.control({
    position:
      'bottomright',
  });


legend.onAdd =
  function() {

    const div =
      L.DomUtil.create(
        'div',
        'legend',
      );


    let html =
      '<div class="legend-title">' +
      'Historique' +
      '</div>';


    html +=
      '<div class="legend-item">' +

      '<div ' +
      'class="legend-color" ' +
      'style="background:#2e7d32">' +
      '</div>' +

      'Parcelle' +

      '</div>';


    cultures.forEach(
      function(
        culture,
        index,
      ) {

        const couleur =
          couleurs[
            index % couleurs.length
          ];


        html +=

          '<div class="legend-item">' +

          '<div ' +
          'class="legend-color" ' +
          'style="background:' +
          couleur +
          '">' +

          '</div>' +

          culture.nom +

          '</div>';

      }
    );


    div.innerHTML =
      html;


    return div;

  };


legend.addTo(map);

</script>

</body>

</html>
    `;

  }, [
    parcelle,
    culturesAvecPoints,
    centreCarte,
  ]);


  // ===================================================
  // CHARGEMENT
  // ===================================================

  if (
    isLoadingParcelle ||
    isLoadingCultures
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

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement de l'historique...
        </Text>

      </View>
    );

  }


  // ===================================================
  // ERREUR
  // ===================================================

  if (
    isErrorParcelle ||
    isErrorCultures
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
          Impossible de récupérer
          les données de l'historique.
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

        {/* ========================================= */}
        {/* TITRE */}
        {/* ========================================= */}

        <Text
          style={
            styles.title
          }
        >
          Historique des cultures
        </Text>


        <Text
          style={
            styles.parcelleName
          }
        >
          Parcelle :{' '}
          {parcelle?.nom ||
            parcelleNom ||
            parcelleId}
        </Text>


        {/* ========================================= */}
        {/* BOUTON RETOUR */}
        {/* ========================================= */}

        <TouchableOpacity
          style={
            styles.backTopButton
          }

          onPress={() =>
            router.back()
          }
        >

          <Text
            style={
              styles.backTopButtonText
            }
          >
            ← Retour aux cultures
          </Text>

        </TouchableOpacity>


        {/* ========================================= */}
        {/* RÉSUMÉ */}
        {/* ========================================= */}

        <View
          style={
            styles.summaryCard
          }
        >

          <View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Historique
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {culturesHistorique.length}
            </Text>

          </View>


          <View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Délimitées
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {nombreCulturesDelimitees}
            </Text>

          </View>


          <View>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Parcelle
            </Text>

            <Text
              style={
                styles.summaryValue
              }
            >
              {parcelle?.superficie != null
                ? `${Number(
                    parcelle.superficie,
                  ).toFixed(0)} m²`
                : '-'}
            </Text>

          </View>

        </View>


        {/* ========================================= */}
        {/* CARTE */}
        {/* ========================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Historique des zones cultivées
        </Text>


        <Text
          style={
            styles.sectionDescription
          }
        >
          La carte affiche la parcelle et les
          anciennes zones des cultures récoltées,
          abandonnées ou supprimées.
        </Text>


        <View
          style={
            styles.mapContainer
          }
        >

          {loadingPoints ? (

            <View
              style={
                styles.mapLoading
              }
            >

              <ActivityIndicator
                size="large"
              />

              <Text>
                Chargement des anciennes délimitations...
              </Text>

            </View>

          ) : (

            <WebView
              key={
                `${parcelleId}-${culturesAvecPoints
                  .map(
                    (c) =>
                      `${c.id}-${c.pointsGPS.length}-${c.statut}`,
                  )
                  .join('-')}`
              }

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

          )}

        </View>


        {/* ========================================= */}
        {/* RECHERCHE */}
        {/* ========================================= */}

        <Text
          style={
            styles.sectionTitle
          }
        >
          Liste historique
        </Text>


        <TextInput
          style={
            styles.searchInput
          }

          placeholder="Rechercher une culture..."

          value={
            recherche
          }

          onChangeText={
            setRecherche
          }

          clearButtonMode="while-editing"
        />


        {/* ========================================= */}
        {/* BOUTONS */}
        {/* ========================================= */}

        <View
          style={
            styles.searchActions
          }
        >

          <TouchableOpacity
            style={[
              styles.filterButton,
              filtreOuvert &&
                styles.activeActionButton,
            ]}

            onPress={() => {

              setFiltreOuvert(
                previous =>
                  !previous,
              );

              setTriOuvert(
                false,
              );

            }}
          >

            <Text
              style={
                styles.filterButtonText
              }
            >
              Filtrer
            </Text>

          </TouchableOpacity>


          <TouchableOpacity
            style={[
              styles.sortButton,
              triOuvert &&
                styles.activeActionButton,
            ]}

            onPress={() => {

              setTriOuvert(
                previous =>
                  !previous,
              );

              setFiltreOuvert(
                false,
              );

            }}
          >

            <Text
              style={
                styles.sortButtonText
              }
            >
              Trier
            </Text>

          </TouchableOpacity>

        </View>


        {/* ========================================= */}
        {/* FILTRE */}
        {/* ========================================= */}

        {filtreOuvert && (

          <View
            style={
              styles.panel
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Filtrer l'historique
            </Text>


            <Text
              style={
                styles.panelLabel
              }
            >
              Statut
            </Text>


            <View
              style={
                styles.optionsContainer
              }
            >

              {[
                'TOUS',
                'RECOLTEE',
                'ABANDONNEE',
                'SUPPRIMEE',
              ].map(
                (statut) => (

                  <TouchableOpacity
                    key={
                      statut
                    }

                    style={[
                      styles.optionButton,

                      statutFiltre ===
                        statut &&
                        styles.optionButtonActive,
                    ]}

                    onPress={() =>
                      setStatutFiltre(
                        statut,
                      )
                    }
                  >

                    <Text
                      style={[
                        styles.optionText,

                        statutFiltre ===
                          statut &&
                          styles.optionTextActive,
                      ]}
                    >
                      {statut ===
                      'TOUS'
                        ? 'Toutes'
                        : statut}
                    </Text>

                  </TouchableOpacity>

                ),
              )}

            </View>


            <Text
              style={
                styles.panelLabel
              }
            >
              Type de culture
            </Text>


            <View
              style={
                styles.optionsContainer
              }
            >

              <TouchableOpacity
                style={[
                  styles.optionButton,

                  typeFiltre ===
                    'TOUS' &&
                    styles.optionButtonActive,
                ]}

                onPress={() =>
                  setTypeFiltre(
                    'TOUS',
                  )
                }
              >

                <Text
                  style={[
                    styles.optionText,

                    typeFiltre ===
                      'TOUS' &&
                      styles.optionTextActive,
                  ]}
                >
                  Tous
                </Text>

              </TouchableOpacity>


              {typesDisponibles.map(
                (type) => (

                  <TouchableOpacity
                    key={
                      type
                    }

                    style={[
                      styles.optionButton,

                      typeFiltre ===
                        type &&
                        styles.optionButtonActive,
                    ]}

                    onPress={() =>
                      setTypeFiltre(
                        type,
                      )
                    }
                  >

                    <Text
                      style={[
                        styles.optionText,

                        typeFiltre ===
                          type &&
                          styles.optionTextActive,
                      ]}
                    >
                      {type}
                    </Text>

                  </TouchableOpacity>

                ),
              )}

            </View>


            <Text
              style={
                styles.panelLabel
              }
            >
              Délimitation GPS
            </Text>


            <View
              style={
                styles.optionsContainer
              }
            >

              {[
                'TOUTES',
                'DELIMITEES',
                'NON_DELIMITEES',
              ].map(
                (option) => (

                  <TouchableOpacity
                    key={
                      option
                    }

                    style={[
                      styles.optionButton,

                      delimitationFiltre ===
                        option &&
                        styles.optionButtonActive,
                    ]}

                    onPress={() =>
                      setDelimitationFiltre(
                        option,
                      )
                    }
                  >

                    <Text
                      style={[
                        styles.optionText,

                        delimitationFiltre ===
                          option &&
                          styles.optionTextActive,
                      ]}
                    >
                      {option ===
                      'TOUTES'
                        ? 'Toutes'
                        : option ===
                          'DELIMITEES'
                        ? 'Délimitées'
                        : 'Non délimitées'}
                    </Text>

                  </TouchableOpacity>

                ),
              )}

            </View>


            <TouchableOpacity
              style={
                styles.resetButton
              }

              onPress={() => {

                setStatutFiltre(
                  'TOUS',
                );

                setTypeFiltre(
                  'TOUS',
                );

                setDelimitationFiltre(
                  'TOUTES',
                );

                setRecherche(
                  '',
                );

              }}
            >

              <Text
                style={
                  styles.resetButtonText
                }
              >
                Réinitialiser les filtres
              </Text>

            </TouchableOpacity>


            <TouchableOpacity
              onPress={() =>
                setFiltreOuvert(
                  false,
                )
              }
            >

              <Text
                style={
                  styles.closeButton
                }
              >
                Fermer
              </Text>

            </TouchableOpacity>

          </View>

        )}


        {/* ========================================= */}
        {/* TRI */}
        {/* ========================================= */}

        {triOuvert && (

          <View
            style={
              styles.panel
            }
          >

            <Text
              style={
                styles.panelTitle
              }
            >
              Trier l'historique
            </Text>


            {[
              {
                value:
                  'NOM_ASC',

                label:
                  'Nom : A → Z',
              },

              {
                value:
                  'NOM_DESC',

                label:
                  'Nom : Z → A',
              },

              {
                value:
                  'PLANTATION_RECENTE',

                label:
                  'Date de plantation : récente → ancienne',
              },

              {
                value:
                  'PLANTATION_ANCIENNE',

                label:
                  'Date de plantation : ancienne → récente',
              },

              {
                value:
                  'MODIFICATION_RECENTE',

                label:
                  'Modification : récente → ancienne',
              },

              {
                value:
                  'MODIFICATION_ANCIENNE',

                label:
                  'Modification : ancienne → récente',
              },

            ].map(
              (option) => (

                <TouchableOpacity
                  key={
                    option.value
                  }

                  style={[
                    styles.sortOption,

                    tri ===
                      option.value &&
                      styles.sortOptionActive,
                  ]}

                  onPress={() => {

                    setTri(
                      option.value,
                    );

                    setTriOuvert(
                      false,
                    );

                  }}
                >

                  <Text
                    style={[
                      styles.sortOptionText,

                      tri ===
                        option.value &&
                        styles.sortOptionTextActive,
                    ]}
                  >

                    {tri ===
                    option.value
                      ? '✓ '
                      : ''}

                    {option.label}

                  </Text>

                </TouchableOpacity>

              ),
            )}

          </View>

        )}


        {/* ========================================= */}
        {/* NOMBRE DE RÉSULTATS */}
        {/* ========================================= */}

        <Text
          style={
            styles.resultCount
          }
        >

          {culturesFiltreesEtTriees.length}{' '}

          {culturesFiltreesEtTriees.length >
          1
            ? 'cultures historiques'
            : 'culture historique'}

        </Text>


        {/* ========================================= */}
        {/* AUCUNE CULTURE */}
        {/* ========================================= */}

        {culturesFiltreesEtTriees.length ===
        0 ? (

          <View
            style={
              styles.emptyCard
            }
          >

            <Text
              style={
                styles.emptyTitle
              }
            >
              {culturesHistorique.length >
              0
                ? 'Aucun résultat'
                : 'Aucun historique'}
            </Text>


            <Text
              style={
                styles.emptyText
              }
            >
              {culturesHistorique.length >
              0
                ? 'Aucune culture ne correspond à votre recherche ou à vos filtres.'
                : 'Cette parcelle ne contient encore aucune culture récoltée, abandonnée ou supprimée.'}
            </Text>

          </View>

        ) : (

          /* ========================================= */
          /* LISTE */
          /* ========================================= */

          culturesFiltreesEtTriees.map(
            (culture) => {

              const culturePoints =
                culturesAvecPoints.find(
                  (item) =>
                    item.id ===
                    culture.id,
                )?.pointsGPS ?? [];


              const estDelimitee =
                culturePoints.length >= 3;


              return (

                <TouchableOpacity
                  key={
                    culture.id
                  }

                  style={
                    styles.cultureCard
                  }

                  onPress={() => {

                    router.push({
                      pathname:
                        '/detail-culture',

                      params: {

                        parcelleId,

                        cultureId:
                          culture.id,

                        parcelleNom:
                          parcelle?.nom ||
                          parcelleNom ||
                          '',

                        cultureNom:
                          culture.nom,

                      },

                    });

                  }}
                >

                  {/* HEADER */}

                  <View
                    style={
                      styles.cultureHeader
                    }
                  >

                    <View
                      style={
                        styles.cultureTitleContainer
                      }
                    >

                      <Text
                        style={
                          styles.cultureName
                        }
                      >
                        {culture.nom}
                      </Text>


                      {culture.type && (

                        <Text
                          style={
                            styles.cultureType
                          }
                        >
                          {culture.type}
                        </Text>

                      )}

                    </View>


                    <View
                      style={[
                        styles.statusBadge,

                        culture.statut ===
                          'RECOLTEE' &&
                          styles.statusRecoltee,

                        culture.statut ===
                          'ABANDONNEE' &&
                          styles.statusAbandonnee,

                        culture.statut ===
                          'SUPPRIMEE' &&
                          styles.statusSupprimee,

                      ]}
                    >

                      <Text
                        style={
                          styles.statusText
                        }
                      >
                        {culture.statut}
                      </Text>

                    </View>

                  </View>


                  {/* VARIÉTÉ */}

                  {culture.variete && (

                    <View
                      style={
                        styles.infoRow
                      }
                    >

                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Variété :
                      </Text>


                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {culture.variete}
                      </Text>

                    </View>

                  )}


                  {/* STADE */}

                  {culture.stade && (

                    <View
                      style={
                        styles.infoRow
                      }
                    >

                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Stade :
                      </Text>


                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {culture.stade}
                      </Text>

                    </View>

                  )}


                  {/* DATE PLANTATION */}

                  {culture.datePlantation && (

                    <View
                      style={
                        styles.infoRow
                      }
                    >

                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Plantation :
                      </Text>


                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {new Date(
                          culture.datePlantation,
                        ).toLocaleDateString(
                          'fr-FR',
                        )}
                      </Text>

                    </View>

                  )}


                  {/* DATE RÉCOLTE PRÉVUE */}

                  {culture.datePrevueRecolte && (

                    <View
                      style={
                        styles.infoRow
                      }
                    >

                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Récolte prévue :
                      </Text>


                      <Text
                        style={
                          styles.infoValue
                        }
                      >
                        {new Date(
                          culture.datePrevueRecolte,
                        ).toLocaleDateString(
                          'fr-FR',
                        )}
                      </Text>

                    </View>

                  )}


                  {/* DÉLIMITATION */}

                  <View
                    style={
                      styles.delimitationRow
                    }
                  >

                    <Text
                      style={
                        styles.delimitationIcon
                      }
                    >
                      {estDelimitee
                        ? '🟢'
                        : '⚪'}
                    </Text>


                    <Text
                      style={
                        estDelimitee
                          ? styles.delimitationOk
                          : styles.delimitationNone
                      }
                    >

                      {estDelimitee

                        ? `${culturePoints.length} points GPS — ancienne zone délimitée`

                        : 'Culture non délimitée'}

                    </Text>

                  </View>


                  {/* DÉTAIL */}

                  <Text
                    style={
                      styles.detailLink
                    }
                  >
                    Voir le détail →
                  </Text>

                </TouchableOpacity>

              );

            },
          )

        )}

      </ScrollView>

    </View>

  );

}


// =====================================================
// STYLES
// =====================================================

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
    gap: 15,
  },


  loadingText: {
    fontSize: 16,
    color: '#555',
  },


  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },


  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },


  parcelleName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },


  backTopButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 15,
  },


  backTopButtonText: {
    color: '#1565c0',
    fontWeight: 'bold',
    fontSize: 14,
  },


  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
  },


  summaryLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },


  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },


  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },


  mapContainer: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#ddd',
  },


  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f5f5',
  },


  searchInput: {
    height: 48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 10,
  },


  searchActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },


  filterButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  sortButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1565c0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  activeActionButton: {
    backgroundColor: '#f0f0f0',
  },


  filterButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },


  sortButtonText: {
    color: '#1565c0',
    fontWeight: 'bold',
  },


  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },


  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },


  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },


  panelLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
    marginBottom: 8,
  },


  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },


  optionButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },


  optionText: {
    fontSize: 12,
    color: '#555',
  },


  optionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },


  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },


  sortOptionActive: {
    backgroundColor: '#e8f5e9',
  },


  sortOptionText: {
    fontSize: 14,
    color: '#444',
  },


  sortOptionTextActive: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },


  resetButton: {
    height: 42,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },


  resetButtonText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 13,
  },


  closeButton: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 12,
    textAlign: 'center',
  },


  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginTop: 5,
  },


  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },


  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },


  cultureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },


  cultureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },


  cultureTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },


  cultureName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
  },


  cultureType: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },


  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },


  statusRecoltee: {
    backgroundColor: '#D4EDDA',
  },


  statusAbandonnee: {
    backgroundColor: '#F8D7DA',
  },


  statusSupprimee: {
    backgroundColor: '#E0E0E0',
  },


  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },


  infoRow: {
    flexDirection: 'row',
    marginTop: 5,
  },


  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 110,
  },


  infoValue: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },


  delimitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },


  delimitationIcon: {
    fontSize: 14,
    marginRight: 7,
  },


  delimitationOk: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: 'bold',
  },


  delimitationNone: {
    fontSize: 13,
    color: '#777',
  },


  detailLink: {
    color: '#1565c0',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'right',
  },


  backButton: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },


  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

});