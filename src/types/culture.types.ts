import type { PointGPS } from './common.types';
import type { Parcelle } from './parcelle.types';
import type { Recolte } from './recolte.types';
import type { WithSyncStatus } from './offline.types';

export type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export interface Culture extends WithSyncStatus {
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

