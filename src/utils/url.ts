/**
 * Manipulation d'URL.
 *
 * Les expressions régulières de type `/\/+$/` étaient signalées comme
 * potentiellement super-linéaires (retour arrière) et dupliquées entre
 * `config/env.ts` et `utils/mediaUrl.ts` : la suppression des barres finales est
 * désormais une fonction unique, lue de droite à gauche, sans expression
 * régulière.
 */
export function retirerBarreFinale(url: string): string {
  let fin = url.length;
  while (fin > 0 && url.charAt(fin - 1) === '/') {
    fin -= 1;
  }
  return url.slice(0, fin);
}
