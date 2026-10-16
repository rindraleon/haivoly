import { convertirEnKg } from '@/features/recoltes/regles';
import type { Culture, Recolte } from '@/types';

export const STATUTS_FINIES = ['RECOLTEE', 'ABANDONNEE', 'SUPPRIMEE'] as const;
export type StatutHistorique = (typeof STATUTS_FINIES)[number];
export type FiltreHistorique = 'tous' | StatutHistorique;

export function estFinie(culture: Culture): boolean {
  return (STATUTS_FINIES as readonly string[]).includes(culture.statut);
}

/** Cycles terminés, filtrés par statut et par terme (nom, variété, parcelle). */
export function filtrerHistorique(cultures: Culture[], filtre: FiltreHistorique, terme: string): Culture[] {
  const normalise = (valeur: string | null | undefined) =>
    (valeur ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const recherche = normalise(terme.trim());
  return cultures
    .filter(estFinie)
    .filter((culture) => (filtre === 'tous' ? true : culture.statut === filtre))
    .filter((culture) =>
      recherche
        ? [culture.nom, culture.variete, culture.parcelle?.nom].some((champ) =>
            normalise(champ).includes(recherche),
          )
        : true,
    )
    .sort((a, b) => (b.modifieA ?? '').localeCompare(a.modifieA ?? ''));
}

export interface ResumeHistorique {
  nombre: number;
  recoltees: number;
  abandonnees: number;
  supprimees: number;
  /** Quantités récoltées convertibles en kg, tous cycles terminés confondus. */
  kgRecoltes: number | null;
}

/** Résumé du compte ou de la parcelle : compteurs par statut et kg récoltés. */
export function resumeHistorique(cultures: Culture[], recoltes: Recolte[]): ResumeHistorique {
  const finies = cultures.filter(estFinie);
  const recolteParCulture = new Map<string, Recolte>();
  for (const recolte of recoltes) recolteParCulture.set(recolte.cultureId, recolte);
  let kg: number | null = 0;
  for (const culture of finies) {
    const recolte = recolteParCulture.get(culture.id);
    if (!recolte) continue;
    const conversion = convertirEnKg(recolte.quantite, recolte.unite);
    if (conversion === null) kg = null;
    else if (kg !== null) kg += conversion;
  }
  return {
    nombre: finies.length,
    recoltees: finies.filter((culture) => culture.statut === 'RECOLTEE').length,
    abandonnees: finies.filter((culture) => culture.statut === 'ABANDONNEE').length,
    supprimees: finies.filter((culture) => culture.statut === 'SUPPRIMEE').length,
    kgRecoltes: kg === null ? null : Math.round(kg),
  };
}

/** Période lisible d'un cycle terminé : plantation → fin. */
export function periodeCulture(culture: Culture): { debut: string | null; fin: string | null } {
  return {
    debut: culture.datePlantation ?? null,
    fin: culture.recolte?.dateRecolte ?? culture.modifieA?.slice(0, 10) ?? null,
  };
}
