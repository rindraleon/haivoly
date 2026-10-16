import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { ParcelleCockpitScreen, ParcellesListeScreen } from '@/features/parcelles';
import ParcelleHistoryScreen from '@/screens/ParcelleScreen/ParcelleHistoryScreen';
import { queryKeys } from '@/hooks/queryKeys';
import type { Paginated, Parcelle } from '@/types';

import { CULTURES_RECETTE, PARCELLES_RECETTE } from './donneesDemo';

export type EcranRecette = 'parcelles' | 'parcelle' | 'historique';

/**
 * Cache React Query isolé, prérempli avec le jeu de démonstration : les
 * écrans V2 RÉELS s'affichent sans réseau ni session, et le cache de
 * l'application (données de l'utilisateur) n'est jamais touché.
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
  const page: Paginated<Parcelle> = {
    items: PARCELLES_RECETTE,
    total: PARCELLES_RECETTE.length,
    page: 1,
    limit: 200,
    totalPages: 1,
  };
  client.setQueryData(queryKeys.parcelles({ limit: 200 }), page);
  for (const parcelle of PARCELLES_RECETTE) {
    client.setQueryData(queryKeys.parcelle(parcelle.id), parcelle);
    client.setQueryData(queryKeys.culturesParcelle(parcelle.id), CULTURES_RECETTE[parcelle.id] ?? []);
  }
  return client;
}

/** Recette visuelle des écrans Parcelles (catalogue, développement uniquement). */
export function RecetteParcelles({ ecran }: Readonly<{ ecran: EcranRecette }>) {
  const [client] = useState(creerClientDemo);
  return (
    <QueryClientProvider client={client}>
      {ecran === 'parcelles' ? <ParcellesListeScreen /> : null}
      {ecran === 'parcelle' ? <ParcelleCockpitScreen /> : null}
      {/* Historique V1 (route /historique-parcelles) + « Réactiver » du lot 2 bis */}
      {ecran === 'historique' ? <ParcelleHistoryScreen /> : null}
    </QueryClientProvider>
  );
}
