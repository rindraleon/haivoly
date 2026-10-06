/**
 * Types du domaine `observation` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
export interface Observation {
  id: string;
  description: string;
  date: string;
  cultureId: string;
  photos: { id: string; url: string; dateAjout: string }[];
}

/** Charge utile d'écriture d'une observation (`date` en ISO-8601). */
export interface ObservationPayload {
  description: string;
  date?: string;
}

export type UpdateObservationPayload = Partial<ObservationPayload>;
