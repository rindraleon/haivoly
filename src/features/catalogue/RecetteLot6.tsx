import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo } from 'react';

import { HistoriqueCulturesScreen } from '@/features/cultures';
import { CarteParcellesScreen, ParcelleCockpitScreen } from '@/features/parcelles';
import { queryKeys } from '@/hooks/queryKeys';
import type { Culture, Paginated, Parcelle, Recolte, Utilisateur } from '@/types';
import {
  CULTURES_COMPTE_RECETTE,
  CULTURES_RECETTE,
  INTERVENTIONS_RECETTE,
  OBSERVATIONS_RECETTE,
  PARCELLES_RECETTE,
  RECOLTES_RECETTE,
} from './donneesDemo';

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

/**
 * Récoltes du compte pour la recette lot 6 : la récolte de la pomme de
 * terre (demo-r4, rattachée à la culture récoltée demo-c4), la récolte
 * de haricot en kg et une récolte en sacs (unité non convertible).
 */
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

/**
 * Contours voisins pour la recette de la carte plein écran : les parcelles
 * démo sont géographiquement dispersées (échelle commune → vignettes
 * minuscules) ; la carte les replace côte à côte comme sur une exploitation
 * réelle, en conservant identifiants, statuts et superficies.
 */
function contourVoisin(origineLat: number, origineLon: number, taille: number) {
  return [
    { id: 'pt-0', latitude: origineLat, longitude: origineLon, ordre: 0 },
    { id: 'pt-1', latitude: origineLat, longitude: origineLon + taille, ordre: 1 },
    { id: 'pt-2', latitude: origineLat - taille * 0.7, longitude: origineLon + taille, ordre: 2 },
    { id: 'pt-3', latitude: origineLat - taille * 0.7, longitude: origineLon, ordre: 3 },
  ] as Parcelle['pointsGPS'];
}

const PARCELLES_CARTE_RECETTE: Parcelle[] = PARCELLES_RECETTE.map((parcelle, index) => ({
  ...parcelle,
  pointsGPS: (parcelle.pointsGPS ?? []).length >= 3
    ? contourVoisin(-18.8 + Math.floor(index / 3) * 0.009, 47.45 + (index % 3) * 0.011, 0.008)
    : parcelle.pointsGPS,
}));

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

  // Carte plein écran : useParcelles({ limit: 200 }) — même clé exacte.
  const pageParcelles: Paginated<Parcelle> = {
    items: PARCELLES_CARTE_RECETTE,
    total: PARCELLES_CARTE_RECETTE.length,
    page: 1,
    limit: 200,
    totalPages: 1,
  };
  client.setQueryData(queryKeys.parcelles({ limit: 200 }), pageParcelles);
  for (const parcelle of PARCELLES_RECETTE) client.setQueryData(queryKeys.parcelle(parcelle.id), parcelle);

  // Cockpit parcelle : cultures de la parcelle + suivi agrégé par culture.
  client.setQueryData(queryKeys.culturesParcelle('demo-p1'), CULTURES_RECETTE['demo-p1'] ?? []);
  for (const [cultureId, observations] of Object.entries(OBSERVATIONS_RECETTE)) {
    client.setQueryData(queryKeys.observations(cultureId), observations);
  }
  for (const [cultureId, interventions] of Object.entries(INTERVENTIONS_RECETTE)) {
    client.setQueryData(queryKeys.interventions(cultureId), interventions);
  }
  return client;
}

/**
 * Recette du lot 6 : historique des cultures, carte des parcelles plein
 * écran et cockpit parcelle enrichi, rendus sans session ni réseau
 * (cache isolé, mêmes clés que les hooks réels).
 */
export function RecetteLot6({ ecran }: { ecran: string }) {
  const client = useMemo(() => creerClientDemo(), []);
  return (
    <QueryClientProvider client={client}>
      {ecran === 'historique-cultures' ? <HistoriqueCulturesScreen /> : null}
      {ecran === 'carte-parcelles' ? <CarteParcellesScreen /> : null}
      {ecran === 'parcelle-v2' ? <ParcelleCockpitScreen /> : null}
    </QueryClientProvider>
  );
}
