import { http } from '@/services/http';

export interface DashboardData {
  parcelles: number;
  cultures: number;
  culturesEnCours: number;
  interventions: number;
  recoltes: number;
  superficieTotale: number;
  [key: string]: unknown;
}

export const dashboardApi = {
  get: () => http.get<DashboardData>('/dashboard'),
};
