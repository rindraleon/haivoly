/**
 * Règles pures du formulaire d'intervention V2 (lot 4) : validation de la
 * saisie sans i18n ni réseau — les écrans traduisent les codes d'erreur.
 */
import { dateCalendaireValide, jourEstFutur } from '@/features/observations/regles';

export const PRODUIT_MAX = 80;
export const DESCRIPTION_MAX = 500;

export type CodeErreurIntervention =
  | 'TYPE_MANQUANT'
  | 'DATE_MANQUANTE'
  | 'DATE_INVALIDE'
  | 'DATE_FUTURE'
  | 'QUANTITE_INVALIDE'
  | 'COUT_INVALIDE'
  | 'PRODUIT_LONG'
  | 'DESCRIPTION_LONGUE';

export interface ErreursIntervention {
  type?: CodeErreurIntervention;
  date?: CodeErreurIntervention;
  quantite?: CodeErreurIntervention;
  cout?: CodeErreurIntervention;
  produit?: CodeErreurIntervention;
  description?: CodeErreurIntervention;
}

export interface ChampsIntervention {
  type: string | null;
  date: string;
  produit: string;
  quantite: string;
  unite: string | null;
  cout: string;
  description: string;
}

/** Nombre saisi libre : vide = absent, sinon décimal ≥ 0 (virgule acceptée). */
export function nombreSaisiValide(valeur: string): boolean {
  const nettoye = valeur.trim().replace(',', '.');
  if (nettoye === '') return true;
  if (!/^\d+(\.\d+)?$/.test(nettoye)) return false;
  return Number(nettoye) >= 0 && Number.isFinite(Number(nettoye));
}

export function nombreSaisi(valeur: string): number | null {
  const nettoye = valeur.trim().replace(',', '.');
  return nettoye === '' ? null : Number(nettoye);
}

export function validerIntervention(
  champs: ChampsIntervention,
  typesConnus: readonly string[],
  maintenant: Date = new Date(),
): ErreursIntervention {
  const erreurs: ErreursIntervention = {};
  if (!champs.type || !typesConnus.includes(champs.type)) erreurs.type = 'TYPE_MANQUANT';

  if (!champs.date) erreurs.date = 'DATE_MANQUANTE';
  else if (!dateCalendaireValide(champs.date)) erreurs.date = 'DATE_INVALIDE';
  else if (jourEstFutur(champs.date, maintenant)) erreurs.date = 'DATE_FUTURE';

  if (!nombreSaisiValide(champs.quantite)) erreurs.quantite = 'QUANTITE_INVALIDE';
  if (!nombreSaisiValide(champs.cout)) erreurs.cout = 'COUT_INVALIDE';
  if (champs.produit.trim().length > PRODUIT_MAX) erreurs.produit = 'PRODUIT_LONG';
  if (champs.description.trim().length > DESCRIPTION_MAX) erreurs.description = 'DESCRIPTION_LONGUE';
  return erreurs;
}

export function interventionValide(
  champs: ChampsIntervention,
  typesConnus: readonly string[],
  maintenant?: Date,
): boolean {
  return Object.keys(validerIntervention(champs, typesConnus, maintenant)).length === 0;
}
