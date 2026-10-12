import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/services';
import { accountCachedQuery } from '@/services/offline/accountData';
import { queryKeys } from '../queryKeys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => accountCachedQuery('profile', 'me', () => authApi.me()),
    retry: false,
  });
}
