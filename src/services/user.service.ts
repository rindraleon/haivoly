import { http } from './http';

import type { Role } from '@/types';

/** Aperçu d'un membre du projet, tel que renvoyé par `GET /users` (propriétaire). */
export interface ApercuMembre {
  id: string;
  nom: string;
  prenom: string | null;
  nomComplet: string;
  username: string;
  email?: string;
  role: Role | string;
  estVerifie: boolean;
}

export const userService = {
  /** Liste des comptes du périmètre (réservé au propriétaire côté serveur). */
  lister: () => http.get<ApercuMembre[]>('/users'),
};
