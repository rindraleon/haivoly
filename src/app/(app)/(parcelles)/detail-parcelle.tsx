import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { WebView } from 'react-native-webview';

import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  Layers,
  Map,
  MapPinned,
  MoreVertical,
  Navigation,
  Ruler,
  Sprout,
} from 'lucide-react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { useParcelle } from '@/hooks/useParcelles';
import { useCultures } from '@/hooks/useCultures';

import { colors } from '@/design/tokens';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';

/* ============================================================
   TYPES
============================================================ */

type PointGPS = {
  id?: string;
  ordre?: number;
  latitude: number;
  longitude: number;
};

type CultureItem = {
  id: string;
  nom: string;
  type?: string | null;
  variete?: string | null;
  stade?: string | null;
  statut:
    | 'PLANIFIEE'
    | 'EN_COURS'
    | 'RECOLTEE'
    | 'ABANDONNEE'
    | 'SUPPRIMEE';
  datePlantation?: string | null;
  datePrevueRecolte?: string | null;
  description?: string | null;
  superficie?: number | null;
};

/* ============================================================
   HELPERS
============================================================ */

const formatSuperficie = (
  superficie?: number | null,
) => {
  if (
    superficie === undefined ||
    superficie === null
  ) {
    return null;
  }

  const valeur = Number(
    superficie,
  );

  if (!Number.isFinite(valeur)) {
    return null;
  }

  return {
    m2: valeur,
    are: valeur / 100,
    ha: valeur / 10000,
  };
};

const formatDateShort = (
  date?: string | null,
) => {
  if (!date) {
    return null;
  }

  const value = new Date(date);

  if (
    Number.isNaN(
      value.getTime(),
    )
  ) {
    return null;
  }

  return value.toLocaleDateString(
    'fr-FR',
    {
      day: '2-digit',
      month: 'short',
    },
  );
};

const formatDateLong = (
  date?: string | null,
) => {
  if (!date) {
    return '—';
  }

  const value = new Date(date);

  if (
    Number.isNaN(
      value.getTime(),
    )
  ) {
    return '—';
  }

  return value.toLocaleDateString(
    'fr-FR',
  );
};

const formatCultureStatus = (
  statut: CultureItem['statut'],
) => {
  switch (statut) {
    case 'EN_COURS':
      return 'EN COURS';

    case 'PLANIFIEE':
      return 'PLANIFIÉE';

    case 'RECOLTEE':
      return 'RÉCOLTÉE';

    case 'ABANDONNEE':
      return 'ABANDONNÉE';

    case 'SUPPRIMEE':
      return 'SUPPRIMÉE';

    default:
      return statut;
  }
};

const getCultureBadgeVariant = (
  statut: CultureItem['statut'],
) => {
  switch (statut) {
    case 'EN_COURS':
      return 'success';

    case 'PLANIFIEE':
      return 'warning';

    case 'RECOLTEE':
      return 'neutral';

    case 'ABANDONNEE':
      return 'error';

    case 'SUPPRIMEE':
      return 'error';

    default:
      return 'neutral';
  }
};

/* ============================================================
   SCREEN
============================================================ */

