/**
 * Types du domaine `recolte` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
export interface Recolte {
  id: string;
  /** `YYYY-MM-DD` */
  dateRecolte: string;
  quantite: number;
  unite: string;
  description: string | null;
  prixVente: number | null;
  coutRecolte: number | null;
  cultureId: string;
  creeA?: string;
  photos?: { id: string; url: string }[];
}

/** Charge utile de création d'une récolte (`dateRecolte` calendaire). */
export interface RecoltePayload {
  /** Date calendaire `YYYY-MM-DD`. */
  dateRecolte: string;
  quantite: number;
  unite: string;
  description?: string | null;
  prixVente?: number | null;
  coutRecolte?: number | null;
}
