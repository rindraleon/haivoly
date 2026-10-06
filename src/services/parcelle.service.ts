/**
 * Parcelles : CRUD et délimitation (le serveur recalcule la superficie).
 *
 * Aucun écran n'appelle `axios` directement : tout passe par `http` puis par
 * ces fonctions. Les identifiants (`parcelleId`, `cultureId`…) sont envoyés
 * tels quels ; c'est le serveur qui valide la propriété et les règles métier.
 */
import { http } from '@/services/http';
import type { Paginated, Parcelle, PointGPS , ParcellePayload } from '@/types';


export type { ParcellePayload };

export const parcellesApi = {
  list: (params?: { page?: number; limit?: number; statut?: string; recherche?: string }) =>
    http.get<Paginated<Parcelle>>('/parcelles', { params }),
  get: (id: string) => http.get<Parcelle>(`/parcelles/${id}`),
  create: (body: ParcellePayload) => http.post<Parcelle>('/parcelles', body),
  update: (id: string, body: Partial<ParcellePayload> & { statut?: string }) =>
    http.patch<Parcelle>(`/parcelles/${id}`, body),
  remove: (id: string, raison: string) =>
    http.delete<Parcelle>(`/parcelles/${id}`, { data: { raison } }),
  /** Délimitation : remplace le polygone, le serveur recalcule la superficie. */
  /** Ajoute des points à la délimitation existante. */
  addPointsGPS: (id: string, pointsGPS: PointGPS[]) =>
    http.post<Parcelle>(`/parcelles/${id}/points-gps`, { pointsGPS }),
  delimitation: (id: string, pointsGPS: PointGPS[]) =>
    http.put<Parcelle>(`/parcelles/${id}/delimitation`, { pointsGPS }),
};
