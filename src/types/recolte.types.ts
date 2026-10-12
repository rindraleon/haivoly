import type { WithSyncStatus } from './offline.types';

export interface Recolte extends WithSyncStatus {
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
