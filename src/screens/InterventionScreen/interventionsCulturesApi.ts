/**
 * Lectures partagées de l'écran des interventions.
 *
 * Les écrans « globaux » (interventions de toutes les cultures) ont besoin de
 * listes complètes : ces fonctions encapsulent la pagination et l'ordre des
 * clés de cache, pour ne pas dupliquer la logique de `asItems`.
 */
import { culturesApi, interventionsApi } from '@/services';
import { asItems } from '@/utils/api';
import type { Culture, Intervention } from '@/types';

/** Toutes les cultures d'une parcelle (200 max = plafond du serveur). */
export const interventionsCulturesApi = Object.assign(
  (parcelleId: string): Promise<Culture[]> =>
    culturesApi.listByParcelle(parcelleId, { limit: 200 }).then(asItems),
  {
    /** Toutes les interventions d'une culture. */
    interventions: (cultureId: string): Promise<Intervention[]> =>
      interventionsApi.listByCulture(cultureId, { limit: 200 }).then(asItems),
  },
);
