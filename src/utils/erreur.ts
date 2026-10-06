/**
 * Message d'erreur affichable, déduit d'une exception quelconque.
 *
 * Les écrans historiques lisaient `error.response.data.message` (forme axios).
 * La couche HTTP normalise désormais tout en `ApiError` : ce helper garde les
 * deux chemins possibles et fournit toujours un texte lisible.
 */
import { ApiError, toApiError } from '@/services/http';

type ReponseErreur = {
  response?: { data?: { message?: string | string[] } };
  message?: string | string[];
};

export function messageErreur(error: unknown, defaut: string): string {
  const apiError = error instanceof ApiError ? error : toApiError(error);

  if (apiError.message && apiError.message !== 'Erreur inconnue') {
    return apiError.message;
  }

  // Filet de sécurité pour les erreurs de validation (message = tableau).
  const brut = error as ReponseErreur;
  const message = brut?.response?.data?.message ?? brut?.message;
  if (Array.isArray(message)) return message.join('\n');
  if (typeof message === 'string' && message.trim()) return message;

  return defaut;
}
