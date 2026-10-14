import { useEffect, useImperativeHandle, useMemo, useRef, useState, forwardRef } from 'react';
import { i18n } from '@/i18n/instance';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

import { villeLaPlusProche } from '@/data/madagascar-cities';
import { getApproximateLocation } from '@/services/location.service';
import { logger } from '@/utils/logger';

/** Coordonnée géographique simple (latitude/longitude en degrés décimaux). */
export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface ParcelleMapProps {
  /** Polygone enregistré (sommets ordonnés). */
  points?: LatLng[];
  /** Centroïde enregistré de la parcelle. */
  center?: LatLng | null;
  /** Affiche la position courante de l'utilisateur — **uniquement** en création. */
  showUserLocation?: boolean;
  /** Autorise le déplacement des sommets et l'ajout par appui (mode délimitation). */
  editable?: boolean;
  onPointMove?: (index: number, position: LatLng) => void;
  onPress?: (position: LatLng) => void;
  defaultToNearestCity?: boolean;
  style?: StyleProp<ViewStyle>;
}

const DEFAULT_CENTER: LatLng = { latitude: -18.8792, longitude: 47.5079 };

interface MapMessage {
  type?: string;
  latitude?: number;
  longitude?: number;
  index?: number;
  message?: string;
  line?: number;
}

export interface ParcelleMapHandle {
  centerOnUser: () => Promise<void>;
}

export const ParcelleMap = forwardRef<ParcelleMapHandle, ParcelleMapProps>(
  function ParcelleMap({
    points = [],
    center = null,
    showUserLocation = false,
    editable = false,
    onPointMove,
    onPress,
    defaultToNearestCity = false,
    style,
  }: ParcelleMapProps, ref) {
  const webViewRef = useRef<WebView<object> | null>(null);
  const [ready, setReady] = useState(false);
  const centeredOnCityRef = useRef(false);
  const normalizedCountRef = useRef(0);

  const normalized = useMemo<LatLng[]>(
    () =>
      points
        .filter(
          (point) =>
            Number.isFinite(point.latitude) && Number.isFinite(point.longitude),
        )
        .map((point) => ({
          latitude: Number(point.latitude),
          longitude: Number(point.longitude),
        })),
    [points],
  );

  const centerLatitude = center?.latitude ?? null;
  const centerLongitude = center?.longitude ?? null;

  // Le HTML est construit une seule fois : les mises à jour passent par
  // `renderPoints`, ce qui évite de recharger la WebView à chaque déplacement.
  const [html] = useState(() => {
    const reference = center ?? points[0] ?? DEFAULT_CENTER;

    return buildMapHtml({
      editable,
      showUserLocation,
      latitude: reference.latitude,
      longitude: reference.longitude,
    });
  });

  useEffect(() => {
    if (!ready) return;

    webViewRef.current?.injectJavaScript(
      `window.renderPoints(${JSON.stringify(normalized)}, ${JSON.stringify(
        centerLatitude,
      )}, ${JSON.stringify(centerLongitude)}); true;`,
    );
  }, [ready, normalized, centerLatitude, centerLongitude]);

  // Mémorise le nombre de sommets pour ne pas recentrer une carte déjà utilisée.
  useEffect(() => {
    normalizedCountRef.current = normalized.length;
  });

  // À la création, centre la carte sur la ville la plus proche de l'utilisateur.
  useEffect(() => {
    if (!ready || !defaultToNearestCity || centeredOnCityRef.current) return;

    centeredOnCityRef.current = true;
    let cancelled = false;

    getApproximateLocation()
      .then((position) => {
        if (cancelled) return null;
        return { position, ville: villeLaPlusProche(position) };
      })
      .then((resultat) => {
        if (!resultat || cancelled || normalizedCountRef.current > 0) return;

        const { position, ville } = resultat;

        webViewRef.current?.injectJavaScript(
          `window.setUserArea(${position.latitude}, ${position.longitude}, ${ville.latitude}, ${ville.longitude}); true;`,
        );
      })
      .catch(() => {
        // Permission refusée ou GPS indisponible : on garde la vue par défaut.
      });

    return () => {
      cancelled = true;
    };
  }, [ready, defaultToNearestCity]);

  useImperativeHandle(
    ref,
    () => ({
      centerOnUser: async () => {
        try {
          const position = await getApproximateLocation();
          const ville = villeLaPlusProche(position);

          webViewRef.current?.injectJavaScript(
            `window.setUserArea(${position.latitude}, ${position.longitude}, ${ville.latitude}, ${ville.longitude}); true;`,
          );
        } catch (error) {
          logger.warn('parcelle.map', 'Impossible de recentrer sur l\'utilisateur', error);
        }
      },
    }),
    [],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    let data: MapMessage;

    try {
      data = JSON.parse(event.nativeEvent.data) as MapMessage;
    } catch {
      return;
    }

    if (data.type === 'READY') {
      setReady(true);
      return;
    }

    if (data.type === 'MAP_ERROR') {
      logger.warn('parcelle.map', 'Erreur JavaScript dans la carte', data);
      return;
    }

    const latitude = Number(data.latitude);
    const longitude = Number(data.longitude);

    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return;
    }

    if (data.type === 'ADD_POINT') {
      onPress?.({ latitude, longitude });
      return;
    }

    if (data.type === 'UPDATE_POINT') {
      onPointMove?.(Number(data.index), { latitude, longitude });
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        javaScriptEnabled
        scrollEnabled={false}
        onMessage={handleMessage}
        onError={(event) =>
          logger.warn('parcelle.map', 'WebView : échec de chargement', event.nativeEvent)
        }
        onHttpError={(event) =>
          logger.warn('parcelle.map', 'WebView : réponse HTTP en erreur', event.nativeEvent)
        }
        style={styles.webview}
        source={{ html }}
      />
    </View>
  );
});

