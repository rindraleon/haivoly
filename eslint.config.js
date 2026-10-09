// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ["dist/*"],
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-console": "error",
    },
  },
  // Le journal lui-même est le seul endroit autorisé à écrire dans la console.
  {
    files: ["src/utils/logger.ts"],
    rules: {
      "no-console": "off",
    },
  },
  // Les scripts de maintenance (Node) ne sont pas du code applicatif :
  // `__dirname`, `process` et `console` y sont légitimes.
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      globals: {
        __dirname: "readonly",
        __filename: "readonly",
        process: "readonly",
        console: "readonly",
        require: "readonly",
        module: "readonly",
      },
    },
  },
]);
