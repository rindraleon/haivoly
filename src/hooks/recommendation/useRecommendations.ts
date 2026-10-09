import { useQuery } from '@tanstack/react-query';
import { recommendationsApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: () => recommendationsApi.listMine(),
  });
}
