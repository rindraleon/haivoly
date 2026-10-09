import { useQuery } from '@tanstack/react-query';
import { recoltesApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function useRecolte(cultureId?: string) {
  return useQuery({
    queryKey: queryKeys.recolte(cultureId ?? ''),
    queryFn: () => recoltesApi.getByCulture(cultureId as string),
    enabled: Boolean(cultureId),
    retry: false,
  });
}
