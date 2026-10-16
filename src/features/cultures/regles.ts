import type { TFunction } from 'i18next';

import { champsCorrespondent, etatSynchroEntite } from '@/features/commun/regles';
import type { Culture, StatutCulture } from '@/types';
import type { CropStatus } from '@/ui/components/CropStatusBadge';
import { daysBetween, progressionEntre } from '@/utils/date';

/**
 * Règles de culture partagées entre le tableau de bord, le détail parcelle
 * et (lot 3) le suivi des cultures. Fichier pur : testable sans React Native.
 * Calculées sur les données existantes uniquement (dates saisies, statut).
 */

/** Récolte « proche » : dans 7 jours ou moins. */
export const JOURS_RECOLTE_PROCHE = 7;

export type Echeance =
  | { type: 'aucune' }
  | { type: 'jours'; jours: number }
  | { type: 'aujourdhui' }
  | { type: 'retard'; jours: number };

export function echeanceRecolte(culture: Pick<Culture, 'datePrevueRecolte'>, aujourdhui: string): Echeance {
  if (!culture.datePrevueRecolte) return { type: 'aucune' };
  const ecart = daysBetween(aujourdhui, culture.datePrevueRecolte);
  if (ecart > 0) return { type: 'jours', jours: ecart };
  if (ecart === 0) return { type: 'aujourdhui' };
  return { type: 'retard', jours: -ecart };
}

/** État visuel d'une culture à partir de son statut et de sa récolte prévue. */
export function statutVisuel(culture: Pick<Culture, 'statut' | 'datePrevueRecolte'>, aujourdhui: string): CropStatus {
  switch (culture.statut) {
    case 'PLANIFIEE':
      return 'planned';
    case 'RECOLTEE':
      return 'harvested';
    case 'ABANDONNEE':
    case 'SUPPRIMEE':
      return 'abandoned';
    default: {
      const echeance = echeanceRecolte(culture, aujourdhui);
      const proche =
        echeance.type === 'aujourdhui' ||
        echeance.type === 'retard' ||
        (echeance.type === 'jours' && echeance.jours <= JOURS_RECOLTE_PROCHE);
      return proche ? 'ready' : 'growing';
    }
  }
}

/** Avancement du cycle (0 → 1), ou `null` si les dates manquent. */
export function progressionCulture(
  culture: Pick<Culture, 'datePlantation' | 'datePrevueRecolte'>,
  reference: Date = new Date(),
): number | null {
  return progressionEntre(culture.datePlantation, culture.datePrevueRecolte, reference);
}

/** Libellé d'échéance de récolte (« dans 3 jours », « aujourd'hui », « 2 j de retard »). */
export function libelleEcheance(t: TFunction, echeance: Echeance): string | null {
  switch (echeance.type) {
    case 'jours':
      return t('tableauDeBord.recoltes.dans', { count: echeance.jours });
    case 'aujourdhui':
      return t('tableauDeBord.recoltes.aujourdhui');
    case 'retard':
      return t('tableauDeBord.recoltes.retard', { count: echeance.jours });
    default:
      return null;
  }
}

// ── Lot 3 : liste « Suivi des cultures » et cockpit ─────────────────────────

/**
 * Puces de la liste. Les 4 premières sont celles du cahier des charges
 * (Toutes / En croissance / Prêt à récolter / Alerte) ; les suivantes
 * conservent les filtres de statut de la V1 (aucune fonctionnalité retirée).
 */
export type FiltreCultures =
  | 'TOUTES'
  | 'EN_CROISSANCE'
  | 'PRET_A_RECOLTER'
  | 'ALERTE'
  | 'PLANIFIEE'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export const FILTRES_CULTURES: readonly FiltreCultures[] = [
  'TOUTES',
  'EN_CROISSANCE',
  'PRET_A_RECOLTER',
  'ALERTE',
  'PLANIFIEE',
  'RECOLTEE',
  'ABANDONNEE',
  'SUPPRIMEE',
];

/**
 * Raisons d'une alerte (décision du 14/10) : uniquement des données déjà
 * chargées, aucune requête supplémentaire.
 * - `recolteRetard` : culture en cours dont la récolte prévue est dépassée ;
 * - `synchroEchec` : saisie hors ligne refusée par le serveur ;
 * - `datesManquantes` : culture planifiée ou en cours sans date de plantation
 *   ou sans date de récolte prévue (cycle impossible à suivre).
 */
