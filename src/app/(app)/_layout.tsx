import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

import { colors } from '@/theme';
import { SyncBanner } from '@/components/SyncComponent/SyncBanner';
import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';

export default function AppLayout() {
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
