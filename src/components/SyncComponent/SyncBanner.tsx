import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { CloudOff, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react-native';

import { colors, radius } from '@/theme';
import { useSyncContext } from '@/providers/AppProviders';

export function SyncBanner() {
  const { isOnline, isSyncing, pendingCount, failedCount, lastError, retry } =
    useSyncContext();

  const rienAAfficher =
    isOnline && !isSyncing && pendingCount === 0 && failedCount === 0;
  if (rienAAfficher) return null;

  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]}>
        <CloudOff size={16} color={colors.warning[600]} />
        <Text style={[styles.text, styles.offlineText]}>
          Hors connexion — {pendingCount} modification{pendingCount > 1 ? 's' : ''} en
          attente
        </Text>
      </View>
    );
  }

  if (failedCount > 0) {
    return (
      <View style={[styles.banner, styles.error]}>
        <AlertTriangle size={16} color={colors.error[600]} />
        <Text style={[styles.text, styles.errorText]} numberOfLines={2}>
          Échec de synchronisation — {failedCount} action{failedCount > 1 ? 's' : ''}
          {lastError ? ` : ${lastError}` : ''}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => void retry()} style={styles.retry}>
          <RefreshCw size={14} color={colors.error[700]} />
          <Text style={styles.retryText}>Réessayer</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.syncing]}>
      {isSyncing ? (
        <ActivityIndicator size="small" color={colors.primary[600]} />
      ) : (
        <CheckCircle2 size={16} color={colors.primary[600]} />
      )}
      <Text style={[styles.text, styles.syncingText]}>
        {isSyncing
          ? 'Synchronisation en cours…'
          : `${pendingCount} modification${pendingCount > 1 ? 's' : ''} en attente`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderBottomWidth: 1,
  },
  offline: { backgroundColor: colors.warning[50], borderBottomColor: colors.warning[100] },
  error: { backgroundColor: colors.error[50], borderBottomColor: colors.error[100] },
  syncing: { backgroundColor: colors.primary[50], borderBottomColor: colors.primary[100] },
  text: { flex: 1, fontSize: 12.5, fontWeight: '600' },
  offlineText: { color: colors.warning[600] },
  errorText: { color: colors.error[700] },
  syncingText: { color: colors.primary[700] },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
    backgroundColor: colors.error[100],
  },
  retryText: { fontSize: 12, fontWeight: '700', color: colors.error[700] },
});

export default SyncBanner;
