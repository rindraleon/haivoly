import { api } from './client';

// =========================
// PHOTO DE RÉCOLTE
// =========================

export interface PhotoRecolte {
  id: string;
  url: string;
  dateAjout: string;
  recolteId: string;
}

// =========================
// RÉCOLTE
// =========================

export interface Recolte {
  id: string;
  dateRecolte: string;
  quantite: number;
  unite: string;
  description?: string | null;
  prixVente?: number | null;
  coutRecolte?: number | null;
  creeA: string;
  modifieA: string;
  cultureId: string;

  photos?: PhotoRecolte[];
}

// =========================
// CRÉER UNE RÉCOLTE
// =========================

export interface CreateRecolteDto {
  dateRecolte: string;
  quantite: number;
  unite: string;
  description?: string;
  prixVente?: number;
  coutRecolte?: number;
}

// =========================
// MODIFIER UNE RÉCOLTE
// =========================

export interface UpdateRecolteDto {
  dateRecolte?: string;
  quantite?: number;
  unite?: string;
  description?: string;
  prixVente?: number;
  coutRecolte?: number;
}

// =========================
// RÉCUPÉRER LA RÉCOLTE
// =========================

/**
 * Récupérer la récolte d'une culture.
 */
export async function getRecolte(
  cultureId: string,
): Promise<Recolte> {
  const response = await api.get<Recolte>(
    `/cultures/${cultureId}/recolte`,
  );

  return response.data;
}

// =========================
// CRÉER UNE RÉCOLTE
// =========================

/**
 * Créer une récolte pour une culture.
 *
 * La culture doit être EN_COURS.
 * Une seule récolte est autorisée par culture.
 */
export async function createRecolte(
  cultureId: string,
  data: CreateRecolteDto,
): Promise<Recolte> {
  const response = await api.post<Recolte>(
    `/cultures/${cultureId}/recolte`,
    data,
  );

  return response.data;
}

// =========================
// MODIFIER UNE RÉCOLTE
// =========================

/**
 * Modifier une récolte.
 *
 * Le backend refuse actuellement la modification
 * d'une récolte appartenant à une culture RECOLTEE.
 */
export async function updateRecolte(
  recolteId: string,
  data: UpdateRecolteDto,
): Promise<Recolte> {
  const response = await api.patch<Recolte>(
    `/recoltes/${recolteId}`,
    data,
  );

  return response.data;
}

// =========================
// SUPPRIMER UNE RÉCOLTE
// =========================

/**
 * Supprimer une récolte.
 *
 * Le backend refuse actuellement la suppression
 * d'une récolte appartenant à une culture RECOLTEE.
 */
export async function deleteRecolte(
  recolteId: string,
): Promise<void> {
  await api.delete(
    `/recoltes/${recolteId}`,
  );
}

// =========================
// UPLOADER UNE PHOTO
// =========================

export async function uploadPhotoRecolte(
  recolteId: string,
  uri: string,
): Promise<PhotoRecolte> {
  const formData = new FormData();

  const filename =
    uri.split('/').pop() || 'photo.jpg';

  const extension = filename
    .split('.')
    .pop()
    ?.toLowerCase();

  let mimeType = 'image/jpeg';

  if (extension === 'png') {
    mimeType = 'image/png';
  } else if (extension === 'webp') {
    mimeType = 'image/webp';
  } else if (
    extension === 'jpg' ||
    extension === 'jpeg'
  ) {
    mimeType = 'image/jpeg';
  }

  formData.append('file', {
    uri,
    name: filename,
    type: mimeType,
  } as any);

  const response = await api.post<{
    message: string;
    photo: PhotoRecolte;
  }>(
    `/recoltes/${recolteId}/photos/upload`,
    formData,
    {
      headers: {
        'Content-Type':
          'multipart/form-data',
      },
    },
  );

  return response.data.photo;
}

// =========================
// RÉCUPÉRER LES PHOTOS
// =========================

export async function getPhotosRecolte(
  recolteId: string,
): Promise<PhotoRecolte[]> {
  const response =
    await api.get<PhotoRecolte[]>(
      `/recoltes/${recolteId}/photos`,
    );

  return response.data;
}

// =========================
// RÉCUPÉRER UNE PHOTO
// =========================

export async function getPhotoRecolte(
  recolteId: string,
  photoId: string,
): Promise<PhotoRecolte> {
  const response =
    await api.get<PhotoRecolte>(
      `/recoltes/${recolteId}/photos/${photoId}`,
    );

  return response.data;
}

// =========================
// MODIFIER UNE PHOTO
// =========================

export async function updatePhotoRecolte(
  recolteId: string,
  photoId: string,
  data: {
    url: string;
  },
): Promise<PhotoRecolte> {
  const response =
    await api.patch<PhotoRecolte>(
      `/recoltes/${recolteId}/photos/${photoId}`,
      data,
    );

  return response.data;
}

// =========================
// SUPPRIMER UNE PHOTO
// =========================

export async function deletePhotoRecolte(
  recolteId: string,
  photoId: string,
): Promise<void> {
  await api.delete(
    `/recoltes/${recolteId}/photos/${photoId}`,
  );
}