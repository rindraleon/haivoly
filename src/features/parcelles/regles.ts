import type { Culture, Parcelle, StatutParcelle } from '@/types';
import type { Ton } from '@/ui/tokens/couleurs';
import { centroid } from '@/utils/parcelle';

import { horodatage, normaliserRecherche } from '@/features/commun/regles';

// Règles transverses et tri des cultures, partagés avec le lot 3 (Cultures) :
// réexportés ici pour que les écrans et tests du lot 2 restent inchangés.
export { etatSynchroEntite, normaliserRecherche, type EtatSynchroEntite } from '@/features/commun/regles';
export { trierCulturesParUrgence as trierCulturesParcelle } from '@/features/cultures/regles';

/**
 * Règles de l'écran Parcelles V2. Fichier pur (sans React Native).
 * Reprend à l'identique la logique V1
 * (`ParcelleListScreen` / `ParcelleDetailScreen`) et l'étend sans rien retirer :
 * - recherche V1 (nom, description, type de sol, statut) + libellé traduit, sans accents ;
 * - filtres V1 (Toutes, Active, Abandonnée, Archivée) + « À délimiter » ;
 * - tri V1 par modification récente ; statistiques V1 (actives, ha, total).
 */

export type FiltreParcelles = 'TOUTES' | 'ACTIVE' | 'A_DELIMITER' | 'ABANDONNEE' | 'ARCHIVEE';

export const FILTRES_PARCELLES: readonly FiltreParcelles[] = [
  'TOUTES',
  'ACTIVE',
  'A_DELIMITER',
  'ABANDONNEE',
  'ARCHIVEE',
];

/** Une délimitation exploitable demande au moins 3 sommets (règle du backend). */
export const SOMMETS_MINIMUM = 3;

export function nombreSommets(parcelle: Pick<Parcelle, 'pointsGPS'>): number {
  return parcelle.pointsGPS?.length ?? 0;
}

/** Parcelle active dont le contour n'est pas encore tracé. */
export function estADelimiter(parcelle: Pick<Parcelle, 'pointsGPS' | 'statut'>): boolean {
  return parcelle.statut === 'ACTIVE' && nombreSommets(parcelle) < SOMMETS_MINIMUM;
}

export function correspondAuFiltre(parcelle: Parcelle, filtre: FiltreParcelles): boolean {
  switch (filtre) {
    case 'TOUTES':
      return true;
    case 'A_DELIMITER':
      return estADelimiter(parcelle);
    default:
      return parcelle.statut === filtre;
  }
}

export function correspondALaRecherche(
  parcelle: Parcelle,
  recherche: string,
  libelleStatut: (statut: StatutParcelle) => string,
): boolean {
  const requete = normaliserRecherche(recherche);
  if (!requete) return true;
  return [parcelle.nom, parcelle.description, parcelle.typeSol, parcelle.statut, libelleStatut(parcelle.statut)].some(
    (champ) => Boolean(champ) && normaliserRecherche(String(champ)).includes(requete),
  );
}

/** Filtre + recherche, puis tri V1 : la parcelle modifiée le plus récemment en premier. */
export function filtrerParcelles(
  parcelles: readonly Parcelle[],
  options: {
    recherche: string;
    filtre: FiltreParcelles;
    libelleStatut: (statut: StatutParcelle) => string;
  },
): Parcelle[] {
  return parcelles
    .filter(
      (parcelle) =>
        correspondAuFiltre(parcelle, options.filtre) &&
        correspondALaRecherche(parcelle, options.recherche, options.libelleStatut),
    )
    .sort((a, b) => horodatage(b.modifieA) - horodatage(a.modifieA));
}

/** Compteurs affichés dans les puces (calculés avant la recherche). */
export function compterParFiltre(parcelles: readonly Parcelle[]): Record<FiltreParcelles, number> {
  const compteurs: Record<FiltreParcelles, number> = {
    TOUTES: 0,
    ACTIVE: 0,
    A_DELIMITER: 0,
    ABANDONNEE: 0,
    ARCHIVEE: 0,
  };
  for (const parcelle of parcelles) {
    for (const filtre of FILTRES_PARCELLES) {
      if (correspondAuFiltre(parcelle, filtre)) compteurs[filtre] += 1;
    }
  }
  return compteurs;
}

export interface StatsParcelles {
  actives: number;
  /** Superficie cumulée des parcelles actives, en hectares (règle V1). */
  superficieHa: number;
  total: number;
}

