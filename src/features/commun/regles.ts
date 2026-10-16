import type { WithSyncStatus } from '@/types';

/**
 * Règles transverses des écrans V2 (parcelles, cultures). Fichier pur, sans
 * React Native.
 */

/** Minuscules sans accents : « Humifère » se trouve en tapant « humifere ». */
export function normaliserRecherche(texte: string): string {
  return texte
    .normalize('NFD')
    .replaceAll(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

/** Vrai si l'un des champs contient la recherche (sans accents ni casse). */
export function champsCorrespondent(champs: readonly unknown[], recherche: string): boolean {
  const requete = normaliserRecherche(recherche);
  if (!requete) return true;
  return champs.some(
    (champ) => champ !== null && champ !== undefined && champ !== '' && normaliserRecherche(String(champ)).includes(requete),
  );
}

/** Horodatage triable ; 0 pour une date absente ou illisible. */
export function horodatage(date: string | null | undefined): number {
  const valeur = date ? Date.parse(date) : Number.NaN;
  return Number.isFinite(valeur) ? valeur : 0;
}

export type EtatSynchroEntite = 'aSynchroniser' | 'echec' | null;

/** État de synchronisation d'une entité saisie hors ligne (badge F-24). */
export function etatSynchroEntite(entite: WithSyncStatus): EtatSynchroEntite {
  switch (entite._syncStatus) {
    case 'FAILED':
    case 'INVALID':
    case 'CONFLICT':
      return 'echec';
    case 'PENDING':
    case 'SYNCING':
      return 'aSynchroniser';
    default:
      return entite._localOnly ? 'aSynchroniser' : null;
  }
}
