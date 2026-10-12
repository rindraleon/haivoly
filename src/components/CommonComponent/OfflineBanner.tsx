import { View, Text, StyleSheet, Pressable } from 'react-native';
import { WifiOff, RefreshCw, CheckCircle2, Clock3 } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { colors, radius } from '@/theme';

type Props = {
  isOnline: boolean | null;
  pendingCount: number;
  isSyncing: boolean;
  onSyncPress?: () => void;
};

export function OfflineBanner({ isOnline, pendingCount, isSyncing, onSyncPress }: Props) {
  const { t } = useTranslation();

  if (isOnline) {
    if (pendingCount > 0 || isSyncing) {
      return (
        <View style={[styles.banner, styles.syncing]}>
          <RefreshCw size={14} color={colors.info[600]} style={{ transform: [{ rotate: isSyncing ? '180deg' : '0deg' }] } as any} />
          <Text style={[styles.text, { color: colors.info[600] }]}>
            {isSyncing
              ? t('commun.etats.synchronisationEnCours')
              : t('commun.etats.actionsEnAttente', { count: pendingCount })}
          </Text>
          {!isSyncing && pendingCount > 0 && onSyncPress && (
            <Pressable onPress={onSyncPress} style={styles.action}>
              <Text style={styles.actionText}>{t('commun.etats.synchronisation')}</Text>
            </Pressable>
          )}
        </View>
      );
    }
    // online et rien en attente → ne rien afficher (ou discret SYNCED)
    return null;
  }

  // offline
  return (
    <View style={[styles.banner, styles.offline]}>
      <WifiOff size={14} color="#B54708" />
      <Text style={[styles.text, { color: '#B54708' }]}>
        {t('commun.etats.horsConnexion')}
        {pendingCount > 0
          ? t('commun.etats.enregistreLocalementCount', { count: pendingCount })
          : t('commun.etats.enregistreLocalement')}
      </Text>
    </View>
  );
}

export function SyncedBanner({ visible }: { visible: boolean }) {
  const { t } = useTranslation();

  if (!visible) return null;
  return (
    <View style={[styles.banner, { backgroundColor: '#ECFDF3', borderColor: '#ABEFC6' }]}>
      <CheckCircle2 size={14} color="#05603A" />
      <Text style={[styles.text, { color: '#05603A' }]}>{t('commun.etats.synchronisees')}</Text>
    </View>
  );
}

export function PendingBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <View style={{ backgroundColor: '#F79009', borderRadius: 999, paddingHorizontal: 7, paddingVertical: 2, flexDirection: 'row', gap: 4, alignItems: 'center' }}>
      <Clock3 size={10} color="white" />
      <Text style={{ color: 'white', fontSize: 11, fontWeight: '800' }}>{count}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: 8,
  },
  offline: { backgroundColor: '#FFFAEB', borderColor: '#FEDF89' },
  syncing: { backgroundColor: '#EFF8FF', borderColor: '#D1E9FF' },
  text: { flex: 1, fontSize: 11.5, fontWeight: '600' },
  action: { backgroundColor: 'white', borderWidth: 1, borderColor: '#D1E9FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  actionText: { fontSize: 11, fontWeight: '800', color: '#175CD3' },
});
