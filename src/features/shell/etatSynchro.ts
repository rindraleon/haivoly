import type { Ton } from '@/ui/tokens/couleurs';

export interface EtatSync {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  failedCount: number;
  invalidCount: number;
  conflictCount: number;
}

export interface EtatBanniere {
  ton: Ton;
  /** Messages (clés i18n `synchronisation.*`, identiques à la bannière V1). */
  messages: { cle: string; count?: number }[];
  /** Bouton « Réessayer » (mêmes cas que la V1). */
  reessayer: boolean;
  enCours: boolean;
}

/**
 * État de la bannière de synchronisation : mêmes cas et mêmes textes que
 * `SyncBanner` V1, dans le même ordre de priorité. `null` : rien à afficher.
 */
export function etatBanniereSynchro(etat: EtatSync): EtatBanniere | null {
  const { isOnline, isSyncing, pendingCount, failedCount, invalidCount, conflictCount } = etat;
  const rien =
    isOnline && !isSyncing && pendingCount === 0 && failedCount === 0 && invalidCount === 0 && conflictCount === 0;
  if (rien) return null;

  if (invalidCount > 0 || conflictCount > 0) {
    return {
      ton: 'alerte',
      messages: [
        ...(conflictCount > 0 ? [{ cle: 'synchronisation.conflits', count: conflictCount }] : []),
        ...(invalidCount > 0 ? [{ cle: 'synchronisation.invalides', count: invalidCount }] : []),
      ],
      reessayer: failedCount > 0,
      enCours: false,
    };
  }
  if (!isOnline) {
    return {
      ton: 'neutre',
      messages: [
        pendingCount > 0
          ? { cle: 'synchronisation.horsLigne', count: pendingCount }
          : { cle: 'synchronisation.horsLigneSansAction' },
      ],
      reessayer: false,
      enCours: false,
    };
  }
  if (failedCount > 0) {
    return {
      ton: 'erreur',
      messages: [{ cle: 'synchronisation.echecs', count: failedCount }],
      reessayer: true,
      enCours: false,
    };
  }
  return {
    ton: 'info',
    messages: [
      isSyncing ? { cle: 'synchronisation.enCours' } : { cle: 'synchronisation.enAttente', count: pendingCount },
    ],
    reessayer: false,
    enCours: isSyncing,
  };
}
