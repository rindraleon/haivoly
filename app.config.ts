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
    // Identifiant d'application Android (applicationId). Absent auparavant,
    // ce qui bloquait `expo prebuild` et faisait retomber sur la valeur par
    // defaut `com.anonymous.haivoly` — inutilisable pour une publication.
    // IMMUTABLE une fois publie sur le Play Store : a confirmer.
    package: 'mg.haivoly.app',
    adaptiveIcon: {
      backgroundColor: '#F6F9F4',
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
        backgroundColor: '#F6F9F4',
        image: './assets/images/splash-icon.png',
        imageWidth: 160,
      },
    ],
    'expo-secure-store',
    'expo-image',
    [
      // Sans ce plugin, les permissions Android de localisation ne sont pas
      // injectees au build natif : la delimitation GPS echouerait sur
      // appareil reel alors qu'elle fonctionne sur Expo Go.
      'expo-location',
      {
        locationAlwaysAndWhenInUsePermission:
          'HaiVoly utilise votre position pour delimiter vos parcelles et cultures.',
        locationWhenInUsePermission:
          'HaiVoly utilise votre position pour delimiter vos parcelles et cultures.',
      },
    ],
    [
      'expo-image-picker',
      {
        photosPermission:
          "HaiVoly accede a vos photos pour illustrer vos observations, interventions et recoltes.",
        cameraPermission:
          "HaiVoly accede a votre appareil photo pour photographier vos parcelles et cultures.",
      },
    ],
    // L'app ne capture que des images : RECORD_AUDIO (injectee par
    // expo-image-picker pour la video) est retiree du manifeste.
    './plugins/withoutRecordAudio',
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
