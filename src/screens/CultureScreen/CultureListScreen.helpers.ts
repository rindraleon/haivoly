/**
 * Utilitaires et types de `CultureListScreen`.
 *
 * Extraits de l'écran : ces fonctions ne dépendent pas de l'état de
 * l'interface et peuvent donc être testées ou réutilisées isolément.
 */

import { formatDate } from '@/utils/date';


import type {
  Culture,
  PointGPS as PointGPS,
} from '@/types';
export interface CultureAvecPoints extends Culture {
  pointsGPS: PointGPS[];
}

export interface CultureToutesParcelles extends Omit<Culture, 'pointsGPS'> {
  parcelleNom: string;
  pointsGPS?: PointGPS[];
}

export interface CultureCarte {
  id: string;
  nom: string;
  statut: string;
  points: {
    latitude: number;
    longitude: number;
  }[];
}

export type FiltreCulture =
  | 'TOUTES'
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

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

export function texteCulture(
  culture: CultureToutesParcelles,
) {
  const valeurs = [
    culture.nom,
    culture.type,
    culture.variete,
    culture.stade,
    culture.statut,
    culture.description,
    culture.datePlantation,
    culture.datePrevueRecolte,
    culture.modifieA,
    culture.parcelleNom,
  ];

  return valeurs
    .filter(
      (valeur) =>
        valeur !== undefined &&
        valeur !== null,
    )
    .map(
      (valeur) =>
        String(valeur).toLowerCase(),
    )
    .join(' ');
}

export function formaterDate(
  date?: string | Date | null,
) {
  if (!date) {
    return null;
  }

  const valeur = new Date(date);

  if (Number.isNaN(valeur.getTime())) {
    return null;
  }

  return formatDate(date);
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

export function getFiltreLabel(filtre: FiltreCulture): string {
  return filtre === 'TOUTES' ? 'Toutes' : nomStatut(filtre);
}
