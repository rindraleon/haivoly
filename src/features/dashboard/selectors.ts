import type { Culture, Parcelle } from '@/types';
import {
  JOURS_RECOLTE_PROCHE,
  echeanceRecolte,
  progressionCulture,
  statutVisuel,
  type Echeance,
} from '@/features/cultures/regles';

/** Règles de culture partagées (déplacées dans `features/cultures/regles.ts`, lot 2). */
export { JOURS_RECOLTE_PROCHE, echeanceRecolte, progressionCulture, statutVisuel, type Echeance };

/**
 * Règles du tableau de bord, calculées sur les données existantes uniquement
 * (aucun capteur, aucune météo, aucune donnée inventée).
 */


export type CleSalutation = 'bonjour' | 'bonApresMidi' | 'bonsoir';

/** Mêmes seuils que l'accueil V1. */
export function salutation(heure: number): CleSalutation {
  if (heure < 12) return 'bonjour';
  if (heure < 18) return 'bonApresMidi';
  return 'bonsoir';
}

export function parcellesActives(parcelles: readonly Parcelle[]): Parcelle[] {
  return parcelles.filter((p) => p.statut === 'ACTIVE');
}

/** Superficie des parcelles actives, en hectares (la superficie est en m²). */
export function superficieHa(parcelles: readonly Parcelle[]): number {
  const m2 = parcellesActives(parcelles).reduce((somme, p) => somme + (p.superficie ?? 0), 0);
  return m2 / 10_000;
}

export interface ResumeCultures {
  enCours: number;
  planifiees: number;
  recoltees: number;
}

export function resumeCultures(cultures: readonly Culture[]): ResumeCultures {
  return {
    enCours: cultures.filter((c) => c.statut === 'EN_COURS').length,
    planifiees: cultures.filter((c) => c.statut === 'PLANIFIEE').length,
    recoltees: cultures.filter((c) => c.statut === 'RECOLTEE').length,
  };
}

/** Cultures en cours avec récolte prévue, la plus urgente d'abord (retards inclus). */
export function prochainesRecoltes(cultures: readonly Culture[], limite = 3): Culture[] {
  return cultures
    .filter((c) => c.statut === 'EN_COURS' && Boolean(c.datePrevueRecolte))
    .slice()
    .sort((a, b) => (a.datePrevueRecolte as string).localeCompare(b.datePrevueRecolte as string))
    .slice(0, limite);
}

export interface PartRepartition {
  /** `null` pour le regroupement « Autres ». */
  libelle: string | null;
  valeur: number;
}

function libelleCulture(nom: string): string {
  const propre = nom.trim().replace(/\s+/g, ' ');
  return propre.charAt(0).toLocaleUpperCase('fr') + propre.slice(1).toLocaleLowerCase('fr');
}

/**
 * Répartition des cultures en cours par nom (« Riz », « Manioc »…). Au-delà de
 * `maximum` catégories, les plus petites sont regroupées dans « Autres ».
 */
export function repartitionCultures(cultures: readonly Culture[], maximum = 5): PartRepartition[] {
  const compte = new Map<string, number>();
  for (const culture of cultures) {
    if (culture.statut !== 'EN_COURS' || !culture.nom?.trim()) continue;
    const libelle = libelleCulture(culture.nom);
    compte.set(libelle, (compte.get(libelle) ?? 0) + 1);
  }

  const parts = [...compte.entries()]
    .map(([libelle, valeur]) => ({ libelle, valeur }))
    .sort((a, b) => b.valeur - a.valeur || a.libelle.localeCompare(b.libelle, 'fr'));

  if (parts.length <= maximum) return parts;
  const gardees = parts.slice(0, maximum - 1);
  const autres = parts.slice(maximum - 1).reduce((somme, p) => somme + p.valeur, 0);
  return [...gardees, { libelle: null, valeur: autres }];
}

export type RaisonPriorite = 'recolteRetard' | 'recolteProche' | 'aDelimiter' | 'sansCulture';

const POIDS_RAISON: Record<RaisonPriorite, number> = {
  recolteRetard: 40,
  recolteProche: 30,
  aDelimiter: 20,
  sansCulture: 10,
};

export interface ParcellePrioritaire {
  parcelle: Parcelle;
  raisons: RaisonPriorite[];
  score: number;
}

/** Parcelles actives qui demandent une action, la plus urgente d'abord. */
export function parcellesPrioritaires(
  parcelles: readonly Parcelle[],
  cultures: readonly Culture[],
  aujourdhui: string,
  limite = 3,
): ParcellePrioritaire[] {
  return parcellesActives(parcelles)
    .map((parcelle) => {
      const siennes = cultures.filter((c) => c.parcelleId === parcelle.id);
      const raisons: RaisonPriorite[] = [];

      const echeances = siennes
        .filter((c) => c.statut === 'EN_COURS')
        .map((c) => echeanceRecolte(c, aujourdhui));
      if (echeances.some((e) => e.type === 'retard')) raisons.push('recolteRetard');
      else if (
        echeances.some(
          (e) => e.type === 'aujourdhui' || (e.type === 'jours' && e.jours <= JOURS_RECOLTE_PROCHE),
        )
      ) {
        raisons.push('recolteProche');
      }

      if ((parcelle.pointsGPS?.length ?? 0) < 3) raisons.push('aDelimiter');
      if (!siennes.some((c) => c.statut === 'EN_COURS' || c.statut === 'PLANIFIEE')) raisons.push('sansCulture');

      const score = raisons.reduce((somme, r) => somme + POIDS_RAISON[r], 0);
      return { parcelle, raisons, score };
    })
    .filter((p) => p.score > 0)
    .sort((a, b) => b.score - a.score || a.parcelle.nom.localeCompare(b.parcelle.nom, 'fr'))
    .slice(0, limite);
}

export interface ParcelleAffichee extends ParcellePrioritaire {
  /** `false` : parcelle récente ajoutée pour compléter la liste (parité avec l'accueil V1). */
  prioritaire: boolean;
}

/**
 * Jusqu'à `limite` parcelles actives : les prioritaires d'abord, complétées
 * par les plus récemment modifiées (l'accueil V1 montrait les 3 récentes).
 */
export function parcellesAAfficher(
  parcelles: readonly Parcelle[],
  cultures: readonly Culture[],
  aujourdhui: string,
  limite = 3,
): ParcelleAffichee[] {
  const prioritaires = parcellesPrioritaires(parcelles, cultures, aujourdhui, limite).map((p) => ({
    ...p,
    prioritaire: true,
  }));
  const dejaVues = new Set(prioritaires.map((p) => p.parcelle.id));
  const recentes = parcellesActives(parcelles)
    .filter((p) => !dejaVues.has(p.id))
    .sort((a, b) => (b.modifieA ?? '').localeCompare(a.modifieA ?? ''))
    .map((parcelle) => ({ parcelle, raisons: [] as RaisonPriorite[], score: 0, prioritaire: false }));
  return [...prioritaires, ...recentes].slice(0, limite);
}
