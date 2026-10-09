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
