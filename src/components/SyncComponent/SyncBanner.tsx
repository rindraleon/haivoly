import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertTriangle, CheckCircle2, CloudOff, RefreshCw } from 'lucide-react-native';

import { colors, radius } from '@/theme';
import { useSyncContext } from '@/providers/AppProviders';

export function SyncBanner() {
  const { t } = useTranslation();
  const { isOnline, isSyncing, pendingCount, failedCount, invalidCount, conflictCount, retry } = useSyncContext();
  const nothingToShow = isOnline && !isSyncing && pendingCount === 0 && failedCount === 0 && invalidCount === 0 && conflictCount === 0;
  if (nothingToShow) return null;

  const reviewRequired = invalidCount > 0 || conflictCount > 0;
  if (reviewRequired) {
    const parts = [
      conflictCount > 0 ? t('synchronisation.conflits', { count: conflictCount }) : '',
      invalidCount > 0 ? t('synchronisation.invalides', { count: invalidCount }) : '',
    ].filter(Boolean);
    return (
      <View style={[styles.banner, styles.review]} accessibilityLiveRegion="polite">
        <AlertTriangle size={17} color={colors.warning[600]} />
        <Text style={[styles.text, styles.reviewText]}>{parts.join(' · ')}</Text>
        {failedCount > 0 && <RetryButton label={t('synchronisation.reessayer')} onPress={() => void retry()} />}
      </View>
    );
  }

  if (!isOnline) {
    return (
      <View style={[styles.banner, styles.offline]} accessibilityLiveRegion="polite">
        <CloudOff size={16} color={colors.warning[600]} />
        <Text style={[styles.text, styles.offlineText]}>
          {pendingCount > 0
            ? t('synchronisation.horsLigne', { count: pendingCount })
            : t('synchronisation.horsLigneSansAction')}
        </Text>
      </View>
    );
  }

  if (failedCount > 0) {
    return (
      <View style={[styles.banner, styles.error]} accessibilityLiveRegion="polite">
        <AlertTriangle size={16} color={colors.error[600]} />
        <Text style={[styles.text, styles.errorText]}>
          {t('synchronisation.echecs', { count: failedCount })}
        </Text>
        <RetryButton label={t('synchronisation.reessayer')} onPress={() => void retry()} error />
      </View>
    );
  }

  return (
    <View style={[styles.banner, styles.syncing]} accessibilityLiveRegion="polite">
      {isSyncing ? (
        <ActivityIndicator size="small" color={colors.primary[600]} />
      ) : (
        <CheckCircle2 size={16} color={colors.primary[600]} />
      )}
      <Text style={[styles.text, styles.syncingText]}>
        {isSyncing
          ? t('synchronisation.enCours')
          : t('synchronisation.enAttente', { count: pendingCount })}
      </Text>
    </View>
  );
}

function RetryButton({ label, onPress, error = false }: { label: string; onPress: () => void; error?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [styles.retry, error && styles.retryError, pressed && styles.pressed]}
    >
      <RefreshCw size={14} color={error ? colors.error[700] : colors.warning[600]} />
      <Text style={[styles.retryText, error && styles.retryTextError]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minHeight: 44,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  offline: { backgroundColor: colors.warning[50], borderBottomColor: colors.warning[100] },
  review: { backgroundColor: colors.warning[50], borderBottomColor: colors.warning[100] },
  error: { backgroundColor: colors.error[50], borderBottomColor: colors.error[100] },
  syncing: { backgroundColor: colors.primary[50], borderBottomColor: colors.primary[100] },
  text: { flex: 1, fontSize: 12.5, fontWeight: '600' },
  offlineText: { color: colors.warning[600] },
  reviewText: { color: colors.warning[600] },
  errorText: { color: colors.error[700] },
  syncingText: { color: colors.primary[700] },
  retry: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    minHeight: 36,
    paddingHorizontal: 10,
    borderRadius: radius.full,
    backgroundColor: colors.warning[100],
  },
  retryError: { backgroundColor: colors.error[100] },
  retryText: { fontSize: 12, fontWeight: '700', color: colors.warning[600] },
  retryTextError: { color: colors.error[700] },
  pressed: { opacity: 0.75 },
});

export default SyncBanner;
