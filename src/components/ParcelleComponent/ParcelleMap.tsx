import React, { useEffect, useMemo, useRef } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import MapView, {
  Marker,
  Polygon,
  PROVIDER_DEFAULT,
  type LatLng,
  type Region,
} from 'react-native-maps';
import * as Location from 'expo-location';

import { colors } from '@/theme';

export interface ParcelleMapProps {
  /** Polygone enregistré (sommets ordonnés). */
  points?: LatLng[];
  /** Centroïde enregistré de la parcelle. */
  center?: LatLng | null;
  /** Position courante de l'utilisateur — **uniquement** en création. */
  showUserLocation?: boolean;
  /** Autorise le déplacement des sommets (mode délimitation). */
  editable?: boolean;
  onPointMove?: (index: number, position: LatLng) => void;
  onPress?: (position: LatLng) => void;
  style?: StyleProp<ViewStyle>;
  /** Zoom appliqué quand un seul point est disponible. */
  singlePointDelta?: number;
}

/**
 * Carte des parcelles.
 *
 * Règle centrale (correctif) : pour une parcelle **existante**, la carte se
 * centre **toujours sur ses coordonnées enregistrées** (centroïde ou polygone)
 * et jamais sur la position de l'utilisateur. La position courante n'est
 * utilisée que lors de la création d'une nouvelle parcelle.
 */
export function ParcelleMap({
  points = [],
  center = null,
  showUserLocation = false,
  editable = false,
  onPointMove,
  onPress,
  style,
  singlePointDelta = 0.0035,
}: ParcelleMapProps) {
  const mapRef = useRef<MapView | null>(null);

  const polygon = useMemo<LatLng[]>(
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

  const initialRegion = useMemo<Region>(() => {
    const reference = center ?? polygon[0] ?? null;

    return {
      latitude: reference?.latitude ?? -18.8792, // Antananarivo par défaut
      longitude: reference?.longitude ?? 47.5079,
      latitudeDelta: singlePointDelta,
      longitudeDelta: singlePointDelta,
    };
  }, [center, polygon, singlePointDelta]);

  /**
   * Recul/zoom automatique à chaque changement de géométrie :
   *   • ≥ 2 sommets → `fitToCoordinates` (tout le polygone est visible)
   *   • 1 sommet    → `animateToRegion` centré sur ce point
   *   • 0 sommet    → rien (la région initiale s'applique)
   */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (polygon.length >= 2) {
      map.fitToCoordinates(polygon, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
      return;
    }

    if (polygon.length === 1) {
      map.animateToRegion(
        {
          latitude: polygon[0].latitude,
          longitude: polygon[0].longitude,
          latitudeDelta: singlePointDelta,
          longitudeDelta: singlePointDelta,
        },
        450,
      );
      return;
    }

    if (center) {
      map.animateToRegion(
        {
          latitude: center.latitude,
          longitude: center.longitude,
          latitudeDelta: singlePointDelta,
          longitudeDelta: singlePointDelta,
        },
        450,
      );
    }
  }, [polygon, center, singlePointDelta]);

  // La position de l'utilisateur n'est affichée qu'en création explicite.
  useEffect(() => {
    if (!showUserLocation) return;

    let cancelled = false;

    void (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (cancelled || status !== 'granted') return;

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (cancelled) return;

      mapRef.current?.animateToRegion(
        {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: singlePointDelta,
          longitudeDelta: singlePointDelta,
        },
        600,
      );
    })();

    return () => {
      cancelled = true;
    };
  }, [showUserLocation, singlePointDelta]);

  const hasPolygon = polygon.length >= 3;

  return (
    <View style={[styles.container, style]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={showUserLocation}
        rotateEnabled={false}
        onPress={(event) => onPress?.(event.nativeEvent.coordinate)}
      >
        {hasPolygon ? (
          <Polygon
            coordinates={polygon}
            strokeColor={colors.primary[600]}
            strokeWidth={2.5}
            fillColor="rgba(46, 125, 50, 0.22)"
            tappable={false}
          />
        ) : null}

        {polygon.map((point, index) => (
          <Marker
            key={`${point.latitude}-${point.longitude}-${index}`}
            coordinate={point}
            draggable={editable}
            anchor={{ x: 0.5, y: 0.5 }}
            onDragEnd={(event) =>
              onPointMove?.(index, event.nativeEvent.coordinate)
            }
            pinColor={colors.primary[600]}
            title={`Point ${index + 1}`}
          />
        ))}

        {!hasPolygon && center ? (
          <Marker
            coordinate={center}
            title="Position enregistrée"
            pinColor={colors.primary[600]}
          />
        ) : null}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.neutral[150],
  },
});

export default ParcelleMap;
