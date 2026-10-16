export interface Arc<T> {
  segment: T;
  /** Longueur du trait (espace inter-segments déduit). */
  longueur: number;
  /** Décalage de départ le long du cercle. */
  decalage: number;
}

/**
 * Découpe un cercle de circonférence donnée en arcs proportionnels aux valeurs
 * (valeurs nulles ou négatives ignorées), avec un léger espace entre arcs.
 */
export function calculerArcs<T extends { value: number }>(
  segments: readonly T[],
  circonference: number,
  espace = 2,
): Arc<T>[] {
  const positifs = segments.filter((s) => s.value > 0);
  const total = positifs.reduce((somme, s) => somme + s.value, 0);
  if (total <= 0) return [];
  const ecart = positifs.length > 1 ? espace : 0;

  const longueurs = positifs.map((s) => (s.value / total) * circonference);
  const departs = longueurs.map((_, i) => longueurs.slice(0, i).reduce((somme, l) => somme + l, 0));
  return positifs.map((segment, i) => ({
    segment,
    longueur: Math.max(0, longueurs[i] - ecart),
    decalage: -departs[i],
  }));
}
