import { api } from './client';

export type StatutParcelle =
  | 'ACTIVE'
  | 'ABANDONNEE'
  | 'ARCHIVEE'
  | 'SUPPRIMEE';

export interface Parcelle {
  id: string;
  nom: string;
  description?: string;
  superficie?: number;
  typeSol?: string;
  latitude?: number;
  longitude?: number;
  creeA?: string;
  modifieA?: string;

  statut: StatutParcelle;
  raisonSuppression?: string | null;

  pointsGPS: {
    id: string;
    latitude: number;
    longitude: number;
    ordre: number;
  }[];
}

export async function getParcelles(): Promise<Parcelle[]> {
  const response = await api.get<Parcelle[]>('/parcelles');

  return response.data;
}

// ==============================
// RECUPERER UNE PARCELLE PAR ID
// ==============================

export async function getParcelleById(
  id: string,
): Promise<Parcelle> {
  const response = await api.get<Parcelle>(
    `/parcelles/${id}`,
  );

  return response.data;
}


// ==============================
// AJOUTER UNE PARCELLE
// ==============================
export interface CreateParcelleData {
  nom: string;
  description?: string;
  superficie?: number;
  typeSol?: string;
}

export async function createParcelle(
  data: CreateParcelleData,
): Promise<Parcelle> {
  const response = await api.post<Parcelle>(
    '/parcelles',
    data,
  );

  return response.data;
}

// ==============================
// MODIFIER UNE PARCELLE
// ==============================

export interface UpdateParcelleData {
  nom?: string;
  description?: string;
  typeSol?: string;

  statut?: 'ACTIVE' | 'ABANDONNEE' | 'ARCHIVEE';
}

export async function updateParcelle(
  id: string,
  data: UpdateParcelleData,
): Promise<Parcelle> {
  const response = await api.patch<Parcelle>(
    `/parcelles/${id}`,
    data,
  );

  return response.data;
}

// ==============================
// SUPPRIMER UNE PARCELLE
// ==============================

export interface DeleteParcelleData {
  raison: string;
}

export async function deleteParcelle(
  id: string,
  data: DeleteParcelleData,
): Promise<Parcelle> {
  const response = await api.delete<Parcelle>(
    `/parcelles/${id}`,
    {
      data,
    },
  );

  return response.data;
}

// ==============================
// AJOUTER LES POINTS GPS
// ==============================

export interface GPSPoint {
  latitude: number;
  longitude: number;
  ordre: number;
}

export async function addPointsGPS(
  parcelleId: string,
  pointsGPS: GPSPoint[],
): Promise<Parcelle> {
  const response = await api.post<Parcelle>(
    `/parcelles/${parcelleId}/points-gps`,
    {
      pointsGPS,
    },
  );

  return response.data;
}

// ==============================
// MODIFIER LA DELIMITATION
// ==============================

export async function updateDelimitation(
  parcelleId: string,
  pointsGPS: GPSPoint[],
  superficie: number,
): Promise<Parcelle> {
  const response = await api.put<Parcelle>(
    `/parcelles/${parcelleId}/delimitation`,
    {
      pointsGPS,
      superficie,
    },
  );

  return response.data;
}