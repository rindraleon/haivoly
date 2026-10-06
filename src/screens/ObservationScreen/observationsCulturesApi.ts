/**
 * Lectures partagées de l'écran des observations.
 *
 * Même rôle que `interventionsCulturesApi` : fournir des listes complètes
 * (cultures d'une parcelle, observations d'une culture) sans dupliquer
 * `asItems` dans l'écran.
 */
import { culturesApi, observationsApi } from '@/services';
import { asItems } from '@/utils/api';
import type { Culture, Observation } from '@/types';

export const observationsCulturesApi = Object.assign(
  (parcelleId: string): Promise<Culture[]> =>
    culturesApi.listByParcelle(parcelleId, { limit: 200 }).then(asItems),
  {
    observations: (cultureId: string): Promise<Observation[]> =>
      observationsApi.listByCulture(cultureId, { limit: 200 }).then(asItems),
  },
);
