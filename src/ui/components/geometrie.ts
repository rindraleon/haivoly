export interface PointGeo {
  latitude: number;
  longitude: number;
  ordre?: number;
}

/**
 * Projette un polygone GPS dans un cadre `largeur × hauteur` (pixels SVG).
 *
 * Projection équirectangulaire locale (longitude × cos(latitude moyenne)) :
 * suffisante pour une vignette de parcelle, sans dépendance cartographique ni
 * réseau. Le rapport largeur/hauteur réel est conservé et la forme centrée.
 * Renvoie `null` si la géométrie est absente ou dégénérée (< 3 sommets
 * distincts) : l'appelant affiche alors l'état « À délimiter ».
 */
export function projeterPolygone(
  points: readonly PointGeo[],
  largeur: number,
  hauteur: number,
  marge = 6,
): string | null {
  const valides = points
    .filter((p) => Number.isFinite(p.latitude) && Number.isFinite(p.longitude))
    .slice()
    .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));

  const distincts = new Set(valides.map((p) => `${p.latitude},${p.longitude}`));
  if (distincts.size < 3) return null;

  const latitudeMoyenne =
    (valides.reduce((somme, p) => somme + p.latitude, 0) / valides.length) * (Math.PI / 180);
  const facteur = Math.cos(latitudeMoyenne);

  const xy = valides.map((p) => [p.longitude * facteur, -p.latitude] as const);
  const xs = xy.map(([x]) => x);
  const ys = xy.map(([, y]) => y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const etendueX = Math.max(...xs) - minX;
  const etendueY = Math.max(...ys) - minY;
  if (etendueX === 0 || etendueY === 0) return null;

  const echelle = Math.min((largeur - 2 * marge) / etendueX, (hauteur - 2 * marge) / etendueY);
  const decalageX = (largeur - etendueX * echelle) / 2;
  const decalageY = (hauteur - etendueY * echelle) / 2;
  const arrondi = (valeur: number) => Math.round(valeur * 10) / 10;

  return xy
    .map(([x, y]) => `${arrondi((x - minX) * echelle + decalageX)},${arrondi((y - minY) * echelle + decalageY)}`)
    .join(' ');
}