export default function DetailParcelleScreen() {
  /* ==========================================================
     PARAMÈTRES
  ========================================================== */

  const {
    parcelleId,
  } = useLocalSearchParams<{
    parcelleId?: string;
  }>();

  /* ==========================================================
     PARCELLE
  ========================================================== */

  const {
    data: parcelle,
    isLoading,
    isError,
    refetch,
  } = useParcelle(
    parcelleId ?? '',
  );

  /* ==========================================================
     CULTURES
  ========================================================== */

  const culturesQuery =
    useCultures(
      parcelleId ?? '',
    );

  const cultures =
    (culturesQuery.data ??
      []) as CultureItem[];

  /* ==========================================================
     LOADING
  ========================================================== */

  if (isLoading) {
    return (
      <LoadingState
        message="Chargement de la parcelle..."
      />
    );
  }

  /* ==========================================================
     ERROR
  ========================================================== */

  if (
    isError ||
    !parcelle
  ) {
    return (
      <ErrorState
        title="Parcelle introuvable"
        message="Impossible de récupérer les informations de cette parcelle."
        onRetry={() =>
          refetch()
        }
        onBack={() =>
          router.back()
        }
      />
    );
  }

  /* ==========================================================
     DONNÉES
  ========================================================== */

  const superficie =
    formatSuperficie(
      parcelle.superficie,
    );

  const pointsGPS: PointGPS[] =
    [...(parcelle.pointsGPS ?? [])]
      .sort(
        (a, b) =>
          (a.ordre ?? 0) -
          (b.ordre ?? 0),
      )
      .map(
        (
          point,
          index,
        ) => ({
          id:
            point.id ??
            `point-${index + 1}`,

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
      )
      .filter(
        (point) =>
          Number.isFinite(
            point.latitude,
          ) &&
          Number.isFinite(
            point.longitude,
          ),
      );

  const isDeleted =
    parcelle.statut ===
    'SUPPRIMEE';

  /* ==========================================================
     CENTRE CARTE
  ========================================================== */

  let mapCenter:
    | {
        latitude: number;
        longitude: number;
      }
    | null = null;

  if (
    pointsGPS.length > 0
  ) {
    const totalLatitude =
      pointsGPS.reduce(
        (
          total,
          point,
        ) =>
          total +
          point.latitude,
        0,
      );

    const totalLongitude =
      pointsGPS.reduce(
        (
          total,
          point,
        ) =>
          total +
          point.longitude,
        0,
      );

    mapCenter = {
      latitude:
        totalLatitude /
        pointsGPS.length,

      longitude:
        totalLongitude /
        pointsGPS.length,
    };
  } else if (
    parcelle.latitude != null &&
    parcelle.longitude != null
  ) {
    mapCenter = {
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

  /* ==========================================================
     CULTURES VISIBLES
  ========================================================== */

  const culturesVisibles =
    cultures
      .filter(
        (culture) =>
          culture.statut !==
          'SUPPRIMEE',
      )
      .slice(0, 4);

  /* ==========================================================
     ACTIVITÉ RÉCENTE
  ========================================================== */

  const activities: {
    id: string;
    type: string;
    description: string;
    date: string;
  }[] = [];

  cultures
    .filter(
      (culture) =>
        culture.statut !==
        'SUPPRIMEE',
    )
    .forEach(
      (culture) => {
        if (
          culture.datePlantation
        ) {
          activities.push({
            id:
              `plantation-${culture.id}`,

            type:
              'Plantation',

            description:
              culture.nom,

            date:
              culture.datePlantation,
          });
        }
      },
    );

  activities.sort(
    (a, b) =>
      new Date(
        b.date,
      ).getTime() -
      new Date(
        a.date,
      ).getTime(),
  );

  const activitiesRecentes =
    activities.slice(
      0,
      5,
    );

  /* ==========================================================
     CARTE HTML
  ========================================================== */

  const mapHtml =
    !mapCenter
      ? `
<!DOCTYPE html>
<html>
<head>
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <style>
    html,
    body,
    #map {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #dfeee0;
    }
  </style>
</head>

<body>
  <div id="map"></div>
</body>
</html>
      `
      : `
<!DOCTYPE html>
<html>
<head>

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0, maximum-scale=1.0"
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
    overflow: hidden;
    background: #e7efe7;
  }

  /* =====================================================
     CONTROLES EN HAUT À DROITE
     Layers au-dessus
     Zoom juste en dessous
  ===================================================== */

  .leaflet-top.leaflet-right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    margin-top: 10px;
    margin-right: 10px;
  }

  .leaflet-top.leaflet-right .leaflet-control {
    margin: 0 !important;
    float: none !important;
  }

  /* =====================================================
     SELECTEUR STANDARD / SATELLITE
  ===================================================== */

  .leaflet-control-layers {
    border: none !important;
    border-radius: 12px !important;
    overflow: hidden;
    box-shadow:
      0 4px 14px
      rgba(0,0,0,.16) !important;
  }

  .leaflet-control-layers-toggle {
    width: 36px !important;
    height: 36px !important;
    background-size: 20px 20px !important;
  }

  /* =====================================================
     ZOOM + / -
  ===================================================== */

  .leaflet-control-zoom {
    border: none !important;
    overflow: hidden;
    border-radius: 12px !important;
    box-shadow:
      0 4px 14px
      rgba(0,0,0,.16) !important;
  }

  .leaflet-control-zoom a {
    width: 36px !important;
    height: 36px !important;
    line-height: 36px !important;
    border: none !important;
    color: #244b28 !important;
    font-size: 20px !important;
    font-weight: 700 !important;
  }

  /* =====================================================
     POINTS GPS
  ===================================================== */

  .point-marker {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: #2e7d32;
    border: 3px solid #ffffff;
    box-shadow:
      0 2px 8px
      rgba(0,0,0,.22);
  }

</style>

</head>

<body>

<div id="map"></div>

<script>

  const points =
    ${JSON.stringify(
      pointsGPS,
    )};

  const map =
  L.map(
    'map',
    {
      zoomControl: false,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      minZoom: 5,
      maxZoom: 22,
    }
  ).setView(
      [
        ${mapCenter.latitude},
        ${mapCenter.longitude}
      ],
      17
    );

  const standard =
    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; OpenStreetMap',
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

  const layersControl =
  L.control.layers(
    {
      '🗺️ Standard':
        standard,

      '🛰️ Satellite':
        satellite,
    },
    null,
    {
      position:
        'topright',
    }
  );

layersControl.addTo(map);

L.control.zoom({
  position:
    'topright',
}).addTo(map);

  points.forEach(
    function(point) {

      const icon =
        L.divIcon({
          className:
            '',
          html:
            '<div class="point-marker"></div>',
          iconSize:
            [24, 24],
          iconAnchor:
            [12, 12],
        });

      const marker =
        L.marker(
          [
            point.latitude,
            point.longitude
          ],
          {
            icon,
          }
        ).addTo(map);

      marker.bindPopup(
        '<b>P' +
        point.ordre +
        '</b><br>' +
        point.latitude.toFixed(6) +
        ', ' +
        point.longitude.toFixed(6)
      );

    }
  );

  if (
    points.length >= 3
  ) {

    const coordinates =
      points.map(
        function(point) {
          return [
            point.latitude,
            point.longitude
          ];
        }
      );

    L.polygon(
      coordinates,
      {
        color:
          '#256b2b',

        fillColor:
          '#4caf50',

        fillOpacity:
          0.28,

        weight:
          3,
      }
    ).addTo(map);

    const bounds =
      L.latLngBounds(
        coordinates,
      );

    map.fitBounds(
      bounds,
      {
        padding:
          [28, 28],

        maxZoom:
          19,
      }
    );
  }

</script>

</body>
</html>
`;

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <View
      style={
        styles.root
      }
    >

      {/* =====================================================
          BACKGROUND AGRICOLE
      ===================================================== */}

      <View
        pointerEvents="none"
        style={
          styles.backgroundDecor
        }
      >

        <View
          style={
            styles.backgroundCircleOne
          }
        />

        <View
          style={
            styles.backgroundCircleTwo
          }
        />

        <View
          style={
            styles.backgroundCircleThree
          }
        />

        <View
          style={
            styles.backgroundGlowOne
          }
        />

        <View
          style={
            styles.backgroundGlowTwo
          }
        />

      </View>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={
          styles.header
        }
      >

        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() =>
            router.back()
          }
          style={
            styles.headerButton
          }
        >
          <ArrowLeft
            size={20}
            color="#19321E"
            strokeWidth={
              2.3
            }
          />
        </TouchableOpacity>

        <View
          style={
            styles.headerCenter
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Détail parcelle
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Informations du terrain
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.75}
          style={
            styles.headerButton
          }
        >
          <MoreVertical
            size={20}
            color="#19321E"
            strokeWidth={
              2.2
            }
          />
        </TouchableOpacity>

      </View>

      {/* =====================================================
          SCROLL
      ===================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ===================================================
            CARTE PRINCIPALE
        =================================================== */}

        <View
          style={
            styles.mapHero
          }
        >

          {mapCenter ? (
            <WebView
              originWhitelist={[
                '*',
              ]}
              javaScriptEnabled
              source={{
                html:
                  mapHtml,
              }}
              style={
                styles.mapWebView
              }
            />
          ) : (
            <View
              style={
                styles.emptyMap
              }
            >

              <View
                style={
                  styles.emptyMapIcon
                }
              >
                <MapPinned
                  size={25}
                  color={
                    colors.primary[700]
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyMapTitle
                }
              >
                Aucune localisation GPS
              </Text>

              <Text
                style={
                  styles.emptyMapText
                }
              >
                Cette parcelle ne possède
                pas encore de coordonnées
                permettant d'afficher la carte.
              </Text>

            </View>
          )}

          {/* BADGE GPS */}

          <View
            style={
              styles.mapGpsBadge
            }
          >
            <Navigation
              size={13}
              color="#FFFFFF"
            />

            <Text
              style={
                styles.mapGpsBadgeText
              }
            >
              {pointsGPS.length}{' '}
              points
            </Text>
          </View>

          {/* INFOS SUR LA CARTE */}

          <View
            style={
              styles.mapOverlay
            }
          >

            <View
              style={
                styles.mapOverlayIdentity
              }
            >

              <View
                style={
                  styles.mapOverlayIcon
                }
              >
                <Sprout
                  size={17}
                  color="#FFFFFF"
                />
              </View>

              <View
                style={
                  styles.mapOverlayText
                }
              >

                <Text
                  style={
                    styles.mapOverlayName
                  }
                  numberOfLines={1}
                >
                  {parcelle.nom}
                </Text>

                <Text
                  style={
                    styles.mapOverlaySoil
                  }
                  numberOfLines={1}
                >
                  {parcelle.typeSol ||
                    'Sol non renseigné'}
                </Text>

              </View>

            </View>

            <Badge
              label={
                parcelle.statut
              }
              variant={
                parcelle.statut ===
                'ACTIVE'
                  ? 'success'
                  : parcelle.statut ===
                      'SUPPRIMEE'
                    ? 'error'
                    : 'warning'
              }
              dot
            />

          </View>

        </View>

        {/* ===================================================
            IDENTITÉ
        =================================================== */}

        <View
          style={
            styles.identitySection
          }
        >

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
              {parcelle.nom}
            </Text>

            <View
              style={
                styles.identityMeta
              }
            >

              {parcelle.typeSol ? (
                <>
                  <Layers
                    size={13}
                    color="#69766C"
                  />

                  <Text
                    style={
                      styles.identityMetaText
                    }
                  >
                    {parcelle.typeSol}
                  </Text>
                </>
              ) : null}

              {parcelle.typeSol &&
              superficie ? (
                <View
                  style={
                    styles.identityDot
                  }
                />
              ) : null}

              {superficie ? (
                <Text
                  style={
                    styles.identityMetaText
                  }
                >
                  {superficie.ha.toFixed(
                    2,
                  )}{' '}
                  ha
                </Text>
              ) : null}

            </View>

          </View>

          <Badge
            label={
              parcelle.statut
            }
            variant={
              parcelle.statut ===
              'ACTIVE'
                ? 'success'
                : parcelle.statut ===
                    'SUPPRIMEE'
                  ? 'error'
                  : 'warning'
            }
            dot
          />

        </View>

        {/* ===================================================
            DESCRIPTION
        =================================================== */}

        {parcelle.description ? (
          <View
            style={
              styles.descriptionCard
            }
          >
            <Text
              style={
                styles.descriptionLabel
              }
            >
              À propos de cette parcelle
            </Text>

            <Text
              style={
                styles.descriptionText
              }
            >
              {parcelle.description}
            </Text>
          </View>
        ) : null}

        {/* ===================================================
            SUPPRESSION
        =================================================== */}

        {isDeleted &&
        parcelle.raisonSuppression ? (
          <View
            style={
              styles.deletedCard
            }
          >

            <View
              style={
                styles.deletedBar
              }
            />

            <View
              style={
                styles.deletedContent
              }
            >

              <Text
                style={
                  styles.deletedTitle
                }
              >
                Parcelle supprimée
              </Text>

              <Text
                style={
                  styles.deletedText
                }
              >
                {parcelle.raisonSuppression}
              </Text>

            </View>

          </View>
        ) : null}

        {/* ===================================================
            STATISTIQUES
        =================================================== */}

        <View
          style={
            styles.statsCard
          }
        >

          {/* SUPERFICIE */}

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={[
                styles.statIcon,
                styles.statIconGreen,
              ]}
            >
              <Ruler
                size={17}
                color={
                  colors.primary[700]
                }
              />
            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {superficie
                ? `${superficie.ha.toFixed(
                    2,
                  )} ha`
                : '—'}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Superficie
            </Text>

          </View>

          <View
            style={
              styles.statDivider
            }
          />

          {/* GPS */}

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={[
                styles.statIcon,
                styles.statIconBlue,
              ]}
            >
              <Navigation
                size={17}
                color="#3D6E9D"
              />
            </View>

            <Text
              style={
                styles.statValue
              }
            >
              {pointsGPS.length}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Points GPS
            </Text>

          </View>

          <View
            style={
              styles.statDivider
            }
          />

          {/* STATUT */}

          <View
            style={
              styles.statItem
            }
          >

            <View
              style={[
                styles.statIcon,
                styles.statIconNeutral,
              ]}
            >
              <MapPinned
                size={17}
                color="#657269"
              />
            </View>

            <Text
              style={
                styles.statStatus
              }
            >
              {parcelle.statut ===
              'ACTIVE'
                ? '●'
                : '—'}
            </Text>

            <Text
              style={
                styles.statLabel
              }
            >
              Statut
            </Text>

          </View>

        </View>

        {/* ===================================================
            LOCALISATION
        =================================================== */}

        <Card
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
                styles.sectionIconGreen
              }
            >
              <Navigation
                size={17}
                color={
                  colors.primary[700]
                }
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
                Localisation
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Position de la parcelle
              </Text>

            </View>

          </View>

          <View
            style={
              styles.locationBox
            }
          >

            <View
              style={
                styles.locationTop
              }
            >
              <MapPinned
                size={16}
                color={
                  colors.primary[700]
                }
              />

              <Text
                style={
                  styles.locationPlace
                }
              >
                Localisation GPS
              </Text>
            </View>

            <Text
              style={
                styles.coordinates
              }
            >
              {parcelle.latitude !=
                  null &&
              parcelle.longitude !=
                  null
                ? `${Number(
                    parcelle.latitude,
                  ).toFixed(
                    5,
                  )}, ${Number(
                    parcelle.longitude,
                  ).toFixed(5)}`
                : 'Coordonnées non renseignées'}
            </Text>

            {pointsGPS.length >
            0 ? (
              <Text
                style={
                  styles.coordinatesHint
                }
              >
                {pointsGPS.length}{' '}
                points utilisés pour
                la délimitation
              </Text>
            ) : null}

          </View>

        </Card>

        {/* ===================================================
            CULTURES
        =================================================== */}

        <Card
          style={
            styles.sectionCard
          }
        >

          <View
            style={
              styles.sectionHeaderRow
            }
          >

            <View
              style={
                styles.sectionHeader
              }
            >

              <View
                style={
                  styles.sectionIconGreen
                }
              >
                <Sprout
                  size={17}
                  color={
                    colors.primary[700]
                  }
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
                  Cultures
                </Text>

                <Text
                  style={
                    styles.sectionSubtitle
                  }
                >
                  Cultures présentes
                </Text>
              </View>

            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname:
                    '/cultures',
                  params: {
                    parcelleId:
                      parcelle.id,
                    parcelleNom:
                      parcelle.nom,
                  },
                } as any)
              }
              style={
                styles.seeAllButton
              }
            >

              <Text
                style={
                  styles.seeAllText
                }
              >
                Voir tout
              </Text>

              <ChevronRight
                size={16}
                color={
                  colors.primary[700]
                }
              />

            </TouchableOpacity>

          </View>

          {culturesQuery.isLoading ? (
            <View
              style={
                styles.cultureLoading
              }
            >
              <Text
                style={
                  styles.cultureLoadingText
                }
              >
                Chargement des cultures...
              </Text>
            </View>
          ) : culturesVisibles.length ===
            0 ? (
            <View
              style={
                styles.emptyCulture
              }
            >

              <View
                style={
                  styles.emptyCultureIcon
                }
              >
                <Sprout
                  size={21}
                  color={
                    colors.primary[700]
                  }
                />
              </View>

              <Text
                style={
                  styles.emptyCultureTitle
                }
              >
                Aucune culture
              </Text>

              <Text
                style={
                  styles.emptyCultureText
                }
              >
                Cette parcelle ne possède
                pas encore de culture.
              </Text>

            </View>
          ) : (
            <View
              style={
                styles.culturesList
              }
            >

              {culturesVisibles.map(
                (
                  culture,
                  index,
                ) => (
                  <TouchableOpacity
                    key={
                      culture.id
                    }
                    activeOpacity={
                      0.78
                    }
                    onPress={() =>
                      router.push({
                        pathname:
                          '/detail-culture',
                        params: {
                          parcelleId:
                            parcelle.id,
                          cultureId:
                            culture.id,
                        },
                      } as any)
                    }
                    style={[
                      styles.cultureRow,

                      index <
                        culturesVisibles.length -
                          1 &&
                        styles.cultureRowBorder,
                    ]}
                  >

                    <View
                      style={
                        styles.cultureIcon
                      }
                    >
                      <Sprout
                        size={18}
                        color={
                          colors.primary[700]
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.cultureContent
                      }
                    >

                      <Text
                        style={
                          styles.cultureName
                        }
                        numberOfLines={
                          1
                        }
                      >
                        {culture.nom}
                      </Text>

                      <View
                        style={
                          styles.cultureMeta
                        }
                      >

                        {culture.type ? (
                          <Text
                            style={
                              styles.cultureType
                            }
                            numberOfLines={
                              1
                            }
                          >
                            {culture.type}
                          </Text>
                        ) : null}

                        {culture.superficie !=
                          null ? (
                          <>
                            {culture.type ? (
                              <View
                                style={
                                  styles.cultureMetaDot
                                }
                              />
                            ) : null}

                            <Text
                              style={
                                styles.cultureArea
                              }
                            >
                              {(
                                Number(
                                  culture.superficie,
                                ) /
                                10000
                              ).toFixed(
                                2,
                              )}{' '}
                              ha
                            </Text>
                          </>
                        ) : null}

                      </View>

                    </View>

                    <View
                      style={
                        styles.cultureRight
                      }
                    >

                      <Badge
                        label={formatCultureStatus(
                          culture.statut,
                        )}
                        variant={getCultureBadgeVariant(
                          culture.statut,
                        )}
                      />

                      <ChevronRight
                        size={17}
                        color="#9AA59B"
                      />

                    </View>

                  </TouchableOpacity>
                ),
              )}

            </View>
          )}

          {cultures.filter(
            (culture) =>
              culture.statut !==
              'SUPPRIMEE',
          ).length > 4 ? (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                router.push({
                  pathname:
                    '/cultures',
                  params: {
                    parcelleId:
                      parcelle.id,
                    parcelleNom:
                      parcelle.nom,
                  },
                } as any)
              }
              style={
                styles.moreCultures
              }
            >

              <Text
                style={
                  styles.moreCulturesText
                }
              >
                Voir toutes les cultures
              </Text>

              <ChevronRight
                size={16}
                color={
                  colors.primary[700]
                }
              />

            </TouchableOpacity>
          ) : null}

        </Card>

        {/* ===================================================
            ACTIVITÉ RÉCENTE
        =================================================== */}

        <Card
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
                styles.sectionIconNeutral
              }
            >
              <Map
                size={17}
                color="#657269"
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
                Activité récente
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Dernières activités enregistrées
              </Text>

            </View>

          </View>

          {activitiesRecentes.length ===
          0 ? (
            <View
              style={
                styles.emptyActivity
              }
            >

              <Text
                style={
                  styles.emptyActivityTitle
                }
              >
                Aucune activité récente
              </Text>

              <Text
                style={
                  styles.emptyActivityText
                }
              >
                Les activités apparaîtront
                ici dès qu'une activité
                sera enregistrée.
              </Text>

            </View>
          ) : (
            <View
              style={
                styles.activityList
              }
            >

              {activitiesRecentes.map(
                (
                  activity,
                  index,
                ) => {

                  const isLast =
                    index ===
                    activitiesRecentes.length -
                      1;

                  return (
                    <View
                      key={
                        activity.id
                      }
                      style={
                        styles.activityRow
                      }
                    >

                      <View
                        style={
                          styles.timeline
                        }
                      >

                        <View
                          style={
                            styles.timelineDot
                          }
                        />

                        {!isLast ? (
                          <View
                            style={
                              styles.timelineLine
                            }
                          />
                        ) : null}

                      </View>

                      <View
                        style={
                          styles.activityContent
                        }
                      >

                        <View
                          style={
                            styles.activityTop
                          }
                        >

                          <Text
                            style={
                              styles.activityType
                            }
                          >
                            {activity.type}
                          </Text>

                          <Text
                            style={
                              styles.activityDate
                            }
                          >
                            {formatDateShort(
                              activity.date,
                            )}
                          </Text>

                        </View>

                        <Text
                          style={
                            styles.activityDescription
                          }
                          numberOfLines={
                            1
                          }
                        >
                          {activity.description}
                        </Text>

                      </View>

                    </View>
                  );
                },
              )}

            </View>
          )}

        </Card>

        {/* ===================================================
            INFORMATIONS TECHNIQUES
        =================================================== */}

        <Card
          style={
            styles.technicalCard
          }
        >

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
              style={
                styles.technicalValue
              }
              numberOfLines={
                1
              }
            >
              {parcelle.id
                ? `${parcelle.id.slice(
                    0,
                    8,
                  )}…`
                : '—'}
            </Text>
          </View>

          <View
            style={
              styles.technicalDivider
            }
          />

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
              {formatDateLong(
                parcelle.creeA,
              )}
            </Text>
          </View>

          <View
            style={
              styles.technicalDivider
            }
          />

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
              Modifiée le
            </Text>

            <Text
              style={
                styles.technicalValue
              }
            >
              {formatDateLong(
                parcelle.modifieA,
              )}
            </Text>
          </View>

        </Card>

        {/* ===================================================
            ACTIONS
        =================================================== */}

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

          <Button
            fullWidth
            size="lg"
            onPress={() =>
              router.push({
                pathname:
                  '/cultures',
                params: {
                  parcelleId:
                    parcelle.id,
                  parcelleNom:
                    parcelle.nom,
                },
              } as any)
            }
            leftIcon={
              <Sprout
                size={18}
                color="#FFFFFF"
              />
            }
            rightIcon={
              <ChevronRight
                size={17}
                color="#FFFFFF"
              />
            }
          >
            Voir les cultures
          </Button>

          <Button
            fullWidth
            variant="outline"
            disabled={
              isDeleted
            }
            onPress={() =>
              router.push({
                pathname:
                  '/modifier-parcelle',
                params: {
                  parcelleId:
                    parcelle.id,
                },
              } as any)
            }
            leftIcon={
              <Edit3
                size={17}
                color={
                  isDeleted
                    ? colors.neutral[400]
                    : colors.neutral[700]
                }
              />
            }
          >
            Modifier la parcelle
          </Button>

        </View>

        {/* ===================================================
            FOOTER
        =================================================== */}

        <View
          style={
            styles.footer
          }
        >

          <View
            style={
              styles.footerIcon
            }
          >
            <Sprout
              size={14}
              color={
                colors.primary[700]
              }
            />
          </View>

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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       ROOT
    ======================================================== */

    root: {
      flex: 1,
      backgroundColor:
        '#DCEADB',
      position:
        'relative',
    },

    scrollContent: {
      paddingHorizontal:
        15,
      paddingTop:
        8,
      paddingBottom:
        35,
      gap:
        13,
    },

    backgroundDecor: {
      ...StyleSheet.absoluteFill,
      overflow:
        'hidden',
    },

    backgroundCircleOne: {
      position:
        'absolute',
      width:
        340,
      height:
        340,
      borderRadius:
        170,
      backgroundColor:
        '#89BA8D',
      opacity:
        0.18,
      right:
        -180,
      top:
        120,
    },

    backgroundCircleTwo: {
      position:
        'absolute',
      width:
        240,
      height:
        240,
      borderRadius:
        120,
      backgroundColor:
        '#5D9564',
      opacity:
        0.11,
      left:
        -145,
      top:
        500,
    },

    backgroundCircleThree: {
      position:
        'absolute',
      width:
        160,
      height:
        160,
      borderRadius:
        80,
      backgroundColor:
        '#3D7843',
      opacity:
        0.08,
      right:
        -55,
      bottom:
        120,
    },

    backgroundGlowOne: {
      position:
        'absolute',
      width:
        120,
      height:
        120,
      borderRadius:
        60,
      backgroundColor:
        '#FFFFFF',
      opacity:
        0.25,
      left:
        -50,
      top:
        165,
    },

    backgroundGlowTwo: {
      position:
        'absolute',
      width:
        90,
      height:
        90,
      borderRadius:
        45,
      backgroundColor:
        '#FFFFFF',
      opacity:
        0.20,
      right:
        -25,
      top:
        760,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      height:
        67,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        14,
      gap:
        10,
      backgroundColor:
        'rgba(220,234,219,0.96)',
      borderBottomWidth:
        1,
      borderBottomColor:
        'rgba(59,87,62,0.08)',
    },

    headerButton: {
      width:
        40,
      height:
        40,
      borderRadius:
        13,
      backgroundColor:
        'rgba(255,255,255,0.72)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.88)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    headerCenter: {
      flex:
        1,
    },

    headerTitle: {
      fontSize:
        16,
      fontWeight:
        '800',
      color:
        '#19241B',
    },

    headerSubtitle: {
      marginTop:
        2,
      fontSize:
        10.5,
      color:
        '#738074',
      fontWeight:
        '500',
    },

    /* ========================================================
       MAP
    ======================================================== */

    mapHero: {
      height:
        255,
      borderRadius:
        24,
      overflow:
        'hidden',
      backgroundColor:
        '#DCEBDD',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.90)',
      shadowColor:
        '#223126',
      shadowOpacity:
        0.11,
      shadowRadius:
        18,
      shadowOffset: {
        width:
          0,
        height:
          7,
      },
      elevation:
        4,
    },

    mapWebView: {
      flex:
        1,
      backgroundColor:
        '#DCEBDD',
    },

    mapGpsBadge: {
  position: 'absolute',
  top: 12,
  left: 12,
  height: 32,
  paddingHorizontal: 10,
  borderRadius: 11,
  flexDirection: 'row',
  alignItems: 'center',
  gap: 5,
  backgroundColor: 'rgba(24,54,29,0.85)',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.20)',
},

    mapGpsBadgeText: {
      fontSize:
        10.5,
      fontWeight:
        '800',
      color:
        '#FFFFFF',
    },

    mapOverlay: {
      position:
        'absolute',
      left:
        11,
      right:
        11,
      bottom:
        11,
      minHeight:
        60,
      paddingHorizontal:
        11,
      paddingVertical:
        9,
      borderRadius:
        17,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap:
        10,
      backgroundColor:
        'rgba(27,45,30,0.84)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.18)',
    },

    mapOverlayIdentity: {
      flex:
        1,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
    },

    mapOverlayIcon: {
      width:
        35,
      height:
        35,
      borderRadius:
        11,
      backgroundColor:
        'rgba(76,175,80,0.30)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    mapOverlayText: {
      flex:
        1,
      gap:
        2,
    },

    mapOverlayName: {
      fontSize:
        14,
      fontWeight:
        '800',
      color:
        '#FFFFFF',
    },

    mapOverlaySoil: {
      fontSize:
        10.5,
      color:
        'rgba(255,255,255,0.72)',
      fontWeight:
        '500',
    },

    emptyMap: {
      flex:
        1,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        25,
      backgroundColor:
        '#E8F0E8',
    },

    emptyMapIcon: {
      width:
        55,
      height:
        55,
      borderRadius:
        18,
      backgroundColor:
        '#DBEDDB',
      borderWidth:
        1,
      borderColor:
        '#C9E2CA',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom:
        10,
    },

    emptyMapTitle: {
      fontSize:
        15,
      fontWeight:
        '800',
      color:
        '#2E3C31',
      textAlign:
        'center',
    },

    emptyMapText: {
      marginTop:
        5,
      fontSize:
        11.5,
      lineHeight:
        17,
      color:
        '#7B877D',
      textAlign:
        'center',
      maxWidth:
        280,
    },

    /* ========================================================
       IDENTITY
    ======================================================== */

    identitySection: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap:
        12,
      paddingHorizontal:
        2,
    },

    identityContent: {
      flex:
        1,
      gap:
        6,
    },

    identityTitle: {
      fontSize:
        21,
      lineHeight:
        25,
      fontWeight:
        '800',
      color:
        '#172219',
      letterSpacing:
        -0.5,
    },

    identityMeta: {
      flexDirection:
        'row',
      flexWrap:
        'wrap',
      alignItems:
        'center',
      gap:
        6,
    },

    identityMetaText: {
      fontSize:
        11.5,
      color:
        '#68766B',
      fontWeight:
        '600',
    },

    identityDot: {
      width:
        4,
      height:
        4,
      borderRadius:
        2,
      backgroundColor:
        '#9BA69D',
    },

    /* ========================================================
       DESCRIPTION
    ======================================================== */

    descriptionCard: {
      padding:
        13,
      borderRadius:
        17,
      backgroundColor:
        'rgba(245,249,245,0.80)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.82)',
    },

    descriptionLabel: {
      fontSize:
        10,
      fontWeight:
        '800',
      color:
        '#778378',
      letterSpacing:
        0.5,
      marginBottom:
        5,
    },

    descriptionText: {
      fontSize:
        12,
      lineHeight:
        18,
      color:
        '#536055',
    },

    /* ========================================================
       DELETED
    ======================================================== */

    deletedCard: {
      minHeight:
        60,
      flexDirection:
        'row',
      borderRadius:
        16,
      backgroundColor:
        '#FDEEEE',
      borderWidth:
        1,
      borderColor:
        '#F1D1D1',
      overflow:
        'hidden',
    },

    deletedBar: {
      width:
        4,
      backgroundColor:
        '#D35A5A',
    },

    deletedContent: {
      flex:
        1,
      paddingHorizontal:
        12,
      paddingVertical:
        11,
      gap:
        3,
    },

    deletedTitle: {
      fontSize:
        12.5,
      fontWeight:
        '800',
      color:
        colors.error[700],
    },

    deletedText: {
      fontSize:
        11.5,
      lineHeight:
        16,
      color:
        colors.error[600],
    },

    /* ========================================================
       STATS
    ======================================================== */

    statsCard: {
      minHeight:
        112,
      borderRadius:
        20,
      paddingHorizontal:
        7,
      paddingVertical:
        12,
      flexDirection:
        'row',
      alignItems:
        'stretch',
      backgroundColor:
        'rgba(255,255,255,0.91)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.90)',
      shadowColor:
        '#233328',
      shadowOpacity:
        0.05,
      shadowRadius:
        12,
      shadowOffset: {
        width:
          0,
        height:
          4,
      },
      elevation:
        2,
    },

    statItem: {
      flex:
        1,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap:
        4,
    },

    statDivider: {
      width:
        1,
      marginVertical:
        10,
      backgroundColor:
        '#E8EEE8',
    },

    statIcon: {
      width:
        34,
      height:
        34,
      borderRadius:
        11,
      borderWidth:
        1,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    statIconGreen: {
      backgroundColor:
        '#E5F2E5',
      borderColor:
        '#D0E5D1',
    },

    statIconBlue: {
      backgroundColor:
        '#EAF2F8',
      borderColor:
        '#D6E5F0',
    },

    statIconNeutral: {
      backgroundColor:
        '#F0F2EF',
      borderColor:
        '#E1E5DF',
    },

    statValue: {
      fontSize:
        16,
      fontWeight:
        '800',
      color:
        '#1B281D',
    },

    statStatus: {
      fontSize:
        19,
      fontWeight:
        '900',
      color:
        colors.primary[700],
      lineHeight:
        19,
    },

    statLabel: {
      fontSize:
        9.8,
      color:
        '#7A867C',
      fontWeight:
        '700',
      textAlign:
        'center',
    },

    /* ========================================================
       SECTION
    ======================================================== */

    sectionCard: {
      padding:
        14,
      borderRadius:
        20,
      backgroundColor:
        'rgba(255,255,255,0.90)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.88)',
      shadowColor:
        '#223126',
      shadowOpacity:
        0.045,
      shadowRadius:
        12,
      shadowOffset: {
        width:
          0,
        height:
          4,
      },
      elevation:
        2,
    },

    sectionHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
    },

    sectionHeaderRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap:
        10,
    },

    sectionHeaderText: {
      flex:
        1,
      gap:
        2,
    },

    sectionIconGreen: {
      width:
        35,
      height:
        35,
      borderRadius:
        11,
      backgroundColor:
        '#E4F1E4',
      borderWidth:
        1,
      borderColor:
        '#CEE5CF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    sectionIconNeutral: {
      width:
        35,
      height:
        35,
      borderRadius:
        11,
      backgroundColor:
        '#F0F2EF',
      borderWidth:
        1,
      borderColor:
        '#E0E5DF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    sectionTitle: {
      fontSize:
        14,
      fontWeight:
        '800',
      color:
        '#1E2A20',
    },

    sectionSubtitle: {
      fontSize:
        10.5,
      color:
        '#7A857B',
    },

    /* ========================================================
       LOCALISATION
    ======================================================== */

    locationBox: {
      marginTop:
        14,
      padding:
        12,
      borderRadius:
        15,
      backgroundColor:
        '#F4F8F4',
      borderWidth:
        1,
      borderColor:
        '#E3EBE3',
    },

    locationTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        6,
    },

    locationPlace: {
      fontSize:
        12,
      fontWeight:
        '800',
      color:
        '#334036',
    },

    coordinates: {
      marginTop:
        6,
      fontSize:
        13,
      color:
        '#58665B',
      fontWeight:
        '700',
      fontFamily:
        'monospace',
    },

    coordinatesHint: {
      marginTop:
        7,
      fontSize:
        10.5,
      color:
        '#879187',
      fontWeight:
        '600',
    },

    seeAllButton: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        1,
    },

    seeAllText: {
      fontSize:
        11.5,
      color:
        colors.primary[700],
      fontWeight:
        '800',
    },

    /* ========================================================
       CULTURES
    ======================================================== */

    culturesList: {
      marginTop:
        13,
    },

    cultureRow: {
      minHeight:
        67,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
      paddingVertical:
        8,
    },

    cultureRowBorder: {
      borderBottomWidth:
        1,
      borderBottomColor:
        '#EDF1ED',
    },

    cultureIcon: {
      width:
        38,
      height:
        38,
      borderRadius:
        13,
      backgroundColor:
        '#EAF4EA',
      borderWidth:
        1,
      borderColor:
        '#D5E8D5',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    cultureContent: {
      flex:
        1,
      gap:
        4,
    },

    cultureName: {
      fontSize:
        13,
      fontWeight:
        '800',
      color:
        '#28342B',
    },

    cultureMeta: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        6,
    },

    cultureType: {
      maxWidth:
        90,
      fontSize:
        10.5,
      color:
        '#7D887F',
      fontWeight:
        '600',
    },

    cultureMetaDot: {
      width:
        3.5,
      height:
        3.5,
      borderRadius:
        2,
      backgroundColor:
        '#A0AAA2',
    },

    cultureArea: {
      fontSize:
        10.5,
      color:
        '#7D887F',
      fontWeight:
        '600',
    },

    cultureRight: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        3,
    },

    cultureLoading: {
      marginTop:
        13,
      minHeight:
        65,
      borderRadius:
        15,
      backgroundColor:
        '#F5F8F5',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    cultureLoadingText: {
      fontSize:
        11.5,
      color:
        '#7D887E',
      fontWeight:
        '600',
    },

    emptyCulture: {
      marginTop:
        13,
      minHeight:
        145,
      borderRadius:
        16,
      backgroundColor:
        '#F6F9F6',
      borderWidth:
        1,
      borderColor:
        '#E7ECE7',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal:
        20,
    },

    emptyCultureIcon: {
      width:
        43,
      height:
        43,
      borderRadius:
        14,
      backgroundColor:
        '#EAF3EA',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginBottom:
        8,
    },

    emptyCultureTitle: {
      fontSize:
        13,
      fontWeight:
        '800',
      color:
        '#334034',
    },

    emptyCultureText: {
      marginTop:
        3,
      fontSize:
        10.5,
      lineHeight:
        16,
      color:
        '#849084',
      textAlign:
        'center',
    },

    moreCultures: {
      marginTop:
        8,
      minHeight:
        38,
      borderRadius:
        12,
      backgroundColor:
        '#F3F8F3',
      borderWidth:
        1,
      borderColor:
        '#E3ECE3',
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap:
        3,
    },

    moreCulturesText: {
      fontSize:
        11.5,
      color:
        colors.primary[700],
      fontWeight:
        '800',
    },

    /* ========================================================
       ACTIVITY
    ======================================================== */

    activityList: {
      marginTop:
        14,
    },

    activityRow: {
      minHeight:
        61,
      flexDirection:
        'row',
    },

    timeline: {
      width:
        18,
      alignItems:
        'center',
    },

    timelineDot: {
      width:
        9,
      height:
        9,
      borderRadius:
        5,
      marginTop:
        4,
      backgroundColor:
        colors.primary[700],
      borderWidth:
        2,
      borderColor:
        '#DCEADB',
    },

    timelineLine: {
      width:
        1,
      flex:
        1,
      marginTop:
        3,
      backgroundColor:
        '#DCE5DC',
    },

    activityContent: {
      flex:
        1,
      paddingLeft:
        8,
      paddingBottom:
        11,
      gap:
        3,
    },

    activityTop: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap:
        10,
    },

    activityType: {
      fontSize:
        12.5,
      fontWeight:
        '800',
      color:
        '#2A352B',
    },

    activityDate: {
      fontSize:
        10.5,
      color:
        '#8A958B',
      fontWeight:
        '700',
    },

    activityDescription: {
      fontSize:
        10.8,
      color:
        '#7B867D',
      fontWeight:
        '600',
    },

    emptyActivity: {
      marginTop:
        13,
      padding:
        13,
      borderRadius:
        14,
      backgroundColor:
        '#F6F9F6',
      borderWidth:
        1,
      borderColor:
        '#E7ECE7',
    },

    emptyActivityTitle: {
      fontSize:
        12,
      fontWeight:
        '800',
      color:
        '#465147',
    },

    emptyActivityText: {
      marginTop:
        3,
      fontSize:
        10.5,
      lineHeight:
        16,
      color:
        '#879188',
    },

    /* ========================================================
       TECHNICAL
    ======================================================== */

    technicalCard: {
      padding:
        14,
      borderRadius:
        18,
      backgroundColor:
        'rgba(255,255,255,0.66)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.70)',
    },

    technicalRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap:
        15,
    },

    technicalLabel: {
      flex:
        1,
      fontSize:
        10.5,
      color:
        '#89938A',
    },

    technicalValue: {
      flex:
        1.2,
      fontSize:
        10.5,
      color:
        '#5F6B61',
      fontWeight:
        '700',
      textAlign:
        'right',
    },

    technicalDivider: {
      height:
        1,
      backgroundColor:
        '#E6EBE6',
      marginVertical:
        7,
    },

    /* ========================================================
       ACTIONS
    ======================================================== */

    actionsSection: {
      gap:
        9,
      paddingTop:
        2,
    },

    actionsLabel: {
      paddingHorizontal:
        2,
      fontSize:
        9.5,
      color:
        '#6D7F70',
      fontWeight:
        '900',
      letterSpacing:
        1.1,
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap:
        6,
      paddingTop:
        2,
    },

    footerIcon: {
      width:
        25,
      height:
        25,
      borderRadius:
        9,
      backgroundColor:
        'rgba(255,255,255,0.55)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    footerText: {
      fontSize:
        10.5,
      color:
        '#758176',
      fontWeight:
        '600',
    },
  });