import type { ConfigContext, ExpoConfig } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,

  // ── Identité ────────────────────────────────────────────────────────────
  name: 'Haivoly',
  slug: 'haivoly',
  version: '1.0.0',
  scheme: 'haivoly',
  orientation: 'portrait',
  userInterfaceStyle: 'automatic',

  // ── Ressources graphiques ───────────────────────────────────────────────
  icon: './assets/images/icon.png',
  ios: {
    icon: './assets/expo.icon',
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
  },
  web: {
    output: 'static',
    favicon: './assets/images/favicon.png',
  },

  // ── Modules natifs ──────────────────────────────────────────────────────
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#208AEF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    'expo-secure-store',
    'expo-image',
  ],

  // ── Compilation ─────────────────────────────────────────────────────────
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },

  extra: {
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? null,
  },
});
