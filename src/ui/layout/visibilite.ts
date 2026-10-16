export interface Visibilite {
  /** Haut du champ dans le contenu défilant. */
  haut: number;
  /** Bas du champ dans le contenu défilant. */
  bas: number;
  /** Défilement actuel. */
  decalageActuel: number;
  /** Hauteur visible du défilement (réduite par le clavier et le pied collant). */
  hauteurVue: number;
  /** Marge minimale entre le champ et le bord visible (contrat K1 : 16 px). */
  marge: number;
}

/**
 * Défilement à appliquer pour que le champ soit entièrement visible avec sa
 * marge, ou `null` s'il l'est déjà. Un champ plus haut que la zone visible
 * (multiligne) est aligné par le haut pour garder le curseur de départ visible.
 */
export function defilementPourVisibilite({ haut, bas, decalageActuel, hauteurVue, marge }: Visibilite): number | null {
  if (hauteurVue <= 0) return null;

  const visibleHaut = decalageActuel + marge;
  const visibleBas = decalageActuel + hauteurVue - marge;

  if (bas - haut > hauteurVue - 2 * marge) {
    const cible = Math.max(0, haut - marge);
    return Math.abs(cible - decalageActuel) < 1 ? null : cible;
  }
  if (bas > visibleBas) return bas - hauteurVue + marge;
  if (haut < visibleHaut) return Math.max(0, haut - marge);
  return null;
}
