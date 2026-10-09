import { useQuery } from '@tanstack/react-query';
import { parcellesApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function useParcelles(params?: {
  page?: number;
  limit?: number;
  statut?: string;
  recherche?: string;
}) {
  return useQuery({
    queryKey: queryKeys.parcelles(params),
    queryFn: () => parcellesApi.list(params),
    placeholderData: (previous) => previous,
  });
}

export function useParcelle(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.parcelle(id ?? ''),
    queryFn: () => parcellesApi.get(id as string),
    enabled: Boolean(id),
  });
}
