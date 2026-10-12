 
import { i18n } from '@/i18n/instance';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { WebView } from 'react-native-webview';


import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { useQueries } from '@tanstack/react-query';


import {
  queryKeys,
  useCulturesDeParcelle,
  useParcelle,
  useParcelles,
} from '@/hooks';

import { colors } from '@/theme';


import { styles } from './CultureListScreen.styles';

import { CultureAvecPoints, CultureCarte, CultureToutesParcelles, FiltreCulture, texteCulture } from '@/screens/CultureScreen/CultureListScreen.helpers';

import { ModalChoixParcelle } from '@/components/CultureComponent/ModalChoixParcelle';
import { VueCultureParcelle } from '@/components/CultureComponent/VueCultureParcelle';
import { VueToutesParcelles } from '@/components/CultureComponent/VueToutesParcelles';
import { culturesApi } from '@/services';
import { asItems } from '@/utils/api';
import { logger } from '@/utils/logger';


const FILTRES: FiltreCulture[] = [
  'TOUTES',
  'PLANIFIEE',
  'EN_COURS',
  'RECOLTEE',
  'ABANDONNEE',
  'SUPPRIMEE',
];


export default function CulturesScreen() {


  const {
    parcelleId,
    parcelleNom,
  } =
    useLocalSearchParams<{
      parcelleId?: string;
      parcelleNom?: string;
    }>();


  const {
    data: parcelle,
    isLoading:
      isLoadingParcelle,
    isError:
      isErrorParcelle,
    refetch:
      refetchParcelle,
  } =
    useParcelle(
      parcelleId ?? '',
    );


  const {
    data: cultures,
    isLoading:
      isLoadingCultures,
    isError:
      isErrorCultures,
    refetch:
      refetchCultures,
  } =
    useCulturesDeParcelle(
      parcelleId,
    );


  const {
    data: parcellesPage,
    isLoading:
      isLoadingParcelles,
    isError:
      isErrorParcelles,
    refetch:
      refetchParcelles,
  } =
    useParcelles({ limit: 200 });

  /** `useParcelles` renvoie une page paginée : l'écran travaille sur la liste. */
  const parcelles = useMemo(
    () => parcellesPage?.items ?? [],
    [parcellesPage],
  );


  const culturesToutesParcellesQueries =
    useQueries({
      queries:
        (parcelles ?? []).map(
          (item) => ({
            queryKey:
              queryKeys.culturesParcelle(item.id),

            queryFn: () =>
              culturesApi.listByParcelle(item.id, { limit: 200 }).then(asItems),

            enabled:
              !parcelleId &&
              !!item.id,
          }),
        ),
    });

  const culturesQueriesVersion =
    culturesToutesParcellesQueries
      .map(
        (query) =>
          query.dataUpdatedAt,
      )
      .join('|');

  const toutesLesCultures =
    useMemo<
      CultureToutesParcelles[]
    >(() => {

      if (
        !parcelles ||
        parcelles.length === 0
      ) {
        return [];
      }

      const resultat:
        CultureToutesParcelles[] =
        [];

      parcelles.forEach(
        (
          item,
          index,
        ) => {

          const culturesParcelle =
            culturesToutesParcellesQueries[
              index
            ]?.data;

          if (
            !culturesParcelle
          ) {
            return;
          }

          culturesParcelle.forEach(
            (culture) => {

              resultat.push({
                ...culture,

                parcelleNom:
                  item.nom,

                pointsGPS: [],
              });

            },
          );

        },
      );

      return resultat;

    }, [
      parcelles,
      culturesQueriesVersion,
    ]);

  const isLoadingToutesLesCultures =
    !parcelleId &&
    (
      isLoadingParcelles ||
      culturesToutesParcellesQueries.some(
        (query) =>
          query.isLoading,
      )
    );

  const isErrorToutesLesCultures =
    !parcelleId &&
    culturesToutesParcellesQueries.some(
      (query) =>
        query.isError,
    );


  const [
    ajoutCultureModalOuvert,
    setAjoutCultureModalOuvert,
  ] =
    useState(false);

  const [
    parcellePourAjout,
    setParcellePourAjout,
  ] =
    useState<string | null>(
      null,
    );

  const ouvrirModalAjoutCulture =
    useCallback(() => {

      setParcellePourAjout(
        parcelleId ?? null,
      );

      setAjoutCultureModalOuvert(
        true,
      );

    }, [
      parcelleId,
    ]);


  const choisirParcellePourAjout =
    useCallback(
      (id: string) => {

        const selected =
          parcelles?.find(
            (item) =>
              item.id === id,
          );

        if (!selected) {
          return;
        }

        setParcellePourAjout(
          id,
        );

        setAjoutCultureModalOuvert(
          false,
        );

        router.push({
          pathname:
            '/ajout-culture',

          params: {
            parcelleId:
              selected.id,

            parcelleNom:
              selected.nom,
          },
        });

      },
      [
        parcelles,
      ],
    );


  const [
    culturesAvecPoints,
    setCulturesAvecPoints,
  ] =
    useState<
      CultureAvecPoints[]
    >([]);

  const [
    loadingPoints,
    setLoadingPoints,
  ] =
    useState(false);

  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);


  const [
    recherche,
    setRecherche,
  ] =
    useState('');


  const [
    filtreOuvert,
    setFiltreOuvert,
  ] =
    useState(false);

  const [
    statutFiltre,
    setStatutFiltre,
  ] =
    useState<FiltreCulture>(
      'TOUTES',
    );


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  const onRefresh =
    useCallback(
      async () => {

        setRefreshing(true);

        try {

          if (parcelleId) {

            await Promise.all([
              refetchParcelle(),
              refetchCultures(),
            ]);

            setRefreshKey(
              (previous) =>
                previous + 1,
            );

          } else {

            await Promise.all([
              refetchParcelles(),
              ...culturesToutesParcellesQueries.map(
                (query) =>
                  query.refetch(),
              ),
            ]);

            setRefreshKey(
              (previous) =>
                previous + 1,
            );
          }

        } finally {

          setRefreshing(false);

        }

      },
      [
        parcelleId,
        refetchParcelle,
        refetchCultures,
        refetchParcelles,
        culturesToutesParcellesQueries,
      ],
    );


  useFocusEffect(
    useCallback(() => {

      if (!parcelleId) {
        return;
      }

      refetchParcelle();
      refetchCultures();

      setRefreshKey(
        (previous) =>
          previous + 1,
      );

    }, [
      parcelleId,
      refetchParcelle,
      refetchCultures,
    ]),
  );


  useEffect(() => {

    let actif = true;

    const chargerPointsGPS =
      async () => {

        try {

          setLoadingPoints(
            true,
          );


          if (parcelleId) {

            if (
              !cultures ||
              cultures.length === 0
            ) {

              if (actif) {

                setCulturesAvecPoints(
                  [],
                );

              }

              return;
            }

            const result =
              await Promise.all(
                cultures.map(
                  async (
                    culture,
                  ) => {

                    try {

                      const points =
                        await culturesApi.pointsGPS(
                          parcelleId,
                          culture.id,
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

                      logger.debug('CultureListScreen', 
                        `Erreur GPS culture ${culture.id}`,
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

            return;
          }


          if (
            toutesLesCultures.length ===
            0
          ) {

            if (actif) {

              setCulturesAvecPoints(
                [],
              );

            }

            return;
          }

          const resultGlobal:
            CultureAvecPoints[] =
            await Promise.all(
              toutesLesCultures.map(
                async (culture) => {

                  try {

                    if (
                      !culture.parcelleId
                    ) {

                      return {
                        ...culture,
                        pointsGPS: [],
                      };

                    }

                    const points =
                      await culturesApi.pointsGPS(
                        culture.parcelleId,
                        culture.id,
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

                    logger.debug('CultureListScreen', 
                      `Erreur GPS culture ${culture.id}`,
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
              resultGlobal,
            );

          }

        } catch {

          logger.warn('CultureListScreen', 'Échec du chargement des tracés GPS');

          if (actif) {

            setCulturesAvecPoints(
              [],
            );

          }

        } finally {

          if (actif) {

            setLoadingPoints(
              false,
            );

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
    toutesLesCultures,
    refreshKey,
  ]);


  const centreCarte =
    useMemo(() => {

      if (
        parcelle?.pointsGPS &&
        parcelle.pointsGPS.length > 0
      ) {

        return {
          latitude:
            Number(
              parcelle
                .pointsGPS[0]
                .latitude,
            ),

          longitude:
            Number(
              parcelle
                .pointsGPS[0]
                .longitude,
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
        latitude:
          -18.8792,

        longitude:
          47.5079,
      };

    }, [
      parcelle,
    ]);


  const nombreCulturesDelimitees =
    culturesAvecPoints.filter(
      (culture) =>
        culture.pointsGPS.length >=
        3,
    ).length;


  const culturesSource =
    useMemo<
      CultureToutesParcelles[]
    >(() => {

      if (parcelleId) {

        return (
          cultures ?? []
        ).map(
          (culture) => {

            const gps =
              culturesAvecPoints.find(
                (item) =>
                  item.id ===
                  culture.id,
              );

            return {
              ...culture,

              parcelleNom:
                parcelle?.nom ??
                parcelleNom ??
                '',

              pointsGPS:
                gps?.pointsGPS ??
                [],
            };

          },
        );

      }

      return toutesLesCultures.map(
        (culture) => {

          const gps =
            culturesAvecPoints.find(
              (item) =>
                item.id ===
                culture.id,
            );

          return {
            ...culture,

            pointsGPS:
              gps?.pointsGPS ??
              [],
          };

        },
      );

    }, [
      parcelleId,
      cultures,
      culturesAvecPoints,
      parcelle,
      parcelleNom,
      toutesLesCultures,
    ]);


  const culturesFiltrees =
    useMemo(() => {

      let resultat =
        [...culturesSource];

      const q =
        recherche
          .trim()
          .toLowerCase();

      if (q) {

        resultat =
          resultat.filter(
            (culture) =>
              texteCulture(
                culture,
              ).includes(q),
          );

      }

      if (
        statutFiltre !==
        'TOUTES'
      ) {

        resultat =
          resultat.filter(
            (culture) =>
              culture.statut ===
              statutFiltre,
          );

      }

      resultat.sort(
        (a, b) =>
          new Date(
            b.modifieA ?? 0,
          ).getTime() -
          new Date(
            a.modifieA ?? 0,
          ).getTime(),
      );

      return resultat;

    }, [
      culturesSource,
      recherche,
      statutFiltre,
    ]);


  const statistiques =
    useMemo(() => {

      const total =
        culturesSource.length;

      const enCours =
        culturesSource.filter(
          (culture) =>
            culture.statut ===
            'EN_COURS',
        ).length;

      const planifiees =
        culturesSource.filter(
          (culture) =>
            culture.statut ===
            'PLANIFIEE',
        ).length;

      return {
        total,
        enCours,
        planifiees,
      };

    }, [
      culturesSource,
    ]);


  const webViewRef =
    useRef<WebView>(
      null,
    );

  const [
    mapReady,
    setMapReady,
  ] =
    useState(false);


  const culturesCarte =
    useMemo<CultureCarte[]>(() => {

      return culturesAvecPoints
        .filter(
          (culture) =>
            culture.pointsGPS &&
            culture.pointsGPS.length >=
              3,
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
              [
                ...culture.pointsGPS,
              ]
                .sort(
                  (a, b) =>
                    (a.ordre ?? 0) -
                    (b.ordre ?? 0),
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

    }, [
      culturesAvecPoints,
    ]);


  const envoyerCulturesVersCarte =
    useCallback(() => {

      if (
        !webViewRef.current ||
        !mapReady
      ) {
        return;
      }

      const message =
        JSON.stringify({
          type:
            'UPDATE_CULTURES',

          cultures:
            culturesCarte,
        });

      webViewRef.current.postMessage(
        message,
      );

    }, [
      mapReady,
      culturesCarte,
    ]);


  useEffect(() => {

    envoyerCulturesVersCarte();

  }, [
    envoyerCulturesVersCarte,
  ]);


  const mapHtml =
    useMemo(() => {

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

      return `
<!DOCTYPE html>

<html>

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  font-size: 13px;
  max-width: 180px;
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

.map-status {
  background: rgba(255,255,255,0.92);
  padding: 7px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  font-size: 12px;
  font-weight: 700;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const pointsParcelle =
  ${JSON.stringify(pointsParcelle)};

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

const map =
  L.map(
    'map',
    {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      minZoom: 5,
      maxZoom: 22,
    }
  ).setView(
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


const parcelleBounds = [];

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

        parcelleBounds.push(position);

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
    '<b>{i18n.t('libelles.parcelle')}</b>'
  );

}


let cultureLayers = [];
let cultureMarkers = [];
let currentCultures = [];


const legend =
  L.control({
    position: 'bottomright',
  });

legend.onAdd =
  function() {

    const div =
      L.DomUtil.create(
        'div',
        'legend',
      );

    div.innerHTML =
      '<div class="legend-title">${i18n.t('divers.legende')}</div>' +
      '<div class="legend-item">' +
      '<div class="legend-color" style="background:#2e7d32"></div>' +
      i18n.t('libelles.parcelle') +
      '</div>';

    return div;

  };

legend.addTo(map);


function mettreAJourLegende(
  cultures
) {

  const container =
    document.querySelector(
      '.legend'
    );

  if (!container) {
    return;
  }

  let html =
    '<div class="legend-title">${i18n.t('divers.legende')}</div>';

  html +=
    '<div class="legend-item">' +
    '<div class="legend-color" style="background:#2e7d32"></div>' +
    i18n.t('libelles.parcelle') +
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
        '<div class="legend-color" style="background:' +
        couleur +
        '"></div>' +
        culture.nom +
        '</div>';

    }
  );

  container.innerHTML =
    html;

}


function supprimerCulturesExistantes() {

  cultureLayers.forEach(
    function(layer) {

      try {
        map.removeLayer(layer);
      } catch {
      }

    }
  );

  cultureMarkers.forEach(
    function(marker) {

      try {
        map.removeLayer(marker);
      } catch {
      }

    }
  );

  cultureLayers = [];
  cultureMarkers = [];

}


function afficherCultures(
  cultures
) {

  currentCultures =
    Array.isArray(cultures)
      ? cultures
      : [];

  supprimerCulturesExistantes();

  const bounds = [];

  parcelleBounds.forEach(
    function(position) {

      bounds.push(position);

    }
  );

  currentCultures.forEach(
    function(
      culture,
      index,
    ) {

      if (
        !culture ||
        !Array.isArray(
          culture.points,
        ) ||
        culture.points.length <
          3
      ) {
        return;
      }

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

            bounds.push(
              position
            );

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
        '<div style="min-width:140px">' +
        '<b>' +
        culture.nom +
        '</b>' +
        '<br/>' +
        'Statut : ' +
        culture.statut +
        '</div>'
      );

      cultureLayers.push(
        polygon,
      );

      const center =
        polygon
          .getBounds()
          .getCenter();

      const marker =
        L.marker(
          center,
          {
            interactive:
              false,

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

      cultureMarkers.push(
        marker,
      );

    }
  );

  mettreAJourLegende(
    currentCultures,
  );

  if (
    bounds.length > 0
  ) {

    map.fitBounds(
      bounds,
      {
        padding:
          [30, 30],
      }
    );

  } else if (
    pointsParcelle.length === 0
  ) {

    map.setView(
      [
        ${centreCarte.latitude},
        ${centreCarte.longitude}
      ],
      18
    );

  }

}


function traiterMessage(
  event
) {

  try {

    const raw =
      event.data;

    if (!raw) {
      return;
    }

    const data =
      typeof raw === 'string'
        ? JSON.parse(raw)
        : raw;

    if (
      data &&
      data.type ===
        'UPDATE_CULTURES'
    ) {

      afficherCultures(
        data.cultures,
      );

    }

  } catch {

    logger.warn('CultureListScreen', "Échec de l'affichage du message de carte");

  }

}


window.addEventListener(
  'message',
  traiterMessage,
);

document.addEventListener(
  'message',
  traiterMessage,
);


if (
  pointsParcelle.length === 0
) {

  map.setView(
    [
      ${centreCarte.latitude},
      ${centreCarte.longitude}
    ],
    18
  );

} else {

  map.fitBounds(
    parcelleBounds,
    {
      padding:
        [30, 30],
    }
  );

}

</script>

</body>

</html>
      `;

    }, [
      parcelle,
      centreCarte,
    ]);


  const modalChoixParcelle = (
    <VueCultureParcelle
      ajoutCultureModalOuvert={ajoutCultureModalOuvert}
      choisirParcellePourAjout={choisirParcellePourAjout}
      isErrorParcelles={isErrorParcelles}
      isLoadingParcelles={isLoadingParcelles}
      parcellePourAjout={parcellePourAjout}
      parcelles={parcelles}
      setAjoutCultureModalOuvert={setAjoutCultureModalOuvert}
    />
  );


  if (!parcelleId) {

    return (
      <VueToutesParcelles
        FILTRES={FILTRES}
        culturesFiltrees={culturesFiltrees}
        filtreOuvert={filtreOuvert}
        isErrorToutesLesCultures={isErrorToutesLesCultures}
        isLoadingToutesLesCultures={isLoadingToutesLesCultures}
        modalChoixParcelle={modalChoixParcelle}
        onRefresh={onRefresh}
        ouvrirModalAjoutCulture={ouvrirModalAjoutCulture}
        recherche={recherche}
        refetchParcelles={refetchParcelles}
        refreshing={refreshing}
        setFiltreOuvert={setFiltreOuvert}
        setRecherche={setRecherche}
        setStatutFiltre={setStatutFiltre}
        statistiques={statistiques}
        statutFiltre={statutFiltre}
      />
    );
  }


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
          color={
            colors.primary[500]
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement des cultures...
        </Text>

      </View>
    );
  }


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
          Impossible de récupérer les données.
        </Text>

        <Pressable
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

        </Pressable>

      </View>
    );
  }


  return (
    <ModalChoixParcelle
      FILTRES={FILTRES}
      cultures={cultures}
      culturesFiltrees={culturesFiltrees}
      filtreOuvert={filtreOuvert}
      loadingPoints={loadingPoints}
      mapHtml={mapHtml}
      modalChoixParcelle={modalChoixParcelle}
      nombreCulturesDelimitees={nombreCulturesDelimitees}
      onRefresh={onRefresh}
      ouvrirModalAjoutCulture={ouvrirModalAjoutCulture}
      parcelle={parcelle}
      parcelleId={parcelleId}
      parcelleNom={parcelleNom}
      recherche={recherche}
      refreshing={refreshing}
      setFiltreOuvert={setFiltreOuvert}
      setMapReady={setMapReady}
      setRecherche={setRecherche}
      setStatutFiltre={setStatutFiltre}
      statutFiltre={statutFiltre}
      webViewRef={webViewRef}
    />
  );
}

