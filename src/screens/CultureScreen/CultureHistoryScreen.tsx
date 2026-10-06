/**
 * CultureHistoryScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
/* eslint-disable react/no-unescaped-entities */
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  ActivityIndicator,
 
  Text,
  TouchableOpacity,
  View,
} from 'react-native';


import { styles } from './CultureHistoryScreen.styles';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import type { Culture, PointGPS } from '@/types';

import {
  useCulturesDeParcelle,
  useParcelle,
} from '@/hooks';

import { VueHistoriqueCultures } from '@/components/CultureComponent/VueHistoriqueCultures';
import { culturesApi } from '@/services';
import { logger } from '@/utils/logger';
// =====================================================
// TYPES
// =====================================================

export interface CultureAvecPoints extends Culture {
  pointsGPS: PointGPS[];
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
  } = useCulturesDeParcelle(
    parcelleId,
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

      logger.debug('CultureHistoryScreen', 
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

        logger.debug('CultureHistoryScreen', 
          '📜 Chargement des points GPS de l’historique...',
        );

        const result =
          await Promise.all(

            culturesHistorique.map(
              async (culture) => {

                try {

                  const points =
                    await culturesApi.pointsGPS(
                      parcelleId,
                      culture.id,
                    );

                  logger.debug('CultureHistoryScreen', 
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

                  logger.debug('CultureHistoryScreen', 
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
                    (a.ordre ?? 0) - (b.ordre ?? 0),
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

    <VueHistoriqueCultures
      culturesAvecPoints={culturesAvecPoints}
      culturesFiltreesEtTriees={culturesFiltreesEtTriees}
      culturesHistorique={culturesHistorique}
      delimitationFiltre={delimitationFiltre}
      filtreOuvert={filtreOuvert}
      loadingPoints={loadingPoints}
      mapHtml={mapHtml}
      nombreCulturesDelimitees={nombreCulturesDelimitees}
      parcelle={parcelle}
      parcelleId={parcelleId}
      parcelleNom={parcelleNom}
      recherche={recherche}
      setDelimitationFiltre={setDelimitationFiltre}
      setFiltreOuvert={setFiltreOuvert}
      setRecherche={setRecherche}
      setStatutFiltre={setStatutFiltre}
      setTri={setTri}
      setTriOuvert={setTriOuvert}
      setTypeFiltre={setTypeFiltre}
      statutFiltre={statutFiltre}
      tri={tri}
      triOuvert={triOuvert}
      typeFiltre={typeFiltre}
      typesDisponibles={typesDisponibles}
    />

  );

}

// =====================================================
// STYLES
// =====================================================
