import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Sprout, LogOut } from 'lucide-react-native';
import { colors } from '@/design/tokens';
import { Badge } from '@/components/ui/Badge';

export function HomeHeader({ onLogout }: { onLogout: () => void }) {
  return (
    <View style={styles.headerTop}>
      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <Sprout size={18} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <Text style={styles.brandText}>Haivoly</Text>
        <Badge label="Pro" variant="primary" size="sm" />
      </View>
      <Pressable onPress={onLogout} style={({ pressed }) => [styles.logout, pressed && { opacity: 0.7 }]} hitSlop={8}>
        <LogOut size={18} color={colors.neutral[600]} strokeWidth={1.9} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: { fontSize: 16, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.4 },
  logout: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
