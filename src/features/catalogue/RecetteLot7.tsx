import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DashboardScreen } from '@/features/dashboard';
import { queryKeys } from '@/hooks/queryKeys';
import type { Culture, Paginated, Parcelle, Recolte, Utilisateur } from '@/types';
import { CULTURES_COMPTE_RECETTE, PARCELLES_RECETTE, RECOLTES_RECETTE } from './donneesDemo';

const UTILISATEUR_RECETTE: Utilisateur = {
  id: 'demo-u1',
  nom: 'Rasoa',
  prenom: 'Lova',
  email: 'lova@haivoly.demo',
  telephone: '+261 34 05 123 45',
  role: 'AGRICULTEUR',
  username: 'lova.r',
  estVerifie: true,
  creeA: '2024-03-12T10:00:00.000Z',
};

/** Récoltes du compte : kg convertibles et sacs (cumul à unités mixtes). */
const RECOLTES_COMPTE_RECETTE: Recolte[] = [
  RECOLTES_RECETTE['demo-c2'],
  {
    id: 'demo-r4',
    dateRecolte: '2026-06-12',
    quantite: 1850,
    unite: 'kg',
    description: 'Calibre moyen, bonne tenue.',
    prixVente: 2_590_000,
    coutRecolte: 180_000,
    cultureId: 'demo-c4',
    _syncStatus: 'SYNCED',
  } as Recolte,
  {
    ...RECOLTES_RECETTE['demo-c2'],
    id: 'demo-r3',
    dateRecolte: '2026-03-05',
    quantite: 6,
    unite: 'sac',
    description: 'Récolte de jardin, autoconsommation.',
    prixVente: null,
    coutRecolte: 40_000,
    cultureId: 'demo-c1',
  },
];

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
  client.setQueryData<Utilisateur>(queryKeys.me, UTILISATEUR_RECETTE);
  client.setQueryData<Recolte[]>(queryKeys.recoltes, RECOLTES_COMPTE_RECETTE);

  // Le tableau de bord lit `useParcelles({ limit: 200 })` et
  // `useCultures({ limit: 200 })` : mêmes clés exactes que les hooks.
  const pageParcelles: Paginated<Parcelle> = {
    items: PARCELLES_RECETTE,
    total: PARCELLES_RECETTE.length,
    page: 1,
    limit: 200,
    totalPages: 1,
  };
  client.setQueryData(queryKeys.parcelles({ limit: 200 }), pageParcelles);
  const pageCultures: Paginated<Culture> = {
    items: CULTURES_COMPTE_RECETTE,
    total: CULTURES_COMPTE_RECETTE.length,
    page: 1,
    limit: 200,
    totalPages: 1,
  };
  client.setQueryData(queryKeys.cultures({ limit: 200 }), pageCultures);
  for (const parcelle of PARCELLES_RECETTE) client.setQueryData(queryKeys.parcelle(parcelle.id), parcelle);
  return client;
}

/**
 * Recette du lot 7 : tableau de bord V2 virtualisé avec sa section
 * « Récoltes du compte », rendu sans session ni réseau (cache isolé).
 */
export function RecetteLot7({ ecran }: { ecran: string }) {
  const client = useMemo(() => creerClientDemo(), []);
  return (
    <QueryClientProvider client={client}>
      {ecran === 'tableau-de-bord' ? <DashboardScreen /> : null}
    </QueryClientProvider>
  );
}
