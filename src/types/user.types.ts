export type Role = 'AGRICULTEUR' | 'PROPRIETAIRE';

export interface Utilisateur {
  id: string;
  nom: string;
  prenom: string | null;
  email: string;
  telephone: string | null;
  role: Role;
  creeA?: string;
}
