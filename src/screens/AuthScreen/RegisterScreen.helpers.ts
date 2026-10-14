export type Errors = {
  nom?: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  password?: string;
  /** Nom d'utilisateur public ; clé identique à celle du champ renvoyé par l'API. */
  username?: string;
  general?: string;
};

export const CLE_ERREUR_SERVEUR_PSEUDO: Record<string, string> = {
  USER_USERNAME_ALREADY_EXISTS: 'pseudo.erreur.pris',
  USER_USERNAME_RESERVED: 'pseudo.erreur.reserve',
};

export function cleErreurPseudoServeur(code: unknown): string | undefined {
  return typeof code === 'string' ? CLE_ERREUR_SERVEUR_PSEUDO[code] : undefined;
}

export const LANGUES_COMPTE = ['fr', 'en', 'mg'] as const;

export function langueAPI(locale: string | null | undefined): (typeof LANGUES_COMPTE)[number] {
  const code = (locale ?? 'fr').slice(0, 2).toLowerCase();
  return (LANGUES_COMPTE as readonly string[]).includes(code)
    ? (code as (typeof LANGUES_COMPTE)[number])
    : 'fr';
}
