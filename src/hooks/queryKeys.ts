export const queryKeys = {
  me: ['auth', 'me'] as const,
  dashboard: ['dashboard'] as const,
  parcelles: (params?: unknown) => ['parcelles', params ?? {}] as const,
  parcelle: (id: string) => ['parcelle', id] as const,
  cultures: (params?: unknown) => ['cultures', params ?? {}] as const,
  culture: (id: string) => ['culture', id] as const,
  culturesParcelle: (parcelleId: string) => ['cultures-parcelle', parcelleId] as const,
  interventions: (cultureId: string) => ['interventions', cultureId] as const,
  observations: (cultureId: string) => ['observations', cultureId] as const,
  recoltes: ['recoltes'] as const,
  membresProjet: ['membres-projet'] as const,
  recolte: (cultureId: string) => ['recolte', cultureId] as const,
  photosObservation: (parcelleId: string, cultureId: string, observationId: string) =>
    ['photos-observation', parcelleId, cultureId, observationId] as const,
  photosIntervention: (parcelleId: string, cultureId: string, interventionId: string) =>
    ['photos-intervention', parcelleId, cultureId, interventionId] as const,
  photosRecolte: (recolteId: string) => ['photos-recolte', recolteId] as const,
  recommendations: ['recommendations'] as const,
};

