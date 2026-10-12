import { View, Text, StyleSheet } from 'react-native';
import { i18n } from '@/i18n/instance';
import { Sprout, ShieldCheck, TrendingUp } from 'lucide-react-native';
import { colors, radius } from '@/theme';

export function LoginHeader() {
  return (
    <View style={styles.brandBand}>
      <View style={styles.brandCard}>
        <View style={styles.logoCircle}>
          <Sprout size={28} color="#FFFFFF" strokeWidth={2.2} />
        </View>
        <Text style={styles.brandTitle}>Haivoly</Text>
        <Text style={styles.brandSubtitle}>Gestion agricole intelligente</Text>
      </View>

      <View style={styles.trustRow}>
        <View style={styles.trustItem}>
          <ShieldCheck size={14} color={colors.primary[700]} />
          <Text style={styles.trustText}>Sécurisé</Text>
        </View>
        <View style={styles.dot} />
        <View style={styles.trustItem}>
          <TrendingUp size={14} color={colors.primary[700]} />
          <Text style={styles.trustText}>{i18n.t('libelles.penserTerrain')}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  brandBand: {
    backgroundColor: colors.primary[500],
    paddingTop: 56,
    paddingBottom: 28,
    paddingHorizontal: 24,
    gap: 16,
  },
  brandCard: { alignItems: 'center', gap: 8 },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  brandTitle: { fontSize: 32, fontWeight: '800', color: '#FFFFFF', letterSpacing: -0.8 },
  brandSubtitle: { fontSize: 13.5, color: 'rgba(255,255,255,0.9)', fontWeight: '500', letterSpacing: -0.1 },
  trustRow: {
    flexDirection: 'row',
    alignSelf: 'center',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  trustItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  trustText: { fontSize: 11.5, fontWeight: '600', color: colors.neutral[700] },
  dot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.neutral[300] },
});
