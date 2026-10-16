export interface ValeursProfil {
  nom: string;
  prenom: string;
  username: string;
  telephone: string;
}

export type CodeErreurProfil =
  | 'NOM_COURT'
  | 'USERNAME_COURT'
  | 'USERNAME_INVALIDE'
  | 'TELEPHONE_INVALIDE';

/** Téléphone malgache ou international : chiffres, espaces, +, tirets. */
const TELEPHONE = /^\+?[0-9][0-9\s.-]{6,19}$/;
const USERNAME = /^[a-z0-9._-]{3,30}$/;

export function validerProfil(valeurs: ValeursProfil): Partial<Record<keyof ValeursProfil, CodeErreurProfil>> {
  const erreurs: Partial<Record<keyof ValeursProfil, CodeErreurProfil>> = {};
  if (valeurs.nom.trim().length < 2) erreurs.nom = 'NOM_COURT';
  const username = valeurs.username.trim().toLowerCase();
  if (username.length < 3) erreurs.username = 'USERNAME_COURT';
  else if (!USERNAME.test(username)) erreurs.username = 'USERNAME_INVALIDE';
  const telephone = valeurs.telephone.trim();
  if (telephone && !TELEPHONE.test(telephone)) erreurs.telephone = 'TELEPHONE_INVALIDE';
  return erreurs;
}
