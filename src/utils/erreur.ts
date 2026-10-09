import { ApiError, toApiError, type ChampInvalide } from '@/services/http';

type ReponseErreur = {
  response?: { data?: { message?: string | string[] } };
  message?: string | string[];
};

/** Message global affichable (bandeau d'erreur). */
export function messageErreur(error: unknown, defaut: string): string {
  const apiError = error instanceof ApiError ? error : toApiError(error);

  if (apiError.code === 'UNKNOWN') return defaut;

  if (apiError.message && apiError.message !== 'Erreur inconnue') {
    return apiError.message;
  }

  // Filet de sécurité pour les erreurs de validation (message = tableau).
  const brut = error as ReponseErreur;
  const message = brut?.response?.data?.message ?? brut?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return defaut;
}

/** Code stable renvoyé par le serveur (`USER_EMAIL_ALREADY_EXISTS`, …). */
export function codeErreur(error: unknown): string | null {
  const apiError = error instanceof ApiError ? error : toApiError(error);
  return apiError.code === 'UNKNOWN' || apiError.code === 'HTTP_ERROR'
    ? null
    : apiError.code;
}

/** Vrai si l'erreur correspond à l'un des codes fournis. */
export function estErreurDe(error: unknown, ...codes: string[]): boolean {
  const code = codeErreur(error);
  return code !== null && codes.includes(code);
}

/** Champs fautifs identifiés par le serveur. */
export function champsEnErreur(error: unknown): ChampInvalide[] {
  const apiError = error instanceof ApiError ? error : toApiError(error);
  return apiError.fields;
}

export function erreursParChamp(error: unknown): Record<string, string> {
  const resultat: Record<string, string> = {};

  for (const champ of champsEnErreur(error)) {
    // On indexe par le **premier segment** : un formulaire à plat reçoit
    // `pointsGPS` et non `pointsGPS.0.latitude`.
    const cle = champ.field.split('.')[0];
    if (!resultat[cle]) resultat[cle] = champ.message;
  }

  return resultat;
}

export function erreurElement(
  error: unknown,
  champ: string,
  index: number,
): string | undefined {
  const champs = champsEnErreur(error);
  const cible = `${champ}.${index}`;

  // 1. erreur portant précisément sur cet élément (ou un de ses sous-champs) ;
  const precise = champs.find(
    (entree) => entree.field === cible || entree.field.startsWith(`${cible}.`),
  );
  if (precise) return precise.message;

  // 2. sinon, erreur portant sur la liste elle-même (« ajoutez au moins
  //    3 sommets ») : elle concerne tous les éléments.
  return champs.find((entree) => entree.field === champ)?.message;
}

export function champIndexe(path: (string | number)[]): string {
  return path.join('.');
}

/** Message à afficher pour un champ donné, s'il est en erreur. */
export function erreurChamp(error: unknown, champ: string): string | undefined {
  return champsEnErreur(error).find(
    (entree) => entree.field === champ || entree.field.startsWith(`${champ}.`),
  )?.message;
}