export function statsParcelles(parcelles: readonly Parcelle[]): StatsParcelles {
  const actives = parcelles.filter((parcelle) => parcelle.statut === 'ACTIVE');
  return {
    actives: actives.length,
    superficieHa: actives.reduce((total, parcelle) => total + (parcelle.superficie ?? 0), 0) / 10_000,
    total: parcelles.length,
  };
}

export function tonStatutParcelle(statut: StatutParcelle): Ton {
  switch (statut) {
    case 'ACTIVE':
      return 'succes';
    case 'ABANDONNEE':
      return 'alerte';
    case 'ARCHIVEE':
      return 'neutre';
    default:
      return 'erreur';
  }
}

/** Statuts qu'un utilisateur peut choisir (la suppression a son propre parcours, F-23). */
export type StatutCibleParcelle = 'ACTIVE' | 'ABANDONNEE' | 'ARCHIVEE';

/**
 * Transitions acceptées par le serveur (`TRANSITIONS_AUTORISEES`,
 * parcelles.service.ts), sans la transition vers soi-même. Toute autre
 * transition est refusée (400) : on ne la propose donc jamais.
 */
const TRANSITIONS_STATUT: Readonly<Record<StatutParcelle, readonly StatutCibleParcelle[]>> = {
  ACTIVE: ['ABANDONNEE', 'ARCHIVEE'],
  ABANDONNEE: ['ACTIVE', 'ARCHIVEE'],
  ARCHIVEE: ['ACTIVE'],
  SUPPRIMEE: [],
};

/** Changements de statut proposés depuis le statut courant (réactivation en premier). */
export function transitionsStatutParcelle(statut: StatutParcelle): readonly StatutCibleParcelle[] {
  return TRANSITIONS_STATUT[statut] ?? [];
}

/** Centre de carte V1 : coordonnées enregistrées, sinon centroïde des sommets. */
export function centreParcelle(
  parcelle: Pick<Parcelle, 'latitude' | 'longitude' | 'pointsGPS'>,
): { latitude: number; longitude: number } | null {
  if (parcelle.latitude != null && parcelle.longitude != null) {
    return { latitude: parcelle.latitude, longitude: parcelle.longitude };
  }
  return centroid(parcelle.pointsGPS ?? []);
}

/** Nombre de cultures connu sans requête supplémentaire (champ facultatif du backend). */
export function nombreCulturesConnu(parcelle: Pick<Parcelle, 'nombreCultures' | '_count'>): number | null {
  if (typeof parcelle.nombreCultures === 'number') return parcelle.nombreCultures;
  if (typeof parcelle._count?.cultures === 'number') return parcelle._count.cultures;
  return null;
}

export function compterCulturesEnCours(cultures: readonly Pick<Culture, 'statut'>[]): number {
  return cultures.filter((culture) => culture.statut === 'EN_COURS').length;
}

// ── Formulaire V2 (lot 4) ───────────────────────────────────────────────────

export const NOM_PARCELLE_MIN = 2;
export const NOM_PARCELLE_MAX = 60;

/** Valeurs acceptées par le serveur pour le type de sol (facultatif). */
export const VALEURS_TYPES_SOL = [
  'ARGILEUX',
  'LIMONEUX',
  'SABLEUX',
  'HUMIFERE',
  'CALCAIRE',
  'AUTRE',
] as const;

export type CodeErreurParcelle = 'NOM_COURT' | 'NOM_LONG' | 'TYPE_SOL_INCONNU';

export interface ErreursParcelle {
  nom?: CodeErreurParcelle;
  typeSol?: CodeErreurParcelle;
}

export function validerParcelle(champs: {
  nom: string;
  typeSol: string | null;
}): ErreursParcelle {
  const erreurs: ErreursParcelle = {};
  const nom = champs.nom.trim();
  if (nom.length < NOM_PARCELLE_MIN) erreurs.nom = 'NOM_COURT';
  else if (nom.length > NOM_PARCELLE_MAX) erreurs.nom = 'NOM_LONG';
  if (
    champs.typeSol !== null &&
    !(VALEURS_TYPES_SOL as readonly string[]).includes(champs.typeSol)
  ) {
    erreurs.typeSol = 'TYPE_SOL_INCONNU';
  }
  return erreurs;
}

export function parcelleValide(champs: { nom: string; typeSol: string | null }): boolean {
  return Object.keys(validerParcelle(champs)).length === 0;
}
