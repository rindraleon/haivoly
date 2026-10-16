/**
 * Règles pures du formulaire d'observation V2 (lot 4) : validation de la
 * saisie sans i18n ni réseau — les écrans traduisent les codes d'erreur.
 */

export const DESCRIPTION_MIN = 3;
export const DESCRIPTION_MAX = 500;

export type CodeErreurObservation =
  | 'DESCRIPTION_COURTE'
  | 'DESCRIPTION_LONGUE'
  | 'DATE_MANQUANTE'
  | 'DATE_INVALIDE'
  | 'DATE_FUTURE';

export interface ErreursObservation {
  description?: CodeErreurObservation;
  date?: CodeErreurObservation;
}

/** `YYYY-MM-DD` existant réellement (pas de 31/02, pas de heure ISO). */
export function dateCalendaireValide(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const [annee, mois, jour] = date.split('-').map(Number);
  const valeur = new Date(Date.UTC(annee, mois - 1, jour));
  return (
    valeur.getUTCFullYear() === annee &&
    valeur.getUTCMonth() + 1 === mois &&
    valeur.getUTCDate() === jour
  );
}

/** Le jour calendaire est-il strictement après aujourd'hui (fuseau local) ? */
export function jourEstFutur(date: string, maintenant: Date): boolean {
  const local = new Date(
    Date.UTC(maintenant.getFullYear(), maintenant.getMonth(), maintenant.getDate()),
  );
  const [annee, mois, jour] = date.split('-').map(Number);
  const cible = Date.UTC(annee, mois - 1, jour);
  return cible > local.getTime();
}

export function validerObservation(
  champs: { description: string; date: string },
  maintenant: Date = new Date(),
): ErreursObservation {
  const erreurs: ErreursObservation = {};
  const description = champs.description.trim();
  if (description.length < DESCRIPTION_MIN) erreurs.description = 'DESCRIPTION_COURTE';
  else if (description.length > DESCRIPTION_MAX) erreurs.description = 'DESCRIPTION_LONGUE';

  if (!champs.date) erreurs.date = 'DATE_MANQUANTE';
  else if (!dateCalendaireValide(champs.date)) erreurs.date = 'DATE_INVALIDE';
  else if (jourEstFutur(champs.date, maintenant)) erreurs.date = 'DATE_FUTURE';
  return erreurs;
}

export function observationValide(champs: { description: string; date: string }, maintenant?: Date): boolean {
  return Object.keys(validerObservation(champs, maintenant)).length === 0;
}
