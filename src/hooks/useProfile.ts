import { useQuery } from '@tanstack/react-query';
import { getProfile } from '@/api/auth';

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
}