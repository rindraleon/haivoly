import { api } from './client';

// ==============================
// INTERFACE INTERVENTION
// ==============================

export interface Intervention {
  id: string;

  type: string;
  description?: string | null;

  date: string;

  produit?: string | null;
  quantite?: number | null;
  unite?: string | null;
  cout?: number | null;

  cultureId: string;

  creeA?: string;
  modifieA?: string;
}

// ==============================
// AJOUTER UNE INTERVENTION
// ==============================

export interface CreateInterventionData {
  type: string;

  description?: string;
  date?: string;

  produit?: string;
  quantite?: number;
  unite?: string;
  cout?: number;
}

export async function createIntervention(
  parcelleId: string,
  cultureId: string,
  data: CreateInterventionData,
): Promise<Intervention> {
  const response = await api.post<Intervention>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions`,
    data,
  );

  return response.data;
}

// ==============================
// RECUPERER LES INTERVENTIONS
// ==============================

export async function getInterventions(
  parcelleId: string,
  cultureId: string,
): Promise<Intervention[]> {
  const response = await api.get<Intervention[]>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions`,
  );

  return response.data;
}

// ==============================
// RECUPERER UNE INTERVENTION
// ==============================

export async function getInterventionById(
  parcelleId: string,
  cultureId: string,
  id: string,
): Promise<Intervention> {
  const response = await api.get<Intervention>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${id}`,
  );

  return response.data;
}

// ==============================
// MODIFIER UNE INTERVENTION
// ==============================

export interface UpdateInterventionData {
  type?: string;

  description?: string;
  date?: string;

  produit?: string;
  quantite?: number;
  unite?: string;
  cout?: number;
}

export async function updateIntervention(
  parcelleId: string,
  cultureId: string,
  id: string,
  data: UpdateInterventionData,
): Promise<Intervention> {
  const response = await api.patch<Intervention>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${id}`,
    data,
  );

  return response.data;
}

// ==============================
// SUPPRIMER UNE INTERVENTION
// ==============================

export async function deleteIntervention(
  parcelleId: string,
  cultureId: string,
  id: string,
): Promise<Intervention> {
  const response = await api.delete<Intervention>(
    `/parcelles/${parcelleId}/cultures/${cultureId}/interventions/${id}`,
  );

  return response.data;
}