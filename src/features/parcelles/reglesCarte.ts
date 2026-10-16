import type { PointGeo } from '@/ui/components/geometrie';

export interface PolygoneSource {
  id: string;
  points: readonly PointGeo[];
}

export interface FormeProjetee {
  id: string;
  /** Attribut `points` du polygone SVG, dans le repère commun. */
  points: string;
  centre: { x: number; y: number };
}

export interface ProjectionCarte {
  formes: FormeProjetee[];
  /** true si aucune géométrie exploitable (moins de 3 sommets distincts). */
  vide: boolean;
}

function pointsValides(points: readonly PointGeo[]): PointGeo[] {
  return points
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
    .slice()
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
}

/**
 * Projection partagée de plusieurs polygones dans un même cadre SVG
 * (lot 6, carte plein écran) : même facteur équirectangulaire et même
 * échelle pour tous, afin que les parcelles conservent leurs positions
 * et proportions relatives — contrairement à `projeterPolygone` qui
 * recadre chaque vignette indépendamment.
 */
export function projeterCarte(polygones: readonly PolygoneSource[], largeur: number, hauteur: number, marge = 12): ProjectionCarte {
  const sources = polygones
    .map((polygone) => ({ id: polygone.id, points: pointsValides(polygone.points) }))
    .filter((source) => new Set(source.points.map((p) => `${p.latitude},${p.longitude}`)).size >= 3);

  if (sources.length === 0) return { formes: [], vide: true };

  const tous = sources.flatMap((source) => source.points);
  const latitudeMoyenne = (tous.reduce((somme, p) => somme + p.latitude, 0) / tous.length) * (Math.PI / 180);
  const facteur = Math.cos(latitudeMoyenne);

  const xyParSource = sources.map((source) => ({
    id: source.id,
    xy: source.points.map((p) => [p.longitude * facteur, -p.latitude] as const),
  }));

  const xs = xyParSource.flatMap((source) => source.xy.map(([x]) => x));
  const ys = xyParSource.flatMap((source) => source.xy.map(([, y]) => y));
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const etendueX = Math.max(...xs) - minX;
  const etendueY = Math.max(...ys) - minY;
  if (etendueX === 0 || etendueY === 0) return { formes: [], vide: true };

  const echelle = Math.min((largeur - 2 * marge) / etendueX, (hauteur - 2 * marge) / etendueY);
  const decalageX = (largeur - etendueX * echelle) / 2;
  const decalageY = (hauteur - etendueY * echelle) / 2;
  const arrondi = (valeur: number) => Math.round(valeur * 10) / 10;

  const formes = xyParSource.map((source) => {
    const projetes = source.xy.map(
      ([x, y]) => [(x - minX) * echelle + decalageX, (y - minY) * echelle + decalageY] as const,
    );
    const centre = {
      x: arrondi(projetes.reduce((somme, [x]) => somme + x, 0) / projetes.length),
      y: arrondi(projetes.reduce((somme, [, y]) => somme + y, 0) / projetes.length),
    };
    return {
      id: source.id,
      points: projetes.map(([x, y]) => `${arrondi(x)},${arrondi(y)}`).join(' '),
      centre,
    };
  });

  return { formes, vide: false };
}

/** Borne le zoom et le déplacement pour garder la carte dans le cadre. */
export function bornerTransform(zoom: number, translation: { x: number; y: number }, cadre: number): { zoom: number; translation: { x: number; y: number } } {
  const zoomBorne = Math.min(4, Math.max(1, zoom));
  const amplitude = (cadre * (zoomBorne - 1)) / 2;
  return {
    zoom: zoomBorne,
    translation: {
      x: Math.min(amplitude, Math.max(-amplitude, translation.x)) + 0,
      y: Math.min(amplitude, Math.max(-amplitude, translation.y)) + 0,
    },
  };
}

export interface DecompteStatutsCarte {
  actives: number;
  abandonnees: number;
  archivees: number;
  /** Parcelles sans contour exploitable (non projetées sur la carte). */
  sansContour: number;
}

/** Compte les parcelles par statut pour la légende de la carte (lot 7). */
export function decompterStatutsCarte(
  parcelles: readonly { statut: string; pointsGPS?: readonly PointGeo[] | null }[],
): DecompteStatutsCarte {
  const decompte: DecompteStatutsCarte = { actives: 0, abandonnees: 0, archivees: 0, sansContour: 0 };
  for (const parcelle of parcelles) {
    if (parcelle.statut === 'ABANDONNEE') decompte.abandonnees += 1;
    else if (parcelle.statut === 'ARCHIVEE') decompte.archivees += 1;
    else decompte.actives += 1;
    const distincts = new Set((parcelle.pointsGPS ?? []).map((p) => `${p.latitude},${p.longitude}`));
    if (distincts.size < 3) decompte.sansContour += 1;
  }
  return decompte;
}

/**
 * Translation qui amène le centre d'une forme au centre du cadre au zoom
 * donné (lot 7 : centrage sur la parcelle demandée par paramètre d'URL),
 * bornée pour rester dans le cadre.
 */
export function centrageForme(forme: FormeProjetee, zoom: number, cadre: number): { x: number; y: number } {
  const zoomBorne = Math.min(4, Math.max(1, zoom));
  return bornerTransform(
    zoomBorne,
    { x: (cadre / 2 - forme.centre.x) * zoomBorne, y: (cadre / 2 - forme.centre.y) * zoomBorne },
    cadre,
  ).translation;
}
