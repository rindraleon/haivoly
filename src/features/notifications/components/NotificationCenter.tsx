import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { Bell, CheckCheck } from 'lucide-react-native';
import { colors } from '@/design/tokens';
import { NotificationCard } from './NotificationCard';
import type { Recommendation } from '@/features/notifications/types';

export function NotificationCenter({
  items,
  onMarkAllRead,
  onPressItem,
}: {
  items: Recommendation[];
  onMarkAllRead?: () => void;
  onPressItem?: (item: Recommendation) => void;
}) {
  const unread = items.filter((i) => !i.readAt).length;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Bell size={16} color={colors.primary[600]} />
          <Text style={styles.title}>Recommandations</Text>
          {unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unread} non lues</Text>
            </View>
          )}
        </View>
        {unread > 0 && onMarkAllRead && (
          <Pressable onPress={onMarkAllRead} style={styles.mark}>
            <CheckCheck size={12} color={colors.primary[600]} />
            <Text style={styles.markText}>Tout marquer lu</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Aucune recommandation pour l’instant.</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => <NotificationCard item={item} onPress={() => onPressItem?.(item)} />}
          contentContainerStyle={{ gap: 8 }}
          scrollEnabled={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 14, fontWeight: '800', color: colors.neutral[900] },
  badge: { backgroundColor: colors.error[500], paddingHorizontal: 7, paddingVertical: 2, borderRadius: 999 },
  badgeText: { color: 'white', fontSize: 11, fontWeight: '800' },
  mark: { flexDirection: 'row', gap: 4, alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, backgroundColor: colors.primary[50], borderRadius: 999, borderWidth: 1, borderColor: '#ABEFC6' },
  markText: { fontSize: 11, fontWeight: '700', color: colors.primary[700] },
  empty: { padding: 16, alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: colors.border.default, borderRadius: 12 },
  emptyText: { fontSize: 13, color: colors.neutral[500] },
});
