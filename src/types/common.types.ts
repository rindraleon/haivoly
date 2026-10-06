/**
 * Types du domaine `common` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
export interface PointGPS {
  id?: string;
  ordre?: number;
  latitude: number;
  longitude: number;
}

/** Réponse paginée standard de l'API. */
export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
