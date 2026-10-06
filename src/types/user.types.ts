/**
 * Types du domaine `user` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
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
