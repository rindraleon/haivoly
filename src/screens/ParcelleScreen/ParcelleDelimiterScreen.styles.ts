/**
 * Feuilles de style de `ParcelleDelimiterScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  footerRow: { flexDirection: 'row', gap: 10 },
  modeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: radius.md,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  modeText: { flex: 1, fontSize: 13, color: colors.primary[700], fontWeight: '600' },
  mapCard: { overflow: 'hidden' },
  map: { height: 340 },
  mapFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, color: colors.neutral[700], fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  helpTitle: { fontSize: 13.5, fontWeight: '700', color: colors.neutral[800], marginBottom: 6 },
  helpText: { fontSize: 12.5, lineHeight: 19, color: colors.neutral[600] },
}
);
