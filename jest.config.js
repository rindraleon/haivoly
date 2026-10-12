module.exports = {
  rootDir: __dirname,
  roots: ['<rootDir>/src'],
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    // `env.ts` dépend de `expo-constants` (module natif) : les tests de logique
    // pure utilisent le substitut, câblé **avant** l'alias général.
    '^@/config/env$': '<rootDir>/src/test-stubs/env.ts',
    // `authStorage.ts` s'appuie sur le Keychain/Keystore natif.
    '^expo-secure-store$': '<rootDir>/src/test-stubs/expo-secure-store.ts',
    // Modules natifs utilisés par la compression d'image.
    '^expo-image-manipulator$': '<rootDir>/src/test-stubs/expo-image-manipulator.ts',
    '^expo-file-system$': '<rootDir>/src/test-stubs/expo-file-system.ts',
    // AsyncStorage livre de l'ESM non transformé et dépend d'un module natif.
    '^@react-native-async-storage/async-storage$':
      '<rootDir>/src/test-stubs/async-storage.ts',
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
