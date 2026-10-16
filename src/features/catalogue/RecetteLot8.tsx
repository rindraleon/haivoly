import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { DashboardScreen } from '@/features/dashboard';
import { FileSynchronisationScreen } from '@/features/synchronisation';
import { queryKeys } from '@/hooks/queryKeys';
import type { ApercuMembre } from '@/services/user.service';
import type { Culture, Paginated, Parcelle, Recolte, Utilisateur } from '@/types';
import type { OfflineAction } from '@/types/offline.types';
import { CULTURES_COMPTE_RECETTE, PARCELLES_RECETTE, RECOLTES_RECETTE } from './donneesDemo';

const PROPRIETAIRE_RECETTE: Utilisateur = {
  id: 'demo-p1',
  nom: 'Rakoto',
  prenom: 'Haja',
  email: 'haja@haivoly.demo',
  telephone: '+261 34 00 000 01',
  role: 'PROPRIETAIRE',
  username: 'haja.r',
  estVerifie: true,
  creeA: '2024-01-08T09:00:00.000Z',
};

const MEMBRES_RECETTE: ApercuMembre[] = [
  {
    id: 'demo-p1',
    nom: 'Rakoto',
    prenom: 'Haja',
    nomComplet: 'Haja Rakoto',
    username: 'haja.r',
    role: 'PROPRIETAIRE',
    estVerifie: true,
  },
  {
    id: 'demo-u1',
    nom: 'Rasoa',
    prenom: 'Lova',
    nomComplet: 'Lova Rasoa',
    username: 'lova.r',
    role: 'AGRICULTEUR',
    estVerifie: true,
  },
  {
    id: 'demo-u2',
    nom: 'Rabe',
    prenom: 'Naina',
    nomComplet: 'Naina Rabe',
    username: 'naina.r',
    role: 'AGRICULTEUR',
    estVerifie: false,
  },
];

function actionRecette(
  id: string,
  entityType: OfflineAction['entityType'],
  actionType: OfflineAction['actionType'],
  status: OfflineAction['status'],
  createdAt: string,
  suite?: Partial<OfflineAction>,
): OfflineAction {
  return {
    id,
    actionType,
    entityType,
    entityId: id,
    payload: {},
    createdAt,
    updatedAt: createdAt,
    status,
    retryCount: 0,
    ...suite,
  };
}

/** File locale de démonstration : attente, échec, doublon et action envoyée. */
const FILE_RECETTE: OfflineAction[] = [
  actionRecette('demo-a1', 'PARCELLE', 'CREATE', 'PENDING', '2026-10-14T06:12:00.000Z'),
  actionRecette('demo-a2', 'PARCELLE', 'UPDATE', 'PENDING', '2026-10-14T06:40:00.000Z'),
  actionRecette('demo-a3', 'CULTURE', 'CREATE', 'FAILED', '2026-10-13T15:02:00.000Z', {
    retryCount: 2,
    lastError: 'Réseau indisponible lors du dernier essai.',
  }),
  actionRecette('demo-a4', 'INTERVENTION', 'UPDATE', 'PENDING', '2026-10-14T07:05:00.000Z'),
  actionRecette('demo-a5', 'OBSERVATION', 'CREATE', 'DUPLICATE', '2026-10-12T09:30:00.000Z', {
    lastError: 'Doublon détecté par le serveur.',
  }),
  actionRecette('demo-a6', 'RECOLTE', 'CREATE', 'SYNCED', '2026-10-11T11:00:00.000Z', {
    syncedAt: '2026-10-11T11:04:00.000Z',
  }),
];

/** Périmètre propriétaire : toutes les récoltes du projet. */
const RECOLTES_COMPTE_RECETTE: Recolte[] = Object.values(RECOLTES_RECETTE);

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
  client.setQueryData<Utilisateur>(queryKeys.me, PROPRIETAIRE_RECETTE);
  client.setQueryData<ApercuMembre[]>(queryKeys.membresProjet, MEMBRES_RECETTE);
  client.setQueryData<Recolte[]>(queryKeys.recoltes, RECOLTES_COMPTE_RECETTE);
  client.setQueryData<OfflineAction[]>(['file-synchronisation'], FILE_RECETTE);

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
 * Recette du lot 8 : tableau de bord du propriétaire (section projet agrégée)
 * et file de synchronisation hors ligne groupée par entité, rendus sans
 * session ni réseau (cache isolé).
 */
export function RecetteLot8({ ecran }: { ecran: string }) {
  const client = useMemo(() => creerClientDemo(), []);
  return (
    <QueryClientProvider client={client}>
      {ecran === 'tableau-de-bord-projet' ? <DashboardScreen /> : null}
      {ecran === 'file-synchronisation' ? <FileSynchronisationScreen /> : null}
    </QueryClientProvider>
  );
}
