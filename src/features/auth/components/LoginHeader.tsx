import { View, Text, StyleSheet } from 'react-native';
import { Sprout } from 'lucide-react-native';
import { colors, radius } from '@/design/tokens';

export function LoginHeader() {
  return (
    <View style={styles.brandBand}>
      {/* Logo + titre */}
      <View style={styles.brandCard}>
        <View style={styles.logoRow}>
          <Sprout size={32} color="#FFFFFF" strokeWidth={2.4} />
          <Text style={styles.brandTitle}>Haivoly</Text>
        </View>
        <Text style={styles.brandSubtitle}>Gestion agricole intelligente</Text>
      </View>

      {/* Pill sécurisé */}
      <View style={styles.pill}>
        <Text style={styles.pillText}>Sécurisé • Pensé pour le terrain</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBand: {
    backgroundColor: '#1B7A2B', // vert capture
    paddingTop: 52,
    paddingBottom: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 14,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    marginBottom: -28, // chevauchement carte
  },
  brandCard: { alignItems: 'center', gap: 6 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  brandTitle: { fontSize: 34, fontWeight: '900', color: '#FFFFFF', letterSpacing: -0.9 },
  brandSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.92)', fontWeight: '500', letterSpacing: -0.1 },
  pill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    boxShadow: '0 1px 6px rgba(0,0,0,0.08)',
    elevation: 2,
  },
  pillText: { fontSize: 12, fontWeight: '700', color: '#1B5E20', letterSpacing: -0.1 },
});
