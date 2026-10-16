import type { EntityType, OfflineAction } from '@/types/offline.types';

/**
 * Règles pures de la file de synchronisation hors ligne (lot 8).
 *
 * La file locale (services/offline/queue) contient toutes les actions non
 * envoyées, par entité. Ces règles la regroupent pour un affichage lisible :
 * « il reste 2 parcelles et 1 récolte à envoyer » plutôt qu'une liste brute.
 */

export interface GroupeFile {
  entite: EntityType;
  total: number;
  enAttente: number;
  enCours: number;
  echecs: number;
  conflits: number;
  synchronisees: number;
  /** Date ISO de l'action la plus récente du groupe (tri). */
  derniereAction: string | null;
}

export interface ResumeFile {
  total: number;
  enAttente: number;
  enCours: number;
  echecs: number;
  conflits: number;
  synchronisees: number;
}

const STATUTS_EN_ATTENTE = new Set(['PENDING']);
const STATUTS_EN_COURS = new Set(['SYNCING']);
const STATUTS_ECHEC = new Set(['FAILED', 'INVALID']);
const STATUTS_CONFLIT = new Set(['DUPLICATE', 'CONFLICT']);
const STATUTS_SYNC = new Set(['SYNCED']);

/** Agrège une file brute en groupes par entité, triés par urgence. */
export function grouperFile(actions: OfflineAction[]): GroupeFile[] {
  const groupes = new Map<EntityType, GroupeFile>();
  for (const action of actions) {
    let groupe = groupes.get(action.entityType);
    if (!groupe) {
      groupe = {
        entite: action.entityType,
        total: 0,
        enAttente: 0,
        enCours: 0,
        echecs: 0,
        conflits: 0,
        synchronisees: 0,
        derniereAction: null,
      };
      groupes.set(action.entityType, groupe);
    }
    groupe.total += 1;
    if (STATUTS_EN_ATTENTE.has(action.status)) groupe.enAttente += 1;
    else if (STATUTS_EN_COURS.has(action.status)) groupe.enCours += 1;
    else if (STATUTS_ECHEC.has(action.status)) groupe.echecs += 1;
    else if (STATUTS_CONFLIT.has(action.status)) groupe.conflits += 1;
    else if (STATUTS_SYNC.has(action.status)) groupe.synchronisees += 1;
    if (!groupe.derniereAction || action.createdAt > groupe.derniereAction) {
      groupe.derniereAction = action.createdAt;
    }
  }
  return [...groupes.values()].sort((a, b) => {
    const urgenceA = a.enAttente + a.enCours + a.echecs * 2 + a.conflits * 2;
    const urgenceB = b.enAttente + b.enCours + b.echecs * 2 + b.conflits * 2;
    if (urgenceB !== urgenceA) return urgenceB - urgenceA;
    return b.total - a.total;
  });
}

/** Résume toute la file en compteurs globaux. */
export function resumeFile(actions: OfflineAction[]): ResumeFile {
  const resume: ResumeFile = {
    total: actions.length,
    enAttente: 0,
    enCours: 0,
    echecs: 0,
    conflits: 0,
    synchronisees: 0,
  };
  for (const action of actions) {
    if (STATUTS_EN_ATTENTE.has(action.status)) resume.enAttente += 1;
    else if (STATUTS_EN_COURS.has(action.status)) resume.enCours += 1;
    else if (STATUTS_ECHEC.has(action.status)) resume.echecs += 1;
    else if (STATUTS_CONFLIT.has(action.status)) resume.conflits += 1;
    else if (STATUTS_SYNC.has(action.status)) resume.synchronisees += 1;
  }
  return resume;
}

/** Y a-t-il des actions échouées à relancer ? */
export function aDesEchecs(actions: OfflineAction[]): boolean {
  return actions.some((a) => STATUTS_ECHEC.has(a.status) || STATUTS_CONFLIT.has(a.status));
}
