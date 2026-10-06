/**
 * Types du domaine `parcelle` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
import type { PointGPS } from './common.types';

export type StatutParcelle = 'ACTIVE' | 'ABANDONNEE' | 'ARCHIVEE' | 'SUPPRIMEE';

export interface Parcelle {
  id: string;
  nom: string;
  superficie: number | null;
  typeSol: string | null;
  /** Centroïde du polygone : sert au centrage de la carte. */
  latitude: number | null;
  longitude: number | null;
  description: string | null;
  statut: StatutParcelle;
  raisonSuppression?: string | null;
  utilisateurId: string;
  creeA: string;
  modifieA: string;
  pointsGPS: PointGPS[];
  nombreCultures?: number;
  _count?: { cultures: number };
}

/** Charge utile d'écriture d'une parcelle. */
export interface ParcellePayload {
  nom: string;
  typeSol?: string | null;
  description?: string | null;
  superficie?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  pointsGPS?: PointGPS[];
}

