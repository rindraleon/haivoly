import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useColorScheme } from 'react-native';
import { useEffect } from 'react';
import { startAutoSync } from '@/features/sync/services/syncEngine';
import { startRecommendationPolling } from '@/features/recommendations/services/sync';
import { ConfirmProvider } from '@/components/ui/ConfirmProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 30 },
  },
});

function SyncBootstrap({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const stopSync = startAutoSync(15000);
    const stopRecos = startRecommendationPolling(30000);
    return () => {
      stopSync();
      stopRecos();
    };
  }, []);
  return <>{children}</>;
}

export default function RootLayout() {
  const scheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ConfirmProvider>
            <SyncBootstrap>
              <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: '#F8FAF8' },
                  animation: 'slide_from_right',
                }}
              >
                <Stack.Screen name="index" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                <Stack.Screen name="(app)" options={{ headerShown: false }} />
              </Stack>
            </SyncBootstrap>
          </ConfirmProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
