/**
 * Analyse « qualité » (règles SonarJS) — porte supplémentaire, distincte du lint
 * applicatif (`npm run lint`, qui doit rester à zéro).
 *
 * `npm run sonar` joue les règles de type SonarQube : complexité cognitive,
 * fonctions imbriquées, code dupliqué, chaînes répétées, expressions
 * identiques…
 *
 * Les fichiers **produits mécaniquement** par le pipeline de découpage
 * (`src/components/sections-generees.json`) sont exclus : leur contenu est
 * déplacé à l'identique depuis les écrans, les corriger à la main les
 * désynchroniserait. Les tests sont exclus (cas volontairement répétitifs).
 */
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const sonarjs = require('eslint-plugin-sonarjs');

const generees = require('./src/components/sections-generees.json');

module.exports = defineConfig([
  {
    ignores: ['dist/**', '**/__tests__/**', '**/*.test.ts', ...generees],
  },
  expoConfig,
  sonarjs.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      // Seuils de l'équipe : on documente la dette au lieu de la subir.
      'sonarjs/cognitive-complexity': ['warn', 20],
      'sonarjs/no-duplicate-string': ['warn', { threshold: 6 }],
      'sonarjs/no-nested-functions': 'off',
      'sonarjs/no-nested-conditional': 'off',
      'sonarjs/no-unused-vars': 'off',
    },
  },
]);
