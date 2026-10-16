import { useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';

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
    /**
     * Invalide une culture — **dont son statut**, mis à jour par le serveur —
     * et son suivi (interventions, observations, récolte) : une observation
     * ajoutée apparaît aussitôt dans le cockpit et les listes.
     */
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
                queryKey: queryKeys.observations(cultureId),
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
