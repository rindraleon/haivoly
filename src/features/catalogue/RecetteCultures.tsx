import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { CultureCockpitScreen, CulturesListeScreen } from '@/features/cultures';
import { queryKeys } from '@/hooks/queryKeys';
import type { Paginated, Parcelle } from '@/types';

import {
  CULTURES_COMPTE_RECETTE,
  INTERVENTIONS_RECETTE,
  OBSERVATIONS_RECETTE,
  PARCELLES_RECETTE,
  POINTS_CULTURES_RECETTE,
} from './donneesDemo';

export type EcranRecetteCultures = 'cultures' | 'culture';

/**
 * Cache React Query isolé, prérempli avec le jeu de démonstration (lot 3) :
 * les écrans V2 RÉELS s'affichent sans réseau ni session ; le cache de
 * l'application n'est jamais touché.
 */
function creerClientDemo(): QueryClient {
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: Number.POSITIVE_INFINITY,
        gcTime: Number.POSITIVE_INFINITY,
        retry: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
      },
    },
  });
  const pageParcelles: Paginated<Parcelle> = {
    items: PARCELLES_RECETTE,
    total: PARCELLES_RECETTE.length,
    page: 1,
    limit: 200,
    totalPages: 1,
  };
  client.setQueryData(queryKeys.parcelles({ limit: 200 }), pageParcelles);
  client.setQueryData(queryKeys.cultures({ compte: true }), {
    items: CULTURES_COMPTE_RECETTE,
    total: CULTURES_COMPTE_RECETTE.length,
    page: 1,
    limit: CULTURES_COMPTE_RECETTE.length,
    totalPages: 1,
  });
  for (const culture of CULTURES_COMPTE_RECETTE) {
    client.setQueryData(queryKeys.culture(culture.id), culture);
    client.setQueryData(queryKeys.interventions(culture.id), INTERVENTIONS_RECETTE[culture.id] ?? []);
    client.setQueryData(queryKeys.observations(culture.id), OBSERVATIONS_RECETTE[culture.id] ?? []);
    client.setQueryData(['points-culture', culture.id], POINTS_CULTURES_RECETTE[culture.id] ?? []);
  }
  return client;
}

/** Recette visuelle des écrans Cultures V2 (catalogue, développement uniquement). */
export function RecetteCultures({ ecran }: Readonly<{ ecran: EcranRecetteCultures }>) {
  const [client] = useState(creerClientDemo);
  return (
    <QueryClientProvider client={client}>
      {ecran === 'cultures' ? <CulturesListeScreen /> : <CultureCockpitScreen />}
    </QueryClientProvider>
  );
}
