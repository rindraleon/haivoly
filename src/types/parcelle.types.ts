import type { PointGPS } from './common.types';
import type { WithSyncStatus } from './offline.types';

export type StatutParcelle = 'ACTIVE' | 'ABANDONNEE' | 'ARCHIVEE' | 'SUPPRIMEE';

export interface Parcelle extends WithSyncStatus {
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
// `type` et non `interface` : un payload envoyé dans la file de synchronisation
// doit pouvoir être traité comme un objet de clés/valeurs, sans cast forcé.
export type ParcellePayload = {
  nom: string;
  typeSol?: string | null;
  description?: string | null;
  superficie?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  pointsGPS?: PointGPS[];
}