export type RaisonAlerte = 'recolteRetard' | 'synchroEchec' | 'datesManquantes';

type CultureRegles = Pick<Culture, 'statut' | 'datePlantation' | 'datePrevueRecolte' | '_syncStatus' | '_localOnly'>;

export function raisonsAlerte(culture: CultureRegles, aujourdhui: string): RaisonAlerte[] {
  if (culture.statut === 'SUPPRIMEE') return [];
  const raisons: RaisonAlerte[] = [];
  if (culture.statut === 'EN_COURS' && echeanceRecolte(culture, aujourdhui).type === 'retard') {
    raisons.push('recolteRetard');
  }
  if (etatSynchroEntite(culture) === 'echec') raisons.push('synchroEchec');
  const cycleActif = culture.statut === 'PLANIFIEE' || culture.statut === 'EN_COURS';
  if (cycleActif && (!culture.datePlantation || !culture.datePrevueRecolte)) raisons.push('datesManquantes');
  return raisons;
}

export function correspondAuFiltreCulture(culture: CultureRegles, filtre: FiltreCultures, aujourdhui: string): boolean {
  switch (filtre) {
    case 'TOUTES':
      // Une culture supprimée n'encombre plus la liste : puce « Supprimées ».
      return culture.statut !== 'SUPPRIMEE';
    case 'EN_CROISSANCE':
      return statutVisuel(culture, aujourdhui) === 'growing';
    case 'PRET_A_RECOLTER':
      return statutVisuel(culture, aujourdhui) === 'ready';
    case 'ALERTE':
      return raisonsAlerte(culture, aujourdhui).length > 0;
    default:
      return culture.statut === filtre;
  }
}

/**
 * Recherche V1 (`texteCulture` : nom, type, variété, stade, statut,
 * description, dates, parcelle) + libellé de statut traduit, sans accents.
 */
export function cultureCorrespondALaRecherche(
  culture: Culture,
  recherche: string,
  options: { libelleStatut: (statut: StatutCulture) => string; nomParcelle?: string | null },
): boolean {
  return champsCorrespondent(
    [
      culture.nom,
      culture.type,
      culture.variete,
      culture.stade,
      culture.statut,
      options.libelleStatut(culture.statut),
      culture.description,
      culture.datePlantation,
      culture.datePrevueRecolte,
      culture.modifieA,
      options.nomParcelle ?? culture.parcelle?.nom,
    ],
    recherche,
  );
}

const ORDRE_STATUT_CULTURE: Record<StatutCulture, number> = {
  EN_COURS: 0,
  PLANIFIEE: 1,
  RECOLTEE: 2,
  ABANDONNEE: 3,
  SUPPRIMEE: 4,
};

function joursAvantRecolte(culture: Pick<Culture, 'datePrevueRecolte'>, aujourdhui: string): number {
  const echeance = echeanceRecolte(culture, aujourdhui);
  switch (echeance.type) {
    case 'retard':
      return -echeance.jours;
    case 'aujourdhui':
      return 0;
    case 'jours':
      return echeance.jours;
    default:
      return Number.POSITIVE_INFINITY;
  }
}

/**
 * Ordre d'urgence : en cours (récolte la plus urgente d'abord, retards en
 * tête), planifiées, récoltées, abandonnées, supprimées ; à égalité, par nom.
 */
export function trierCulturesParUrgence<T extends Pick<Culture, 'statut' | 'datePrevueRecolte' | 'nom'>>(
  cultures: readonly T[],
  aujourdhui: string,
): T[] {
  return [...cultures].sort((a, b) => {
    const ordre = (ORDRE_STATUT_CULTURE[a.statut] ?? 9) - (ORDRE_STATUT_CULTURE[b.statut] ?? 9);
    if (ordre !== 0) return ordre;
    const joursA = joursAvantRecolte(a, aujourdhui);
    const joursB = joursAvantRecolte(b, aujourdhui);
    if (joursA !== joursB) {
      // Une culture sans date prévue passe après celles qui en ont une.
      if (!Number.isFinite(joursA)) return 1;
      if (!Number.isFinite(joursB)) return -1;
      return joursA - joursB;
    }
    return a.nom.localeCompare(b.nom);
  });
}

