import { Stack, router } from 'expo-router';
import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { getToken } from '@/storage/authStorage';
import { queryClient } from '@/providers/AppProviders';

import { colors } from '@/theme';
import { SyncBanner } from '@/components/SyncComponent/SyncBanner';
import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';

export default function AppLayout() {
  useEffect(() => {
    let checking = false;
    const verifySession = async () => {
      if (checking) return;
      checking = true;
      try {
        const token = await getToken().catch(() => null);
        if (!token) {
          queryClient.clear();
          router.replace('/(auth)/login' as never);
        }
      } finally {
        checking = false;
      }
    };
    void verifySession();
    const timer = setInterval(() => void verifySession(), 15000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <SyncBanner />
      <View style={styles.stack}>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.background.app },
            animation: 'slide_from_right',
          }}
        />
      </View>
      <AppBottomBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background.app },
  stack: { flex: 1 },
});
