/**
 * Tests unitaires du mobile (logique pure).
 *
 * Le dépôt n'embarque pas de tests de composants : `jest-expo` entre en conflit
 * de versions avec `react-native@0.86.2` (`@react-native/jest-preset`). On
 * vérifie donc ici ce qui ne dépend pas du rendu natif — contrats de dates,
 * vocabulaire métier, file de synchronisation, clés de cache — avec
 * `babel-preset-expo` (déjà fourni par Expo) comme transformateur.
 *
 * Lancer : `npm test`.
 */
module.exports = {
  rootDir: __dirname,
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      {
        babelrc: false,
        configFile: false,
        presets: [['babel-preset-expo', { jsxRuntime: 'automatic' }]],
      },
    ],
  },
  collectCoverageFrom: [
    'src/utils/**/*.ts',
    'src/types/offline.types.ts',
    'src/hooks/queryKeys.ts',
  ],
};
