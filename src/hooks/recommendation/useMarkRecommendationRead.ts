/**
 * Marquage d’une recommandation comme lue.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationsApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function useMarkRecommendationRead() {
  const client = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recommendationsApi.markRead(id),
    onSuccess: async () => {
      await client.invalidateQueries({ queryKey: queryKeys.recommendations });
    },
  });
}
