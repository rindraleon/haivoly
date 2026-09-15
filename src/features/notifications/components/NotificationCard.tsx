import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Bell, AlertTriangle, CheckCircle2, Info, Clock3 } from 'lucide-react-native';
import { colors, radius } from '@/design/tokens';
import type { Recommendation } from '@/features/notifications/types';

const iconByType = {
  INFO: Info,
  WARNING: AlertTriangle,
  SUCCESS: CheckCircle2,
  ALERT: AlertTriangle,
};

const colorByPriority = {
  LOW: colors.neutral[500],
  MEDIUM: colors.info[600],
  HIGH: colors.warning[600],
  URGENT: colors.error[600],
};

export function NotificationCard({ item, onPress }: { item: Recommendation; onPress?: () => void }) {
  const Icon = iconByType[item.type] ?? Bell;
  const accent = colorByPriority[item.priority];
  const isUnread = !item.readAt;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, isUnread && styles.unread, pressed && { opacity: 0.9 }]}>
      <View style={[styles.icon, { backgroundColor: `${accent}14`, borderColor: `${accent}22` }]}>
        <Icon size={16} color={accent} />
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <View style={styles.top}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <View style={[styles.dot, { backgroundColor: isUnread ? accent : 'transparent', borderColor: isUnread ? accent : colors.border.default }]} />
        </View>
        <Text style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.meta}>
          <Clock3 size={10} color={colors.neutral[400]} />
          <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleString('fr-FR')}</Text>
          <View style={[styles.prio, { backgroundColor: `${accent}14`, borderColor: `${accent}22` }]}>
            <Text style={[styles.prioText, { color: accent }]}>{item.priority}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: radius.lg,
  },
  unread: { borderColor: '#D1E9FF', backgroundColor: '#EFF8FF' },
  icon: { width: 36, height: 36, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontSize: 13, fontWeight: '800', color: colors.neutral[900] },
  dot: { width: 8, height: 8, borderRadius: 4, borderWidth: 1 },
  message: { fontSize: 12, lineHeight: 16, color: colors.neutral[600] },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 11, color: colors.neutral[400] },
  prio: { marginLeft: 'auto', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  prioText: { fontSize: 10, fontWeight: '800' },
});
