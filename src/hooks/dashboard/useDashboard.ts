import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services';
import { accountCachedQuery } from '@/services/offline/accountData';
import { queryKeys } from '../queryKeys';

export function useDashboard() {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: () => accountCachedQuery('dashboard', 'home', () => dashboardApi.get()),
  });
}
