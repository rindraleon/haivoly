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
]);
