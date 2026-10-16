import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '../queryKeys';
import { useProfile } from './useProfile';
import { userService, type ApercuMembre } from '@/services/user.service';

/**
 * Membres du projet pour le propriétaire (lot 8) : `GET /users` renvoie tout
 * le périmètre rattaché. Désactivé pour les autres rôles (403 côté serveur).
 */
export function useMembresProjet() {
  const profil = useProfile();
  const estProprietaire = profil.data?.role === 'PROPRIETAIRE';
  return useQuery<ApercuMembre[]>({
    queryKey: queryKeys.membresProjet,
    queryFn: () => userService.lister(),
    enabled: estProprietaire,
  });
}
