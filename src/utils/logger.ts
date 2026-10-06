/**
 * Journal de développement.
 *
 * Les écrans historiques appelaient `console.log` directement : en production,
 * ces traces partaient dans la console du téléphone (et ralentissent le rendu
 * lorsqu'elles sérialisent des objets). `logger` centralise le comportement :
 *
 *   • en développement (`__DEV__`) → `console`, avec le préfixe du domaine ;
 *   • en production → **aucune trace**, aucun coût.
 *
 * Les erreurs, elles, ne sont jamais silencieuses : elles passent par les
 * alertes utilisateur et le bandeau de synchronisation.
 */
function prefixe(contexte: string): string {
  return `[Haivoly:${contexte}]`;
}

export const logger = {
  debug(contexte: string, ...donnees: unknown[]): void {
    if (__DEV__) console.log(prefixe(contexte), ...donnees);
  },
  warn(contexte: string, ...donnees: unknown[]): void {
    if (__DEV__) console.warn(prefixe(contexte), ...donnees);
  },
};
