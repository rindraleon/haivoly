/**
 * Observations rattachées à une culture.
 *
 * Aucun écran n'appelle `axios` directement : tout passe par `http` puis par
 * ces fonctions. Les identifiants (`parcelleId`, `cultureId`…) sont envoyés
 * tels quels ; c'est le serveur qui valide la propriété et les règles métier.
 */
import { http } from '@/services/http';
import type { FichierPhoto, Photo , Observation, Paginated } from '@/types';

export const observationsApi = {
  listByCulture: (cultureId: string, params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Observation> | Observation[]>(
      `/cultures/${cultureId}/observations`,
      { params },
    ),
  get: (id: string) => http.get<Observation>(`/observations/${id}`),
  create: (cultureId: string, body: { description: string; date?: string }) =>
    http.post<Observation>(`/cultures/${cultureId}/observations`, body),
  update: (id: string, body: { description?: string; date?: string }) =>
    http.patch<Observation>(`/observations/${id}`, body),
  remove: (id: string) => http.delete<{ id: string }>(`/observations/${id}`),
};

/**
 * Photos rattachées à une observation (`/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}/photos`, `.../photos/upload`, `.../photos/:id`).
 * Les fichiers sont téléversés en `multipart/form-data` ; le serveur normalise
 * l'URL publique avant de la stocker.
 */
export const observationPhotosApi = {
  list: (parcelleId: string, cultureId: string, observationId: string) => http.get<Photo[]>(`/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}/photos`),
  /** `fichier` est préparé par l'appelant (`preparerFichierPhoto` : compressé). */
  upload: (
    parcelleId: string,
    cultureId: string,
    observationId: string,
    fichier: FichierPhoto,
  ) =>
    http.upload<Photo>(
      `/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}/photos/upload`,
      fichier,
    ),
  remove: (parcelleId: string, cultureId: string, observationId: string, photoId: string) => http.delete<void>(`/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}/photos/${photoId}`),
};
