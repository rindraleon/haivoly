import type { PointGPS } from '@/types';


export type DefautGeometrie =
  | 'TROP_PEU_DE_SOMMETS'
  | 'COORDONNEES_INVALIDES'
  | 'SOMMETS_IDENTIQUES'
  | 'SOMMET_ISOLE_ZERO_ZERO'
  | 'POLYGONE_DEGENERE'
  | 'AUTO_INTERSECTION';

export interface ResultatValidationGeometrie {
  valide: boolean;
  defauts: DefautGeometrie[];
  indexConcernes: number[];
}

const SEUIL_DOUBLON_DEG = 1e-7;
/** Surface minimale crédible pour une parcelle agricole (m²). */
export const SURFACE_MINIMALE_M2 = 1;
const RAYON_TERRE_M = 6_378_137;

export function sontEgaux(a: PointGPS, b: PointGPS): boolean {
  return (
    Math.abs(a.latitude - b.latitude) <= SEUIL_DOUBLON_DEG &&
    Math.abs(a.longitude - b.longitude) <= SEUIL_DOUBLON_DEG
  );
}

function coordonneesValides(point: PointGPS): boolean {
  return (
    Number.isFinite(point.latitude) &&
    Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 &&
    Math.abs(point.longitude) <= 180
  );
}

/** Retire doublons consécutifs et fermeture explicite, ordre préservé. */
export function dedupliquer(points: readonly PointGPS[]): PointGPS[] {
  const resultat: PointGPS[] = [];

  for (const point of points) {
    const dernier = resultat[resultat.length - 1];
    if (dernier && sontEgaux(dernier, point)) continue;
    resultat.push(point);
  }

  if (
    resultat.length > 1 &&
    sontEgaux(resultat[0], resultat[resultat.length - 1])
  ) {
    resultat.pop();
  }

  return resultat;
}

function orientation(a: PointGPS, b: PointGPS, c: PointGPS): number {
  return (
    (b.longitude - a.longitude) * (c.latitude - a.latitude) -
    (b.latitude - a.latitude) * (c.longitude - a.longitude)
  );
}

function surSegment(a: PointGPS, b: PointGPS, p: PointGPS): boolean {
  return (
    Math.min(a.latitude, b.latitude) <= p.latitude &&
    p.latitude <= Math.max(a.latitude, b.latitude) &&
    Math.min(a.longitude, b.longitude) <= p.longitude &&
    p.longitude <= Math.max(a.longitude, b.longitude)
  );
}

function seCroisent(p1: PointGPS, p2: PointGPS, p3: PointGPS, p4: PointGPS): boolean {
  const o1 = orientation(p1, p2, p3);
  const o2 = orientation(p1, p2, p4);
  const o3 = orientation(p3, p4, p1);
  const o4 = orientation(p3, p4, p2);

  if (o1 * o2 < 0 && o3 * o4 < 0) return true;
  if (o1 === 0 && surSegment(p1, p2, p3)) return true;
  if (o2 === 0 && surSegment(p1, p2, p4)) return true;
  if (o3 === 0 && surSegment(p3, p4, p1)) return true;
  if (o4 === 0 && surSegment(p3, p4, p2)) return true;

  return false;
}

export function aDesAutoIntersections(points: readonly PointGPS[]): boolean {
  const n = points.length;
  if (n < 4) return false;

  for (let i = 0; i < n; i += 1) {
    const a1 = points[i];
    const a2 = points[(i + 1) % n];

    for (let j = i + 1; j < n; j += 1) {
      const b1 = points[j];
      const b2 = points[(j + 1) % n];

      const adjacents = i === j || (i + 1) % n === j || (j + 1) % n === i;
      if (adjacents) continue;

      if (seCroisent(a1, a2, b1, b2)) return true;
    }
  }

  return false;
}

/** Surface en m² — projection équirectangulaire + shoelace (mêmes calculs que `polygonArea`). */
export function surfaceM2(points: readonly PointGPS[]): number {
  if (points.length < 3) return 0;

  const latitudeMoyenne =
    points.reduce((total, point) => total + point.latitude, 0) / points.length;
  const cos = Math.cos((latitudeMoyenne * Math.PI) / 180);

  const mParDegLat = (Math.PI / 180) * RAYON_TERRE_M;
  const mParDegLon = mParDegLat * cos;

  let aire = 0;
  for (let index = 0; index < points.length; index += 1) {
    const courant = points[index];
    const suivant = points[(index + 1) % points.length];
    aire +=
      courant.longitude * mParDegLon * (suivant.latitude * mParDegLat) -
      suivant.longitude * mParDegLon * (courant.latitude * mParDegLat);
  }

  return Math.abs(aire / 2);
}

export function validerGeometrie(
  points: readonly PointGPS[],
): ResultatValidationGeometrie {
  const defauts: DefautGeometrie[] = [];
  const indexConcernes: number[] = [];

  if (!Array.isArray(points) || points.length < 3) {
    return { valide: false, defauts: ['TROP_PEU_DE_SOMMETS'], indexConcernes: [] };
  }

  points.forEach((point, index) => {
    if (!coordonneesValides(point)) {
      if (!defauts.includes('COORDONNEES_INVALIDES')) {
        defauts.push('COORDONNEES_INVALIDES');
      }
      indexConcernes.push(index);
    }
  });

  if (defauts.length > 0) return { valide: false, defauts, indexConcernes };

  const utiles = dedupliquer(points);

  if (utiles.length < points.length) defauts.push('SOMMETS_IDENTIQUES');
  if (utiles.some((p) => p.latitude === 0 && p.longitude === 0)) {
    defauts.push('SOMMET_ISOLE_ZERO_ZERO');
  }

  if (utiles.length < 3) {
    return {
      valide: false,
      defauts: defauts.length > 0 ? defauts : ['TROP_PEU_DE_SOMMETS'],
      indexConcernes,
    };
  }

  if (surfaceM2(utiles) < SURFACE_MINIMALE_M2) defauts.push('POLYGONE_DEGENERE');
  if (aDesAutoIntersections(utiles)) defauts.push('AUTO_INTERSECTION');

  return { valide: defauts.length === 0, defauts, indexConcernes };
}

/** Libellés français — identiques au backend (`MESSAGE_PAR_DEFAUT`). */
export const MESSAGE_PAR_DEFAUT: Record<DefautGeometrie, string> = {
  TROP_PEU_DE_SOMMETS: 'Une parcelle doit avoir au moins 3 points GPS distincts.',
  COORDONNEES_INVALIDES:
    'Certaines coordonnées GPS sont hors des plages valides (latitude -90/90, longitude -180/180).',
  SOMMETS_IDENTIQUES:
    'Des points GPS sont identiques. Déplacez-vous entre deux relevés pour obtenir des sommets distincts.',
  SOMMET_ISOLE_ZERO_ZERO:
    'Un point GPS vaut (0 ; 0) : la position n’a pas pu être acquise.',
  POLYGONE_DEGENERE: 'La délimitation est trop petite pour être une parcelle valide.',
  AUTO_INTERSECTION:
    'La délimitation se croise elle-même. Relevez les sommets dans l’ordre du contour.',
};

export function messageDesDefauts(defauts: DefautGeometrie[]): string {
  return defauts.map((defaut) => MESSAGE_PAR_DEFAUT[defaut]).join(' ');
}
