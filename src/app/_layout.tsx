import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';

import { AppProviders } from '@/providers/AppProviders';
import { BarreEtat } from '@/features/shell/BarreEtat';
import { i18n } from '@/i18n/instance';
import { colors } from '@/theme';

export default function RootLayout() {
  const [versionLangue, setVersionLangue] = useState(0);

  useEffect(() => {
    const rafraichir = () => setVersionLangue((v) => v + 1);
    i18n.on('languageChanged', rafraichir);
    return () => {
      i18n.off('languageChanged', rafraichir);
    };
  }, []);

  return (
    <AppProviders>
      <BarreEtat />
      <Stack
        key={versionLangue}
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
