/**
 * Types du domaine `intervention` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
import type { StatutCulture } from './culture.types';

export type StatutIntervention = 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE';

export type TypeIntervention =
  | 'PLANTATION'
  | 'IRRIGATION'
  | 'FERTILISATION'
  | 'DESHERBAGE'
  | 'TRAITEMENT'
  | 'ENTRETIEN'
  | 'INSPECTION'
  | 'AUTRE';

export interface Intervention {
  id: string;
  type: TypeIntervention | string;
  description: string | null;
  /** Horodatage ISO-8601. */
  date: string;
  produit: string | null;
  quantite: number | null;
  unite: string | null;
  cout: number | null;
  /** **Calculé par le serveur** : le mobile ne l'envoie jamais. */
  statut: StatutIntervention;
  cultureId: string;
  culture?: {
    id: string;
    nom: string;
    statut: StatutCulture;
    parcelleId: string;
  };
  photos?: unknown[];
  creeA: string;
  modifieA: string;
}

/** Charge utile d'écriture d'une intervention (`date` en ISO-8601). */
export interface InterventionPayload {
  type: string;
  description?: string | null;
  date?: string;
  produit?: string | null;
  quantite?: number | null;
  unite?: string | null;
  cout?: number | null;
}

export type UpdateInterventionPayload = Partial<InterventionPayload>;
