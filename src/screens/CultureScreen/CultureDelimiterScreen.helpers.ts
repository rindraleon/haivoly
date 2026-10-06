/**
 * Fonctions pures de `CultureDelimiterScreen` (5).
 *
 * Déclarées à l'origine dans le composant, elles n'en dépendent pas :
 * les sortir garde le composant lisible et les rend testables.
 */
import type {PointGPS} from '@/types';

/**
 * Polygone d'une culture voisine, utilisé pour empêcher les chevauchements de
 * délimitations. Déclaré ici (et non dans l'écran) pour que les sections
 * extraites puissent l'importer sans créer de cycle avec l'écran.
 */
export interface CulturePolygon {
  cultureId: string;
  cultureNom: string;
  points: PointGPS[];
}

export const pointDansPolygone = (
    latitude: number,
    longitude: number,
    polygon: {
      latitude: number;
      longitude: number;
    }[],
  ): boolean => {
    if (polygon.length < 3) {
      return false;
    }

    let inside = false;

    for (
      let i = 0,
      j = polygon.length - 1;
      i < polygon.length;
      j = i++
    ) {
      const xi =
        Number(polygon[i].latitude);

      const yi =
        Number(polygon[i].longitude);

      const xj =
        Number(polygon[j].latitude);

      const yj =
        Number(polygon[j].longitude);

      const intersect =
        yi > longitude !==
          yj > longitude &&
        latitude <
          ((xj - xi) *
            (longitude - yi)) /
            (yj - yi) +
            xi;

      if (intersect) {
        inside = !inside;
      }
    }

    return inside;
  };

export const orientation = (
    a: PointGPS,
    b: PointGPS,
    c: PointGPS,
  ): number => {
    const value =
      (b.longitude - a.longitude) *
        (c.latitude - b.latitude) -
      (b.latitude - a.latitude) *
        (c.longitude - b.longitude);

    if (Math.abs(value) < 0.0000000001) {
      return 0;
    }

    return value > 0 ? 1 : 2;
  };

export const pointSurSegment = (
    p: PointGPS,
    q: PointGPS,
    r: PointGPS,
  ): boolean => {
    return (
      q.latitude <=
        Math.max(
          p.latitude,
          r.latitude,
        ) &&
      q.latitude >=
        Math.min(
          p.latitude,
          r.latitude,
        ) &&
      q.longitude <=
        Math.max(
          p.longitude,
          r.longitude,
        ) &&
      q.longitude >=
        Math.min(
          p.longitude,
          r.longitude,
        )
    );
  };

export const segmentsSeTouchent = (
    p1: PointGPS,
    q1: PointGPS,
    p2: PointGPS,
    q2: PointGPS,
  ): boolean => {
    const o1 =
      orientation(
        p1,
        q1,
        p2,
      );

    const o2 =
      orientation(
        p1,
        q1,
        q2,
      );

    const o3 =
      orientation(
        p2,
        q2,
        p1,
      );

    const o4 =
      orientation(
        p2,
        q2,
        q1,
      );

    if (
      o1 !== o2 &&
      o3 !== o4
    ) {
      return true;
    }

    if (
      o1 === 0 &&
      pointSurSegment(
        p1,
        p2,
        q1,
      )
    ) {
      return true;
    }

    if (
      o2 === 0 &&
      pointSurSegment(
        p1,
        q2,
        q1,
      )
    ) {
      return true;
    }

    if (
      o3 === 0 &&
      pointSurSegment(
        p2,
        p1,
        q2,
      )
    ) {
      return true;
    }

    if (
      o4 === 0 &&
      pointSurSegment(
        p2,
        q1,
        q2,
      )
    ) {
      return true;
    }

    return false;
  };

export const polygonsSeChevauchent = (
    polygonA: PointGPS[],
    polygonB: PointGPS[],
  ): boolean => {
    if (
      polygonA.length < 3 ||
      polygonB.length < 3
    ) {
      return false;
    }

    // ================================================
    // 1. Vérifier les segments
    // ================================================

    for (
      let i = 0;
      i < polygonA.length;
      i++
    ) {
      const a1 =
        polygonA[i];

      const a2 =
        polygonA[
          (i + 1) %
            polygonA.length
        ];

      for (
        let j = 0;
        j < polygonB.length;
        j++
      ) {
        const b1 =
          polygonB[j];

        const b2 =
          polygonB[
            (j + 1) %
              polygonB.length
          ];

        if (
          segmentsSeTouchent(
            a1,
            a2,
            b1,
            b2,
          )
        ) {
          return true;
        }
      }
    }

    // ================================================
    // 2. Vérifier si A est dans B
    // ================================================

    if (
      pointDansPolygone(
        polygonA[0].latitude,
        polygonA[0].longitude,
        polygonB,
      )
    ) {
      return true;
    }

    // ================================================
    // 3. Vérifier si B est dans A
    // ================================================

    if (
      pointDansPolygone(
        polygonB[0].latitude,
        polygonB[0].longitude,
        polygonA,
      )
    ) {
      return true;
    }

    return false;
  };
