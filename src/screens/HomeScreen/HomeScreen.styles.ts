/**
 * Feuilles de style de `HomeScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  scroll: { gap: 18, paddingHorizontal: 16, paddingBottom: 18 },
  header: { gap: 14 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { gap: 8, padding: 14, alignItems: 'flex-start' },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.5 },
  statLabel: { fontSize: 11, fontWeight: '700', color: colors.neutral[700], textTransform: 'uppercase', letterSpacing: 0.4 },
  statHint: { fontSize: 11, color: colors.neutral[500] },
  section: { gap: 12 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.3 },
  seeAll: { fontSize: 12.5, fontWeight: '700', color: colors.primary[600] },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary[500],
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
  },
  emptyCtaText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
  parcelleTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  parcelleIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  parcelleName: { fontSize: 14, fontWeight: '700', color: colors.neutral[900] },
  parcelleMeta: { fontSize: 12, color: colors.neutral[500] },
  parcelleDesc: { fontSize: 12.5, lineHeight: 18, color: colors.neutral[600] },
  parcelleFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
  parcelleDate: { fontSize: 11.5, color: colors.neutral[400] },
  chev: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { textAlign: 'center', fontSize: 11, color: colors.neutral[400], marginTop: 4, marginBottom: 4 },
}
);
