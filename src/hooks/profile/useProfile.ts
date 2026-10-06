/**
 * Profil de l'utilisateur connecté (alias de `useMe`, clé de cache `auth/me`).
 */
import { useQuery } from '@tanstack/react-query';

import { authApi } from '@/services';
import { queryKeys } from '../queryKeys';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.me,
    queryFn: () => authApi.me(),
  });
}
