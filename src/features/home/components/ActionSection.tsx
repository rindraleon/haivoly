import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MapPinned, Sprout, ClipboardList, Leaf, ChevronRight, Sparkles } from 'lucide-react-native';
import { router } from 'expo-router';
import { colors, radius } from '@/design/tokens';

function ActionCard({ icon: Icon, title, subtitle, accent, onPress }: { icon: any; title: string; subtitle: string; accent: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && { opacity: 0.92, transform: [{ scale: 0.98 }] }]}>
      <View style={[styles.icon, { backgroundColor: `${accent}12`, borderColor: `${accent}22` }]}>
        <Icon size={20} color={accent} strokeWidth={1.9} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.sub}>{subtitle}</Text>
      <View style={styles.arrow}>
        <ChevronRight size={14} color={colors.neutral[400]} />
      </View>
    </Pressable>
  );
}

export function ActionSection({ parcellesCount }: { parcellesCount: number }) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.pill}>
          <Sparkles size={12} color={colors.primary[600]} />
          <Text style={styles.pillText}>Nouveau</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <ActionCard icon={MapPinned} title="Mes parcelles" subtitle={`${parcellesCount} parcelles`} accent={colors.primary[500]} onPress={() => router.push('/(app)/(parcelles)/parcelles' as any)} />
        <ActionCard icon={Sprout} title="Mes cultures" subtitle="Par parcelle" accent={colors.info[500]} onPress={() => router.push('/(app)/(parcelles)/parcelles' as any)} />
        <ActionCard icon={ClipboardList} title="Interventions" subtitle="Historique & suivi" accent={colors.warning[500]} onPress={() => router.push('/(app)/(parcelles)/parcelles' as any)} />
        <ActionCard icon={Leaf} title="Observations" subtitle="Suivi terrain" accent={colors.success[500]} onPress={() => router.push('/(app)/(observations)/observations' as any)} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.3 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  pillText: { fontSize: 11, fontWeight: '700', color: colors.primary[700] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border.default,
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  title: { fontSize: 13.5, fontWeight: '700', color: colors.neutral[900] },
  sub: { fontSize: 11.5, color: colors.neutral[500] },
  arrow: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
});
