import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';

/**
 * Invalidation de cache, appelée après chaque mutation.
 *
 * Une parcelle invalide ses cultures ; une culture invalide ses interventions
 * et sa récolte — ce qui suffit à faire apparaître les statuts recalculés par
 * le serveur (culture `RECOLTEE`, intervention `EN_COURS`…).
 */
export function useInvalidateDomain() {
  const client = useQueryClient();

  return {
    /** Invalide tout ce qui dépend d'une parcelle (et donc de ses cultures). */
    parcelle: async (parcelleId?: string) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['parcelles'] }),
        client.invalidateQueries({ queryKey: ['cultures'] }),
        client.invalidateQueries({ queryKey: ['cultures-parcelle'] }),
        client.invalidateQueries({ queryKey: queryKeys.dashboard }),
        ...(parcelleId
          ? [
              client.invalidateQueries({ queryKey: queryKeys.parcelle(parcelleId) }),
              client.invalidateQueries({
                queryKey: queryKeys.culturesParcelle(parcelleId),
              }),
            ]
          : []),
      ]);
    },
    /** Invalide une culture — **dont son statut**, mis à jour par le serveur. */
    culture: async (cultureId?: string) => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ['cultures'] }),
        client.invalidateQueries({ queryKey: ['cultures-parcelle'] }),
        client.invalidateQueries({ queryKey: ['recoltes'] }),
        client.invalidateQueries({ queryKey: queryKeys.dashboard }),
        ...(cultureId
          ? [
              client.invalidateQueries({ queryKey: queryKeys.culture(cultureId) }),
              client.invalidateQueries({
                queryKey: queryKeys.interventions(cultureId),
              }),
              client.invalidateQueries({
                queryKey: queryKeys.recolte(cultureId),
              }),
            ]
          : []),
      ]);
    },
  };
}
