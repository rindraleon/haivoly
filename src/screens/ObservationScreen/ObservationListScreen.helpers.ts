
import { formatDateTime } from '@/utils/date';
import type {Culture ,
  Observation,
} from '@/types';


import { router } from 'expo-router';



export type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export interface CultureGlobale extends Culture {
  parcelleId: string;
  parcelleNom: string;
}

export interface ObservationGlobale {
  observation: Observation;
  parcelleId: string;
  parcelleNom: string;
  cultureId: string;
  cultureNom: string;
  statutCulture: StatutCulture;
}

export function nomStatut(
  statut?: string,
) {
  switch (statut) {
    case 'PLANIFIEE':
      return 'PLANIFIÉE';

    case 'EN_COURS':
      return 'EN COURS';

    case 'RECOLTEE':
      return 'RÉCOLTÉE';

    case 'ABANDONNEE':
      return 'ABANDONNÉE';

    case 'SUPPRIMEE':
      return 'SUPPRIMÉE';

    default:
      return statut ?? '';
  }
}

export function getBadgeVariant(
  statut?: string,
): any {
  switch (statut) {
    case 'EN_COURS':
      return 'success';

    case 'PLANIFIEE':
      return 'warning';

    case 'RECOLTEE':
      return 'success';

    case 'ABANDONNEE':
      return 'warning';

    case 'SUPPRIMEE':
      return 'neutral';

    default:
      return 'neutral';
  }
}

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
export const ouvrirModificationGlobale =
    (
      item: ObservationGlobale,
    ) => {
      const autorisee =
        item.statutCulture !==
          'SUPPRIMEE' &&
        item.statutCulture !==
          'RECOLTEE' &&
        item.statutCulture !==
          'ABANDONNEE';

      if (!autorisee) {
        return;
      }

      router.push({
        pathname:
          '/modifier-observation',

        params: {
          parcelleId:
            item.parcelleId,

          cultureId:
            item.cultureId,

          observationId:
            item.observation.id,

          parcelleNom:
            item.parcelleNom,

          cultureNom:
            item.cultureNom,

          statut:
            item.statutCulture,
        },
      });
    };
