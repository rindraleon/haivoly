import { api } from './client';

// ==============================
// INTERFACE OBSERVATION
// ==============================

export interface Observation {
  id: string;

  description: string;
  date: string;

  cultureId: string;

  modifieA?: string;

  photos?: PhotoObservation[];
}

// ==============================
// PHOTO OBSERVATION
// ==============================

export interface PhotoObservation {
  id: string;
  url: string;
  dateAjout: string;
  description?: string | null;
  observationId: string;
}

// ==============================
// AJOUTER UNE OBSERVATION
// ==============================

export interface CreateObservationData {
  description: string;
  date?: string;
}

export async function createObservation(
  parcelleId: string,
  cultureId: string,
  data: CreateObservationData,
): Promise<Observation> {
  const response = await api.post<Observation>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations`,
    data,
  );

  return response.data;
}

// ==============================
// RECUPERER LES OBSERVATIONS
// ==============================

export async function getObservations(
  parcelleId: string,
  cultureId: string,
): Promise<Observation[]> {
  const response = await api.get<Observation[]>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations`,
  );

  return response.data;
}

// ==============================
// RECUPERER UNE OBSERVATION
// ==============================

export async function getObservationById(
  parcelleId: string,
  cultureId: string,
  observationId: string,
): Promise<Observation> {
  const response = await api.get<Observation>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}`,
  );

  return response.data;
}

// ==============================
// MODIFIER UNE OBSERVATION
// ==============================

export interface UpdateObservationData {
  description?: string;
  date?: string;
}

export async function updateObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
  data: UpdateObservationData,
): Promise<Observation> {
  const response = await api.patch<Observation>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}`,
    data,
  );

  return response.data;
}

// ==============================
// SUPPRIMER UNE OBSERVATION
// ==============================

export async function deleteObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
): Promise<Observation> {
  const response = await api.delete<Observation>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}`,
  );

  return response.data;
}

// ==============================
// UPLOAD PHOTO OBSERVATION
// ==============================

export async function uploadPhotoObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
  uri: string,
): Promise<PhotoObservation> {
  const formData = new FormData();

  const filename =
    uri.split('/').pop() || 'photo.jpg';

  const extension =
    filename.split('.').pop()?.toLowerCase();

  let mimeType = 'image/jpeg';

  if (extension === 'png') {
    mimeType = 'image/png';
  } else if (extension === 'webp') {
    mimeType = 'image/webp';
  }

  formData.append(
    'file',
    {
      uri,
      name: filename,
      type: mimeType,
    } as any,
  );

  const response = await api.post(
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}/photos/upload`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    },
  );

  return response.data.photo;
}

// ==============================
// SUPPRIMER UNE PHOTO
// ==============================

export async function deletePhotoObservation(
  parcelleId: string,
  cultureId: string,
  observationId: string,
  photoId: string,
): Promise<void> {
  const url =
    `/parcelles/${parcelleId}/cultures/${cultureId}/observations/${observationId}/photos/${photoId}`;

  console.log('🗑️ URL SUPPRESSION PHOTO:', url);

  await api.delete(url);
}