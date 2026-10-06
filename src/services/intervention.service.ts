/**
 * Interventions : le statut (`PLANIFIEE` / `EN_COURS` / `TERMINEE`) est calculé
 * par le serveur à partir de la date.
 *
 * Aucun écran n'appelle `axios` directement : tout passe par `http` puis par
 * ces fonctions. Les identifiants (`parcelleId`, `cultureId`…) sont envoyés
 * tels quels ; c'est le serveur qui valide la propriété et les règles métier.
 */
import { http } from '@/services/http';
import type { Photo , Intervention, Paginated , InterventionPayload } from '@/types';
import { fichierDepuisUri } from '@/utils/photo';


export type { InterventionPayload };

export const interventionsApi = {
  listByCulture: (cultureId: string, params?: { page?: number; limit?: number }) =>
    http.get<Paginated<Intervention> | Intervention[]>(
      `/cultures/${cultureId}/interventions`,
      { params },
    ),
  get: (id: string) => http.get<Intervention>(`/interventions/${id}`),
  create: (cultureId: string, body: InterventionPayload) =>
    http.post<Intervention>(`/cultures/${cultureId}/interventions`, body),
  update: (id: string, body: Partial<InterventionPayload>) =>
    http.patch<Intervention>(`/interventions/${id}`, body),
  remove: (id: string) => http.delete<{ id: string }>(`/interventions/${id}`),
};

/**
 * Photos rattachées à une intervention (`/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos`, `.../photos/upload`, `.../photos/:id`).
 * Les fichiers sont téléversés en `multipart/form-data` ; le serveur normalise
 * l'URL publique avant de la stocker.
 */
export const interventionPhotosApi = {
  list: (parcelleId: string, cultureId: string, interventionId: string) => http.get<Photo[]>(`/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos`),
  upload: (parcelleId: string, cultureId: string, interventionId: string, uri: string) =>
    http.upload<Photo>(`/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos/upload`, fichierDepuisUri(uri)),
  remove: (parcelleId: string, cultureId: string, interventionId: string, photoId: string) => http.delete<void>(`/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos/${photoId}`),
};