/** Filtre + recherche + parcelle facultative, puis ordre d'urgence. */
export function filtrerCultures(
  cultures: readonly Culture[],
  options: {
    recherche: string;
    filtre: FiltreCultures;
    aujourdhui: string;
    libelleStatut: (statut: StatutCulture) => string;
    parcelleId?: string | null;
    nomParcelle?: (culture: Culture) => string | null | undefined;
  },
): Culture[] {
  const retenues = cultures.filter(
    (culture) =>
      (!options.parcelleId || culture.parcelleId === options.parcelleId) &&
      correspondAuFiltreCulture(culture, options.filtre, options.aujourdhui) &&
      cultureCorrespondALaRecherche(culture, options.recherche, {
        libelleStatut: options.libelleStatut,
        nomParcelle: options.nomParcelle?.(culture),
      }),
  );
  return trierCulturesParUrgence(retenues, options.aujourdhui);
}

/** Effectifs des puces (calculés avant la recherche, après le filtre de parcelle). */
export function compterCulturesParFiltre(
  cultures: readonly CultureRegles[],
  aujourdhui: string,
): Record<FiltreCultures, number> {
  const compteurs = Object.fromEntries(FILTRES_CULTURES.map((filtre) => [filtre, 0])) as Record<FiltreCultures, number>;
  for (const culture of cultures) {
    for (const filtre of FILTRES_CULTURES) {
      if (correspondAuFiltreCulture(culture, filtre, aujourdhui)) compteurs[filtre] += 1;
    }
  }
  return compteurs;
}

export interface StatsCultures {
  enCours: number;
  aRecolter: number;
  alertes: number;
  /** Cultures non supprimées. */
  total: number;
}

export function statsCultures(cultures: readonly CultureRegles[], aujourdhui: string): StatsCultures {
  const compteurs = compterCulturesParFiltre(cultures, aujourdhui);
  return {
    enCours: cultures.filter((culture) => culture.statut === 'EN_COURS').length,
    aRecolter: compteurs.PRET_A_RECOLTER,
    alertes: compteurs.ALERTE,
    total: compteurs.TOUTES,
  };
}

/** Statuts proposés dans le cockpit (la récolte a son propre formulaire, UX-13). */
export type StatutCibleCulture = 'EN_COURS' | 'ABANDONNEE' | 'PLANIFIEE';

/**
 * Sous-ensemble des transitions du serveur (`TRANSITIONS_AUTORISEES`,
 * cultures.service.ts) : RECOLTEE passe par « Enregistrer la récolte »
 * (fiche de récolte et statut dans la même transaction) et la suppression n'a
 * pas d'écran en V1. Aucune transition refusée par le serveur n'est proposée.
 */
const TRANSITIONS_STATUT_CULTURE: Readonly<Record<StatutCulture, readonly StatutCibleCulture[]>> = {
  PLANIFIEE: ['EN_COURS', 'ABANDONNEE'],
  EN_COURS: ['ABANDONNEE'],
  ABANDONNEE: ['PLANIFIEE'],
  RECOLTEE: [],
  SUPPRIMEE: [],
};

export function transitionsStatutCulture(statut: StatutCulture): readonly StatutCibleCulture[] {
  return TRANSITIONS_STATUT_CULTURE[statut] ?? [];
}

/** Récolte possible : culture en cours, sans fiche de récolte (règle V1 du détail). */
export function peutEnregistrerRecolte(culture: Pick<Culture, 'statut' | 'recolte'>): boolean {
  return culture.statut === 'EN_COURS' && !culture.recolte;
}

/**
 * Saisie d'observations et d'interventions : refusée par le serveur sur une
 * culture récoltée, abandonnée ou supprimée (F-38, F-44) — l'écran ne la
 * propose donc pas.
 */
export function suiviModifiable(culture: Pick<Culture, 'statut'>): boolean {
  return culture.statut === 'PLANIFIEE' || culture.statut === 'EN_COURS';
}

/** Modification de la fiche : refusée par le serveur sur une culture récoltée ou supprimée. */
export function ficheModifiable(culture: Pick<Culture, 'statut'>): boolean {
  return culture.statut !== 'RECOLTEE' && culture.statut !== 'SUPPRIMEE';
}

/** Durée du cycle en jours (plantation → récolte prévue), ou `null`. */
export function dureeCycle(culture: Pick<Culture, 'datePlantation' | 'datePrevueRecolte'>): number | null {
  if (!culture.datePlantation || !culture.datePrevueRecolte) return null;
  const jours = daysBetween(culture.datePlantation, culture.datePrevueRecolte);
  return jours >= 0 ? jours : null;
}
