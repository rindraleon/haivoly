/**
 * Utilitaires de réponse d'API.
 *
 * Le backend renvoie soit une **page** (`{ items, total, page, ... }`) soit un
 * **tableau** selon la route. Les écrans ne doivent pas s'en préoccuper :
 * `asItems` normalise les deux formes en tableau.
 */
import type { Paginated } from '@/types';

/** Vrai si la valeur est une page paginée. */
export function isPaginated<T>(valeur: Paginated<T> | T[]): valeur is Paginated<T> {
  return !Array.isArray(valeur) && Array.isArray((valeur as Paginated<T>).items);
}

/** Normalise une réponse « page ou tableau » en tableau. */
export function asItems<T>(valeur: Paginated<T> | T[] | null | undefined): T[] {
  if (!valeur) return [];
  return isPaginated(valeur) ? valeur.items : valeur;
}
