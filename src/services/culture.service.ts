import { http } from '@/services/http';
import { asItems } from '@/utils/api';
// Les charges utiles vivent avec les types métier (`@/types`) : un seul
// endroit à faire évoluer, et les hooks consomment exactement la même forme.
import type { Culture, CulturePayload, Paginated, PointGPS } from '@/types';

export type { CulturePayload };

export const culturesApi = {
  list: (params?: { page?: number; limit?: number; statut?: string; parcelleId?: string }) =>
    http.get<Paginated<Culture>>('/cultures', { params }),
  listByParcelle: (parcelleId: string, params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Culture>>(`/parcelles/${parcelleId}/cultures`, { params }),
  get: (parcelleId: string, cultureId: string) =>
    http.get<Culture>(`/parcelles/${parcelleId}/cultures/${cultureId}`),
  getById: (cultureId: string) => http.get<Culture>(`/cultures/${cultureId}`),
  create: (parcelleId: string, body: CulturePayload) =>
    http.post<Culture>(`/parcelles/${parcelleId}/cultures`, body),
  update: (parcelleId: string, cultureId: string, body: Partial<CulturePayload>) =>
    http.patch<Culture>(`/parcelles/${parcelleId}/cultures/${cultureId}`, body),
  remove: (parcelleId: string, cultureId: string, raison?: string) =>
    http.delete<Culture>(`/parcelles/${parcelleId}/cultures/${cultureId}`, {
      data: { raison },
    }),
  /** Points GPS (délimitation) enregistrés pour une culture. */
  pointsGPS: (parcelleId: string, cultureId: string) =>
    http
      .get<PointGPS[] | Paginated<PointGPS>>(
        `/parcelles/${parcelleId}/cultures/${cultureId}/points-gps`,
      )
      .then(asItems),
  /** Remplace la délimitation d'une culture (au moins 3 points, règle serveur). */
  savePointsGPS: (parcelleId: string, cultureId: string, pointsGPS: PointGPS[]) =>
    http
      .post<PointGPS[] | Paginated<PointGPS>>(
        `/parcelles/${parcelleId}/cultures/${cultureId}/points-gps`,
        { points: pointsGPS },
      )
      .then(asItems),
};
