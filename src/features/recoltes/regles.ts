import type { Culture, Recolte } from '@/types';

/** Unités convertibles en kilogrammes pour le rendement (les autres non). */
const FACTEURS_KG: Record<string, number> = { kg: 1, tonne: 1000 };

export interface TotalUnite {
  unite: string;
  total: number;
}

export interface ResumeRentabilite {
  nombre: number;
  quantitesParUnite: TotalUnite[];
  /** Somme des prix de vente saisis (montants par récolte). */
  revenu: number;
  /** Somme des coûts de récolte saisis. */
  cout: number;
  marge: number;
  /** Somme des superficies (ha) des cultures récoltées distinctes. */
  superficieHa: number | null;
  /** Rendement en kg/ha si toutes les quantités sont convertibles. */
  rendementKgParHa: number | null;
}

export function convertirEnKg(quantite: number, unite: string): number | null {
  const facteur = FACTEURS_KG[unite];
  return facteur ? quantite * facteur : null;
}

function arrondi1(valeur: number): number {
  return Math.round(valeur * 10) / 10;
}

/**
 * Résumé « Récolte & rendement » (lot 5) : totaux par unité, revenus,
 * coûts, marge et rendement kg/ha — calculés uniquement sur les données
 * existantes (récoltes saisies + superficie des parcelles), sans estimations.
 */
export function resumeRentabilite(recoltes: Recolte[], cultures: Culture[]): ResumeRentabilite {
  const parUnite = new Map<string, number>();
  let revenu = 0;
  let cout = 0;
  let kgConvertibles = 0;
  let toutConvertible = true;

  for (const recolte of recoltes) {
    parUnite.set(recolte.unite, arrondi1((parUnite.get(recolte.unite) ?? 0) + recolte.quantite));
    revenu += recolte.prixVente ?? 0;
    cout += recolte.coutRecolte ?? 0;
    const kg = convertirEnKg(recolte.quantite, recolte.unite);
    if (kg === null) toutConvertible = false;
    else kgConvertibles += kg;
  }

  const cultureParId = new Map(cultures.map((culture) => [culture.id, culture]));
  const parcellesVues = new Set<string>();
  let superficie = 0;
  let superficieConnue = false;
  for (const recolte of recoltes) {
    const culture = cultureParId.get(recolte.cultureId);
    const parcelleId = culture?.parcelleId;
    if (!parcelleId || parcellesVues.has(parcelleId)) continue;
    parcellesVues.add(parcelleId);
    const superficieParcelle = culture?.parcelle?.superficie;
    if (typeof superficieParcelle === 'number' && superficieParcelle > 0) {
      superficie += superficieParcelle;
      superficieConnue = true;
    }
  }

  return {
    nombre: recoltes.length,
    quantitesParUnite: [...parUnite.entries()]
      .map(([unite, total]) => ({ unite, total }))
      .sort((a, b) => b.total - a.total),
    revenu: Math.round(revenu),
    cout: Math.round(cout),
    marge: Math.round(revenu - cout),
    superficieHa: superficieConnue ? arrondi1(superficie) : null,
    rendementKgParHa:
      toutConvertible && recoltes.length > 0 && superficieConnue && superficie > 0
        ? Math.round(kgConvertibles / superficie)
        : null,
  };
}

/** Libellé compact des totaux : « 420 kg · 3 sac ». */
export function libelleQuantites(quantites: TotalUnite[]): string {
  return quantites.map((item) => `${item.total} ${item.unite}`).join(' · ');
}
