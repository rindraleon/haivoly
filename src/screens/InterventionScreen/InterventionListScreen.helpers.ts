import { baliseDeFormatage, i18n } from '@/i18n/instance';
import { formatDateTime } from '@/utils/date';
import type {Culture } from '@/types';

export type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export interface Intervention {
  id: string;
  type?: string | null;
  date?: string | null;
  dateIntervention?: string | null;
  description?: string | null;
  produit?: string | null;
  quantite?: number | null;
  unite?: string | null;
  cout?: number | null;
}

export interface InterventionGlobale {
  intervention: Intervention;
  parcelleId: string;
  parcelleNom: string;
  cultureId: string;
  cultureNom: string;
  statutCulture: StatutCulture;
}

export interface CultureGlobale extends Culture {
  parcelleId: string;
  parcelleNom: string;
}

export interface ContexteFormulaire {
  parcelleId: string;
  cultureId: string;
  statut: StatutCulture;
}

export function libelleStatut(statut?: string) {
  switch (statut) {
    case 'PLANIFIEE':
      return i18n.t('statuts.PLANIFIEE');
    case 'EN_COURS':
      return i18n.t('statuts.EN_COURS');
    case 'RECOLTEE':
      return i18n.t('statuts.RECOLTEE');
    case 'ABANDONNEE':
      return i18n.t('statuts.ABANDONNEE');
    case 'SUPPRIMEE':
      return i18n.t('statuts.SUPPRIMEE');
    default:
      return statut ?? '';
  }
}

export function badgeVariant(statut?: string): any {
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

export function interventionDate(intervention?: Intervention | null): string | null {
  if (!intervention) {
    return null;
  }

  return intervention.date ?? intervention.dateIntervention ?? null;
}

export function formaterDate(date?: string | null): string {
  if (!date) {
    return 'Date inconnue';
  }

  const valeur = new Date(date);

  if (Number.isNaN(valeur.getTime())) {
    return date;
  }

  return formatDateTime(date);
}

export function formaterMontant(cout?: number | null): string {
  if (cout === undefined || cout === null) {
    return i18n.t('domaine.nonRenseigne');
  }

  return `${new Intl.NumberFormat(baliseDeFormatage()).format(cout)} Ar`;
}

export function normaliserErreur(error: any): string {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Une erreur est survenue."
  );
}
