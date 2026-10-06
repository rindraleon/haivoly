/**
 * Clés de cache TanStack Query — centralisées pour garantir des invalidations
 * cohérentes entre les écrans.
 */
export const queryKeys = {
  me: ['auth', 'me'] as const,
  dashboard: ['dashboard'] as const,
  parcelles: (params?: unknown) => ['parcelles', params ?? {}] as const,
  parcelle: (id: string) => ['parcelle', id] as const,
  cultures: (params?: unknown) => ['cultures', params ?? {}] as const,
  culture: (id: string) => ['culture', id] as const,
  /**
   * Cultures d'**une** parcelle, servies sous forme de tableau
   * (`culturesApi.listByParcelle`). Clé distincte de `cultures` : les deux
   * requêtes ne renvoient pas la même forme (tableau vs page paginée).
   */
  culturesParcelle: (parcelleId: string) => ['cultures-parcelle', parcelleId] as const,
  interventions: (cultureId: string) => ['interventions', cultureId] as const,
  observations: (cultureId: string) => ['observations', cultureId] as const,
  recoltes: ['recoltes'] as const,
  recolte: (cultureId: string) => ['recolte', cultureId] as const,
  photosObservation: (parcelleId: string, cultureId: string, observationId: string) =>
    ['photos-observation', parcelleId, cultureId, observationId] as const,
  photosIntervention: (parcelleId: string, cultureId: string, interventionId: string) =>
    ['photos-intervention', parcelleId, cultureId, interventionId] as const,
  photosRecolte: (recolteId: string) => ['photos-recolte', recolteId] as const,
  recommendations: ['recommendations'] as const,
};

