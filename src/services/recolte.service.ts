import { http } from '@/services/http';
import type { FichierPhoto, Paginated, Photo, PhotoPayload, Recolte , RecoltePayload } from '@/types';


export type { RecoltePayload };

export const recoltesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Recolte>>('/recoltes', { params }),
  getByCulture: (cultureId: string) =>
    http.get<Recolte>(`/cultures/${cultureId}/recolte`),
  create: (cultureId: string, body: RecoltePayload) =>
    http.post<Recolte>(`/cultures/${cultureId}/recolte`, body),
};

export const recoltePhotosApi = {
  list: (recolteId: string) => http.get<Photo[]>(`/recoltes/${recolteId}/photos`),
  get: (recolteId: string, photoId: string) =>
    http.get<Photo>(`/recoltes/${recolteId}/photos/${photoId}`),
  /** `fichier` est préparé par l'appelant (`preparerFichierPhoto` : compressé). */
  upload: (recolteId: string, fichier: FichierPhoto) =>
    http.upload<Photo>(`/recoltes/${recolteId}/photos/upload`, fichier),
  update: (recolteId: string, photoId: string, data: PhotoPayload) =>
    http.patch<Photo>(`/recoltes/${recolteId}/photos/${photoId}`, data),
  remove: (recolteId: string, photoId: string) =>
    http.delete<void>(`/recoltes/${recolteId}/photos/${photoId}`),
};
