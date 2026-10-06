/**
 * Substitut de `@/config/env` pour les tests unitaires.
 *
 * `env.ts` lit `expo-constants` (module natif indisponible hors appareil) : les
 * tests de logique pure — qui importent indirectement le client HTTP — utilisent
 * ce substitut, câblé dans `jest.config.js` via `moduleNameMapper`. Aucun test
 * d'interface n'est concerné : le comportement réel reste vérifié sur appareil.
 */
export const env = {
  apiUrl: 'http://localhost:3000',
  apiTimeout: 15000,
  syncInterval: 20000,
  maxSyncRetries: 5,
  appName: 'Haivoly',
  isDev: true,
} as const;
