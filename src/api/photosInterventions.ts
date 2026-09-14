import { api } from './client';

export interface PhotoIntervention {
  id: string;
  url: string;
  dateAjout: string;
  description?: string | null;
  interventionId: string;
}

export interface CreatePhotoInterventionData {
  url: string;
  description?: string;
}

export interface UpdatePhotoInterventionData {
  url?: string;
  description?: string;
}

/**
 * Récupérer toutes les photos d'une intervention
 */
export async function getPhotosIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
): Promise<PhotoIntervention[]> {
  const response = await api.get(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos`,
  );

  return response.data;
}

/**
 * Récupérer une photo précise
 */
export async function getPhotoInterventionById(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
  photoId: string,
): Promise<PhotoIntervention> {
  const response = await api.get(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos/${photoId}`,
  );

  return response.data;
}

/**
 * Ajouter une photo à une intervention
 */
export async function createPhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
  data: CreatePhotoInterventionData,
): Promise<PhotoIntervention> {
  const response = await api.post(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos`,
    data,
  );

  return response.data;
}

/**
 * Modifier une photo
 */
export async function updatePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
  photoId: string,
  data: UpdatePhotoInterventionData,
): Promise<PhotoIntervention> {
  const response = await api.patch(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos/${photoId}`,
    data,
  );

  return response.data;
}

/**
 * Supprimer une photo
 */
export async function deletePhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
  photoId: string,
): Promise<void> {
  await api.delete(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos/${photoId}`,
  );
}

/**
 * Uploader une photo depuis le téléphone
 */
export async function uploadPhotoIntervention(
  parcelleId: string,
  cultureId: string,
  interventionId: string,
  uri: string,
): Promise<PhotoIntervention> {
  const formData = new FormData();

  const filename = uri.split('/').pop() || 'photo.jpg';

  const extension = filename
    .split('.')
    .pop()
    ?.toLowerCase();

  let mimeType = 'image/jpeg';

  if (extension === 'png') {
    mimeType = 'image/png';
  } else if (extension === 'webp') {
    mimeType = 'image/webp';
  }
  
  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await api.post(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${interventionId}/photos/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.photo;
}