import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { ProfilParametresScreen, ProfilFormulaireScreen } from '@/features/profil';
import { RecoltesRentabiliteScreen } from '@/features/recoltes';
import { NotificationsCentreScreen } from '@/features/notifications';
import { queryKeys } from '@/hooks/queryKeys';
import { CULTURES_COMPTE_RECETTE, PARCELLES_RECETTE, RECOLTES_RECETTE } from './donneesDemo';
import type { Culture, Paginated, Recolte, Utilisateur } from '@/types';

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

/** Récoltes du compte pour la recette : trois cultures, unités variées. */
const RECOLTES_COMPTE_RECETTE: Recolte[] = [
  RECOLTES_RECETTE['demo-c2'],
  {
    ...RECOLTES_RECETTE['demo-c2'],
    id: 'demo-r2',
    dateRecolte: '2026-06-20',
    quantite: 850,
    unite: 'kg',
    description: 'Pommes de terre Spunta, calibre homogène.',
    prixVente: 2125000,
    coutRecolte: 310000,
    cultureId: 'demo-c4',
  },
  {
    ...RECOLTES_RECETTE['demo-c2'],
    id: 'demo-r3',
    dateRecolte: '2026-03-05',
    quantite: 6,
    unite: 'sac',
    description: 'Récolte de jardin, autoconsommation.',
    prixVente: null,
    coutRecolte: 40000,
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
  // clé partagée par useRecoltesDuCompte : avec data en cache et staleTime
  // infini, le queryFn (qui exige une session) n'est jamais appelé.
  client.setQueryData<Recolte[]>(queryKeys.recoltes, RECOLTES_COMPTE_RECETTE);
  const pageCultures: Paginated<Culture> = {
    items: CULTURES_COMPTE_RECETTE,
    total: CULTURES_COMPTE_RECETTE.length,
    page: 1,
    limit: CULTURES_COMPTE_RECETTE.length,
    totalPages: 1,
  };
  client.setQueryData(queryKeys.cultures({ compte: true }), pageCultures);
  for (const culture of CULTURES_COMPTE_RECETTE) {
    client.setQueryData(queryKeys.culture(culture.id), culture);
  }
  for (const parcelle of PARCELLES_RECETTE) client.setQueryData(queryKeys.parcelle(parcelle.id), parcelle);
  return client;
}

/**
 * Recette du lot 5 : profil & paramètres, formulaire profil et
 * récolte & rendement rendus sans session ni réseau (cache isolé).
 * Le centre de notifications s'y montre en état vide (pas de compte) ;
 * ses cas nominaux sont couverts par l'e2e authentifié.
 */
export function RecetteLot5({ ecran }: { ecran: string }) {
  const client = useMemo(() => creerClientDemo(), []);
  return (
    <QueryClientProvider client={client}>
      {ecran === 'profil' ? <ProfilParametresScreen /> : null}
      {ecran === 'profil-formulaire' ? <ProfilFormulaireScreen /> : null}
      {ecran === 'recoltes' ? <RecoltesRentabiliteScreen /> : null}
      {ecran === 'notifications' ? <NotificationsCentreScreen /> : null}
    </QueryClientProvider>
  );
}
