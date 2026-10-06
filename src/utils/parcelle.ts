import type { PointGPS } from '@/types';

/**
 * Utilitaires d'affichage et de calcul liés aux parcelles.
 *
 * ⚠️ La superficie affichée est **indicative** : la valeur de référence est
 * celle calculée et renvoyée par le serveur après enregistrement.
 */

const EARTH_RADIUS_M = 6_378_137;

/** Superficie (m²) d'un polygone — projection équirectangulaire + shoelace. */
export function polygonArea(points: PointGPS[]): number {
  if (points.length < 3) return 0;

  const latitudeMoyenne =
    points.reduce((total, point) => total + point.latitude, 0) / points.length;
  const cos = Math.cos((latitudeMoyenne * Math.PI) / 180);

  const mParDegLat = (Math.PI / 180) * EARTH_RADIUS_M;
  const mParDegLon = mParDegLat * cos;

  const projetes = points.map((point) => ({
    x: point.longitude * mParDegLon,
    y: point.latitude * mParDegLat,
  }));

  let aire = 0;
  for (let index = 0; index < projetes.length; index += 1) {
    const courant = projetes[index];
    const suivant = projetes[(index + 1) % projetes.length];
    aire += courant.x * suivant.y - suivant.x * courant.y;
  }

  return Math.abs(aire / 2);
}

/** Superficie formatée (« 1 930 m² », « 1,93 ha »). */
export function formatSuperficie(points: PointGPS[]): string | null {
  if (points.length < 3) return null;
  return formatSuperficieValue(polygonArea(points));
}

export function formatSuperficieValue(
  superficie: number | null | undefined,
): string | null {
  if (superficie == null || !Number.isFinite(superficie)) return null;

  if (superficie >= 10_000) {
    return `${(superficie / 10_000).toLocaleString('fr-FR', {
      maximumFractionDigits: 2,
    })} ha`;
  }

  return `${Math.round(superficie).toLocaleString('fr-FR')} m²`;
}

/** Nettoie une liste de points : entiers bornés, sans doublons consécutifs. */
export function polishPolygon(points: PointGPS[] | undefined): PointGPS[] {
  if (!points) return [];

  const valides = points.filter(
    (point) =>
      Number.isFinite(point.latitude) &&
      Number.isFinite(point.longitude) &&
      Math.abs(point.latitude) <= 90 &&
      Math.abs(point.longitude) <= 180 &&
      !(point.latitude === 0 && point.longitude === 0),
  );

  const resultat: PointGPS[] = [];
  for (const point of valides) {
    const dernier = resultat[resultat.length - 1];
    if (
      dernier &&
      dernier.latitude === point.latitude &&
      dernier.longitude === point.longitude
    ) {
      continue;
    }
    resultat.push({
      latitude: Number(point.latitude.toFixed(7)),
      longitude: Number(point.longitude.toFixed(7)),
    });
  }

  return resultat.map((point, index) => ({ ...point, ordre: index }));
}

/** Centroïde du polygone (ou d'un point isolé). */
export function centroid(points: PointGPS[]): { latitude: number; longitude: number } | null {
  if (points.length === 0) return null;

  return {
    latitude: points.reduce((total, point) => total + point.latitude, 0) / points.length,
    longitude: points.reduce((total, point) => total + point.longitude, 0) / points.length,
  };
}
