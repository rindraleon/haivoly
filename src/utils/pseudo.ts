
export const PSEUDO_LONGUEUR_MIN = 3;
export const PSEUDO_LONGUEUR_MAX = 30;
export const PSEUDO_FORMATTE = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/;

/** Noms que la plateforme réserve, identiques à ceux du backend. */
export const PSEUDOS_RESERVES: readonly string[] = [
  'admin',
  'root',
  'support',
  'contact',
  'haivolay',
  'haivoly',
  'test',
  'utilisateur',
  'system',
  'noreply',
  'info',
  'security',
  'moderateur',
  'contributeur',
  'superviseur',
  'proprietaire',
];

export type MotifErreurPseudo =
  | 'VIDE'
  | 'TROP_COURT'
  | 'TROP_LONG'
  | 'CARACTERES_NON_AUTORISES'
  | 'FORME_INVALIDE'
  | 'RESERVE';

export interface VerdictPseudo {
  valide: boolean;
  motif?: MotifErreurPseudo;
}

const ACCENTS: readonly (readonly [RegExp, string])[] = [
  [/[àáâãäå]/g, 'a'],
  [/[èéêë]/g, 'e'],
  [/[ìíîï]/g, 'i'],
  [/[òóôõö]/g, 'o'],
  [/[ùúûü]/g, 'u'],
  [/ç/g, 'c'],
  [/ñ/g, 'n'],
  [/[ýÿ]/g, 'y'],
];

function rognerTirets(valeur: string): string {
  let debut = 0;
  let fin = valeur.length;
  while (valeur[debut] === '-') debut += 1;
  while (fin > debut && valeur[fin - 1] === '-') fin -= 1;
  return valeur.slice(debut, fin);
}

export function normaliserPseudo(brut: string | null | undefined): string {
  if (!brut) return '';

  let valeur = String(brut).toLowerCase();
  for (const [regex, remplacement] of ACCENTS) {
    valeur = valeur.replace(regex, remplacement);
  }

  // Bordures rognées avant la troncature : sinon le tiret supprimé aurait coûté
  // un caractère utile sur la longueur maximale autorisée.
  const canonique = rognerTirets(
    valeur.replace(/[^a-z0-9._\-\s]/g, ' ').replace(/[._\-\s]+/g, '-'),
  ).slice(0, PSEUDO_LONGUEUR_MAX);

  // Une troncature peut laisser un tiret en fin de chaîne.
  return rognerTirets(canonique);
}

export function validerPseudo(brut: string | null | undefined): VerdictPseudo {
  const valeur = normaliserPseudo(brut);

  if (!valeur) return { valide: false, motif: 'VIDE' };
  if (valeur.length < PSEUDO_LONGUEUR_MIN) {
    return { valide: false, motif: 'TROP_COURT' };
  }
  if (String(brut ?? '').trim().length > PSEUDO_LONGUEUR_MAX) {
    return { valide: false, motif: 'TROP_LONG' };
  }
  if (!PSEUDO_FORMATTE.test(valeur)) {
    return {
      valide: false,
      motif: /[a-z0-9]/.test(valeur) ? 'FORME_INVALIDE' : 'CARACTERES_NON_AUTORISES',
    };
  }
  if (PSEUDOS_RESERVES.includes(valeur)) return { valide: false, motif: 'RESERVE' };

  return { valide: true };
}

export function pseudoDepuisNom(prenom?: string | null, nom?: string | null): string {
  return normaliserPseudo(prenom) || normaliserPseudo(nom);
}

/** Ce que l'utilisateur verra dans l'application et dans les e-mails. */
export function afficherPseudo(pseudo: string | null | undefined): string {
  return pseudo ? `@${pseudo}` : '';
}

export const CLE_ERREUR_PSEUDO: Record<MotifErreurPseudo, string> = {
  VIDE: 'pseudo.erreur.requis',
  TROP_COURT: 'pseudo.erreur.tropCourt',
  TROP_LONG: 'pseudo.erreur.tropLong',
  CARACTERES_NON_AUTORISES: 'pseudo.erreur.caracteres',
  FORME_INVALIDE: 'pseudo.erreur.forme',
  RESERVE: 'pseudo.erreur.reserve',
};
