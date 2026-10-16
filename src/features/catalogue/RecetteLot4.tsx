import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

import { InterventionFormulaireScreen } from '@/features/interventions';
import { ObservationFormulaireScreen } from '@/features/observations';
import { ParcelleFormulaireScreen } from '@/features/parcelles/ParcelleFormulaireScreen';
import { SuiviUnifieScreen } from '@/features/suivi';
import { queryKeys } from '@/hooks/queryKeys';
import type { Paginated, Parcelle } from '@/types';

import {
  CULTURES_COMPTE_RECETTE,
  INTERVENTIONS_RECETTE,
  OBSERVATIONS_RECETTE,
  PARCELLES_RECETTE,
  POINTS_CULTURES_RECETTE,
  RECOLTES_RECETTE,
} from './donneesDemo';

export type EcranRecetteLot4 =
  | 'observation'
  | 'observation-edit'
  | 'intervention'
  | 'intervention-edit'
  | 'suivi'
  | 'parcelle-formulaire'
  | 'parcelle-formulaire-edit';

/**
 * Cache React Query isolé, prérempli avec le jeu de démonstration (lot 4) :
 * formulaires V2 et suivi unifié RÉELS s'affichent sans réseau ni session.
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
    const interventions = INTERVENTIONS_RECETTE[culture.id] ?? [];
    const observations = OBSERVATIONS_RECETTE[culture.id] ?? [];
    client.setQueryData(queryKeys.interventions(culture.id), interventions);
    client.setQueryData(queryKeys.observations(culture.id), observations);
    client.setQueryData(queryKeys.recolte(culture.id), RECOLTES_RECETTE[culture.id] ?? null);
    client.setQueryData(['points-culture', culture.id], POINTS_CULTURES_RECETTE[culture.id] ?? []);
    // caches par identifiant : l'édition V2 se pré-remplit sans session.
    for (const observation of observations) client.setQueryData(['observation', observation.id], observation);
    for (const intervention of interventions) client.setQueryData(['intervention', intervention.id], intervention);
  }
  for (const parcelle of PARCELLES_RECETTE) client.setQueryData(queryKeys.parcelle(parcelle.id), parcelle);
  return client;
}

/**
 * Recette du lot 4 : formulaires observation / intervention / parcelle et
 * suivi unifié, dans leurs versions V2 réelles, sur cache de démonstration.
 * URLs : /catalogue?ecran=observation | observation-edit&id=demo-o1&cultureId=demo-c1
 *        | intervention | intervention-edit&id=demo-i1&cultureId=demo-c1
 *        | suivi | parcelle-formulaire | parcelle-formulaire-edit&id=demo-p1
 */
export function RecetteLot4({ ecran }: { ecran: EcranRecetteLot4 }) {
  const [client] = useState(creerClientDemo);

  return (
    <QueryClientProvider client={client}>
      {ecran === 'observation' || ecran === 'observation-edit' ? <ObservationFormulaireScreen /> : null}
      {ecran === 'intervention' || ecran === 'intervention-edit' ? <InterventionFormulaireScreen /> : null}
      {ecran === 'suivi' ? <SuiviUnifieScreen /> : null}
      {ecran === 'parcelle-formulaire' || ecran === 'parcelle-formulaire-edit' ? (
        <ParcelleFormulaireScreen />
      ) : null}
    </QueryClientProvider>
  );
}
