import { api } from './client';

// ==============================
// STATUT D'UNE CULTURE
// ==============================

export type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';
// ==============================
// INTERFACE CULTURE
// ==============================

export interface Culture {
  id: string;

  nom: string;
  type?: string;
  variete?: string;

  datePlantation?: string;
  datePrevueRecolte?: string;

  description?: string;
  stade?: string;

  statut: StatutCulture;

  creeA?: string;
  modifieA?: string;

  raisonSuppression?: string | null;

  parcelleId?: string;
}

// ==============================
// RECUPERER LES CULTURES
// D'UNE PARCELLE
// ==============================

export async function getCultures(
  parcelleId: string,
): Promise<Culture[]> {
  const response = await api.get<Culture[]>(
    `/parcelles/${parcelleId}/cultures`,
  );

  return response.data;
}

// ==============================
// RECUPERER UNE CULTURE PAR ID
// ==============================

export async function getCultureById(
  parcelleId: string,
  id: string,
): Promise<Culture> {
  const response = await api.get<Culture>(
    `/parcelles/${parcelleId}/cultures/${id}`,
  );

  return response.data;
}

// ==============================
// AJOUTER UNE CULTURE
// ==============================

export interface CreateCultureData {
  nom: string;

  type?: string;
  variete?: string;

  datePlantation?: string;
  datePrevueRecolte?: string;

  description?: string;
  stade?: string;

  statut?: StatutCulture;
}

export async function createCulture(
  parcelleId: string,
  data: CreateCultureData,
): Promise<Culture> {
  const response = await api.post<Culture>(
    `/parcelles/${parcelleId}/cultures`,
    data,
  );

  return response.data;
}

// ==============================
// MODIFIER UNE CULTURE
// ==============================

export interface UpdateCultureData {
  nom?: string;

  type?: string;
  variete?: string;

  datePlantation?: string;
  datePrevueRecolte?: string;

  description?: string;
  stade?: string;

  statut?: StatutCulture;
}

export async function updateCulture(
  parcelleId: string,
  id: string,
  data: UpdateCultureData,
): Promise<Culture> {
  const response = await api.patch<Culture>(
    `/parcelles/${parcelleId}/cultures/${id}`,
    data,
  );

  return response.data;
}

// ==============================
// SUPPRIMER UNE CULTURE
// ==============================

export interface DeleteCultureData {
  raison?: string;
}

export async function deleteCulture(
  parcelleId: string,
  id: string,
  data?: DeleteCultureData,
): Promise<Culture> {
  const response = await api.delete<Culture>(
    `/parcelles/${parcelleId}/cultures/${id}`,
    {
      data,
    },
  );

  return response.data;
}

// ==============================
// POINT GPS D'UNE CULTURE
// ==============================

export interface PointGPSCulture {
  id?: string;
  latitude: number;
  longitude: number;
  ordre: number;
  cultureId?: string;
  creeA?: string;
  modifieA?: string;
}

// ==============================
// RÉCUPÉRER LES POINTS GPS
// ==============================

export async function getPointsGPSCulture(
  parcelleId: string,
  cultureId: string,
): Promise<PointGPSCulture[]> {
  const response =
    await api.get<PointGPSCulture[]>(
      `/parcelles/${parcelleId}/cultures/${cultureId}/points-gps`,
    );

  return response.data;
}

// ==============================
// ENREGISTRER LES POINTS GPS
// ==============================

export async function savePointsGPSCulture(
  parcelleId: string,
  cultureId: string,
  points: PointGPSCulture[],
): Promise<PointGPSCulture[]> {
  const response =
    await api.post<PointGPSCulture[]>(
      `/parcelles/${parcelleId}/cultures/${cultureId}/points-gps`,
      {
        points,
      },
    );

  return response.data;
}