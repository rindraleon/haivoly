/**
 * Compteurs du tableau de bord.
 */
import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function useDashboard() {
  return useQuery({ queryKey: queryKeys.dashboard, queryFn: dashboardApi.get });
}
