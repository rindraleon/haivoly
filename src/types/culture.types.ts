/**
 * Types du domaine `culture` — contrat partagé avec l'API.
 *
 * Contrat de dates :
 *   • date calendaire → `YYYY-MM-DD` (jamais convertie en `Date`)
 *   • horodatage      → ISO-8601 UTC
 *   • affichage       → `JJ/MM/AAAA` (voir `@/utils/date`)
 */
import type { PointGPS } from './common.types';
import type { Parcelle } from './parcelle.types';
import type { Recolte } from './recolte.types';

export type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export interface Culture {
  id: string;
  nom: string;
  type: string | null;
  variete: string | null;
  /** `YYYY-MM-DD` */
  datePlantation: string | null;
  /** `YYYY-MM-DD` */
  datePrevueRecolte: string | null;
  description: string | null;
  stade: string | null;
  statut: StatutCulture;
  raisonSuppression?: string | null;
  parcelleId: string;
  parcelle?: Pick<
    Parcelle,
    'id' | 'nom' | 'superficie' | 'latitude' | 'longitude' | 'statut'
  >;
  pointsGPS: PointGPS[];
  recolte?: Recolte | null;
  creeA: string;
  modifieA: string;
}

/**
 * Charge utile d'écriture d'une culture.
 *
 * `statut` n'est accepté que pour les transitions explicites : le passage à
 * `RECOLTEE` est décidé par le serveur lors de la création d'une récolte.
 */
export interface CulturePayload {
  nom: string;
  type?: string | null;
  variete?: string | null;
  /** Date calendaire `YYYY-MM-DD`. */
  datePlantation?: string | null;
  /** Date calendaire `YYYY-MM-DD`. */
  datePrevueRecolte?: string | null;
  description?: string | null;
  stade?: string | null;
  statut?: StatutCulture;
  pointsGPS?: PointGPS[];
}

export type UpdateCulturePayload = Partial<CulturePayload>;

