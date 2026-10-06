/**
 * Feuilles de style de `ParcelleDetailScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  footerRow: { flexDirection: 'row', gap: 10 },
  map: { height: 260 },
  mapFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: colors.neutral[700], fontWeight: '600' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.neutral[900], marginBottom: 10 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 7,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  rowLabel: { fontSize: 13, color: colors.neutral[500] },
  rowValue: {
    flex: 1,
    fontSize: 13.5,
    color: colors.neutral[900],
    textAlign: 'right',
    fontWeight: '500',
  },
  muted: { fontSize: 12.5, color: colors.neutral[500] },
  cultureRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cultureName: { fontSize: 14.5, fontWeight: '600', color: colors.neutral[900] },
  footerSpacer: { height: 8 },
}
);