interface BuildMapOptions {
  editable: boolean;
  showUserLocation: boolean;
  latitude: number;
  longitude: number;
}

function buildMapHtml({
  editable,
  showUserLocation,
  latitude,
  longitude,
}: BuildMapOptions): string {
  return `<!DOCTYPE html>
<html>
<head>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
.point-label {
  background: #2e7d32;
  color: #ffffff;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  line-height: 28px;
  text-align: center;
  font-weight: bold;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.center-label {
  background: #1565c0;
  color: #ffffff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-size: 12px;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
.user-label {
  background: #1565c0;
  color: #ffffff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  line-height: 22px;
  text-align: center;
  font-size: 13px;
  border: 2px solid #ffffff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.35);
}
</style>
</head>
<body>
<div id="map"></div>
<script>
const editable = ${editable ? 'true' : 'false'};
const showUserLocation = ${showUserLocation ? 'true' : 'false'};

window.onerror = function (message, source, line) {
  try {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: 'MAP_ERROR',
        message: String(message),
        line: line,
      }));
    }
  } catch (error) {}
  return false;
};

const map = L.map('map', {
  zoomControl: true,
  scrollWheelZoom: true,
  doubleClickZoom: true,
  touchZoom: true,
  minZoom: 5,
  maxZoom: 22,
}).setView([${latitude}, ${longitude}], 18);

const standard = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  { attribution: '&copy; OpenStreetMap contributors', maxZoom: 19 },
);

const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  { attribution: 'Tiles &copy; Esri', maxZoom: 19 },
);

satellite.addTo(map);

L.control.layers(
  { '🛰️ Satellite': satellite, '🗺️ Standard': standard },
  null,
  { position: 'topright' },
).addTo(map);

const layerGroup = L.layerGroup().addTo(map);

function post(payload) {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
  }
}

let lastKey = '';

window.renderPoints = function (points, centerLatitude, centerLongitude) {
  layerGroup.clearLayers();

  const coordinates = points.map(function (point) {
    return [Number(point.latitude), Number(point.longitude)];
  });

  if (coordinates.length >= 3) {
    L.polygon(coordinates, {
      color: '#2e7d32',
      fillColor: '#2e7d32',
      fillOpacity: 0.22,
      weight: 3,
    }).addTo(layerGroup);
  }

  points.forEach(function (point, index) {
    const marker = L.marker(
      [Number(point.latitude), Number(point.longitude)],
      {
        draggable: editable,
        icon: L.divIcon({
          className: 'point-label',
          html: 'P' + (index + 1),
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      },
    ).addTo(layerGroup);

    if (editable) {
      marker.on('dragend', function () {
        const position = marker.getLatLng();
        post({
          type: 'UPDATE_POINT',
          index: index,
          latitude: position.lat,
          longitude: position.lng,
        });
      });
    }

    marker.on('click', function (event) {
      L.DomEvent.stopPropagation(event);
    });
  });

  const hasCenter =
    Number.isFinite(centerLatitude) && Number.isFinite(centerLongitude);

  if (coordinates.length < 3 && hasCenter) {
    L.marker([centerLatitude, centerLongitude], {
      icon: L.divIcon({
        className: 'center-label',
        html: 'P',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      // Interpolation depuis le contexte React Native : cette ligne vit dans
      // le HTML/JS injecte au WebView, ou i18n n'existe pas. Sans interpolation,
      // l'appel serait du texte litteral et leverait une erreur cote WebView.
      // NB : pas de backticks dans ce commentaire, on est dans un template.
      title: ${JSON.stringify(i18n.t('parcelles.positionEnregistree'))},
    }).addTo(layerGroup);
  }

  // Ne recadre la carte que lorsque la structure change réellement
  // (nombre de sommets), afin de ne pas interrompre un déplacement.
  const key = coordinates.length + ':' + (hasCenter ? 'c' : '-');
  if (key === lastKey) return;
  lastKey = key;

  if (coordinates.length >= 2) {
    map.fitBounds(L.latLngBounds(coordinates), { padding: [50, 50] });
  } else if (coordinates.length === 1) {
    map.setView(coordinates[0], Math.max(map.getZoom(), 18));
  } else if (hasCenter) {
    map.setView([centerLatitude, centerLongitude], Math.max(map.getZoom(), 18));
  }
};

window.setMapView = function (lat, lng, zoom) {
  map.setView([Number(lat), Number(lng)], zoom);
};

let userMarker = null;

window.setUserArea = function (userLat, userLng, cityLat, cityLng) {
  const user = [Number(userLat), Number(userLng)];
  const city = [Number(cityLat), Number(cityLng)];

  if (userMarker) {
    userMarker.setLatLng(user);
  } else {
    userMarker = L.marker(user, {
      icon: L.divIcon({
        className: 'user-label',
        html: '\\uD83D\\uDCCD',
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      }),
      title: 'Ma position',
    }).addTo(map);
  }

  map.fitBounds(L.latLngBounds([user, city]), {
    padding: [40, 40],
    maxZoom: 14,
  });
};

map.on('click', function (event) {
  if (!editable) return;
  post({
    type: 'ADD_POINT',
    latitude: event.latlng.lat,
    longitude: event.latlng.lng,
  });
});

if (showUserLocation && navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      L.marker([lat, lng], {
        icon: L.divIcon({
          className: 'user-label',
          html: '\\uD83D\\uDCCD',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      }).addTo(map);

      map.setView([lat, lng], 18);
    },
    function () {},
    { enableHighAccuracy: true },
  );
}

post({ type: 'READY' });
</script>
</body>
</html>`;
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#e8ece9',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
});

export default ParcelleMap;
