export type Role = 'AGRICULTEUR' | 'PROPRIETAIRE';

/** Langues d'interface et de contenu des e-mails, identiques au serveur. */
export type LangueCompte = 'fr' | 'en' | 'mg';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string | null;
  email: string;
  telephone: string | null;
  role: Role;
  username?: string;
  /** Préférence de langue du compte ; le serveur traduit les e-mails dessus. */
  langue?: LangueCompte | null;
  /** Adresse e-mail confirmée. Un compte non confirmé ne peut rien recevoir. */
  estVerifie?: boolean;
  motDePasseProvisoire?: boolean;
  creeA?: string;
}
