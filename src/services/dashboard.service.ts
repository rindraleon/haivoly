/**
 * Tableau de bord : compteurs et superficie totale.
 *
 * Aucun écran n'appelle `axios` directement : tout passe par `http` puis par
 * ces fonctions. Les identifiants (`parcelleId`, `cultureId`…) sont envoyés
 * tels quels ; c'est le serveur qui valide la propriété et les règles métier.
 */
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
