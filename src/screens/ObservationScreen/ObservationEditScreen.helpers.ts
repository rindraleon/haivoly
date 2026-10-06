/**
 * Utilitaires et types de `ObservationEditScreen`.
 *
 * Extraits de l'écran : ces fonctions ne dépendent pas de l'état de
 * l'interface et peuvent donc être testées ou réutilisées isolément.
 */

import { formatDateTime } from '@/utils/date';


export type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export function formaterDate(
  date: string,
): string {
  if (!date) {
    return 'Date inconnue';
  }

  const valeur =
    new Date(date);

  if (
    Number.isNaN(
      valeur.getTime(),
    )
  ) {
    return date;
  }

  return formatDateTime(date);
}
