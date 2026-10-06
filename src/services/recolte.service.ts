/**
 * Récoltes : la création bascule la culture en `RECOLTEE` côté serveur.
 *
 * Aucun écran n'appelle `axios` directement : tout passe par `http` puis par
 * ces fonctions. Les identifiants (`parcelleId`, `cultureId`…) sont envoyés
 * tels quels ; c'est le serveur qui valide la propriété et les règles métier.
 */
import { http } from '@/services/http';
import { fichierDepuisUri } from '@/utils/photo';
import type { Paginated, Photo, PhotoPayload, Recolte , RecoltePayload } from '@/types';


export type { RecoltePayload };

export const recoltesApi = {
  list: (params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Recolte>>('/recoltes', { params }),
  getByCulture: (cultureId: string) =>
    http.get<Recolte>(`/cultures/${cultureId}/recolte`),
  /**
   * Le serveur bascule la culture en `RECOLTEE` **dans la même transaction**.
   * Le mobile n'envoie jamais de statut.
   */
  create: (cultureId: string, body: RecoltePayload) =>
    http.post<Recolte>(`/cultures/${cultureId}/recolte`, body),
};

/**
 * Photos d'une récolte (`/recoltes/:recolteId/photos`).
 *
 * Une récolte doit être rattachée à une culture `RECOLTEE` : sinon le serveur
 * répond 400 avec un message explicite.
 */
export const recoltePhotosApi = {
  list: (recolteId: string) => http.get<Photo[]>(`/recoltes/${recolteId}/photos`),
  get: (recolteId: string, photoId: string) =>
    http.get<Photo>(`/recoltes/${recolteId}/photos/${photoId}`),
  upload: (recolteId: string, uri: string) =>
    http.upload<Photo>(`/recoltes/${recolteId}/photos/upload`, fichierDepuisUri(uri)),
  update: (recolteId: string, photoId: string, data: PhotoPayload) =>
    http.patch<Photo>(`/recoltes/${recolteId}/photos/${photoId}`, data),
  remove: (recolteId: string, photoId: string) =>
    http.delete<void>(`/recoltes/${recolteId}/photos/${photoId}`),
};
