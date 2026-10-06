import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { AppProviders } from '@/providers/AppProviders';
import { colors } from '@/theme';

/**
 * Layout racine : **couche de routage uniquement**.
 *
 * Les providers applicatifs (TanStack Query, confirmation, synchronisation
 * hors-ligne, gestes, zones sûres) vivent dans `@/providers/AppProviders` —
 * une seule composition pour toute l'application, donc un seul client de
 * cache et **un seul** moteur de synchronisation.
 */
export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <AppProviders>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background.app },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack>
    </AppProviders>
  );
}
