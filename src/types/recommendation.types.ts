/**
 * Types du domaine `recommendation` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
export interface Recommendation {
  id: string;
  /** Destinataire (`all` pour une recommandation diffusée à tous). */
  userId: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  readAt: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
