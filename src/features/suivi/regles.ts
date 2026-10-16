/**
 * Suivi unifié V2 (lot 4) : fusion chronologique des observations,
 * interventions et récoltes du compte en un seul fil, filtrable et groupé
 * par jour. Règles pures, testées unitairement.
 */
import type { Intervention, Observation, Recolte, WithSyncStatus } from '@/types';

export type TypeEvenementSuivi = 'OBSERVATION' | 'INTERVENTION' | 'RECOLTE';
export type FiltreSuivi = 'TOUTES' | TypeEvenementSuivi;

export const FILTRES_SUIVI: readonly FiltreSuivi[] = [
  'TOUTES',
  'OBSERVATION',
  'INTERVENTION',
  'RECOLTE',
];

export interface EvenementSuivi {
  id: string;
  type: TypeEvenementSuivi;
  /** Jour calendaire `YYYY-MM-DD` (clé de tri et de groupement). */
  date: string;
  cultureId: string;
  cultureNom: string;
  /** Résumé affiché sur la ligne (type d'intervention, début de note…). */
  resume: string;
  /** État de synchronisation hérité de l'entité d'origine. */
  syncStatus?: WithSyncStatus['_syncStatus'];
}

export interface JourSuivi {
  jour: string;
  evenements: EvenementSuivi[];
}

function jourDe(dateIso: string): string {
  return dateIso.slice(0, 10);
}

export function evenementsObservations(
  observations: readonly Observation[],
  nomCulture: (cultureId: string) => string,
  resume: (observation: Observation) => string,
): EvenementSuivi[] {
  return observations.map((observation) => ({
    id: `obs-${observation.id}`,
    type: 'OBSERVATION' as const,
    date: jourDe(observation.date),
    cultureId: observation.cultureId,
    cultureNom: nomCulture(observation.cultureId),
    resume: resume(observation),
    syncStatus: observation._syncStatus,
  }));
}

export function evenementsInterventions(
  interventions: readonly Intervention[],
  nomCulture: (cultureId: string) => string,
  resume: (intervention: Intervention) => string,
): EvenementSuivi[] {
  return interventions.map((intervention) => ({
    id: `int-${intervention.id}`,
    type: 'INTERVENTION' as const,
    date: jourDe(intervention.date),
    cultureId: intervention.cultureId,
    cultureNom: nomCulture(intervention.cultureId),
    resume: resume(intervention),
    syncStatus: intervention._syncStatus,
  }));
}

export function evenementsRecoltes(
  recoltes: readonly Recolte[],
  nomCulture: (cultureId: string) => string,
  resume: (recolte: Recolte) => string,
): EvenementSuivi[] {
  return recoltes.map((recolte) => ({
    id: `rec-${recolte.id}`,
    type: 'RECOLTE' as const,
    date: jourDe(recolte.dateRecolte),
    cultureId: recolte.cultureId,
    cultureNom: nomCulture(recolte.cultureId),
    resume: resume(recolte),
    syncStatus: recolte._syncStatus,
  }));
}

/** Fusion triée du plus récent au plus ancien (à jour égal : ordre stable). */
export function fusionnerEvenements(...listes: readonly EvenementSuivi[][]): EvenementSuivi[] {
  return listes
    .flat()
    .slice()
    .sort((a, b) => (a.date === b.date ? a.id.localeCompare(b.id) : a.date < b.date ? 1 : -1));
}

export function filtrerEvenements(
  evenements: readonly EvenementSuivi[],
  filtre: FiltreSuivi,
  cultureId?: string | null,
): EvenementSuivi[] {
  return evenements.filter(
    (evenement) =>
      (filtre === 'TOUTES' || evenement.type === filtre) &&
      (!cultureId || evenement.cultureId === cultureId),
  );
}

export function compterParFiltre(evenements: readonly EvenementSuivi[]): Record<FiltreSuivi, number> {
  const compte: Record<FiltreSuivi, number> = {
    TOUTES: evenements.length,
    OBSERVATION: 0,
    INTERVENTION: 0,
    RECOLTE: 0,
  };
  for (const evenement of evenements) compte[evenement.type] += 1;
  return compte;
}

/** Groupement par jour calendaire, jours triés du plus récent au plus ancien. */
export function grouperParJour(evenements: readonly EvenementSuivi[]): JourSuivi[] {
  const parJour = new Map<string, EvenementSuivi[]>();
  for (const evenement of evenements) {
    const liste = parJour.get(evenement.date);
    if (liste) liste.push(evenement);
    else parJour.set(evenement.date, [evenement]);
  }
  return [...parJour.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([jour, liste]) => ({ jour, evenements: liste }));
}
