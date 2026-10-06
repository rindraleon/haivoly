/**
 * Feuilles de style de `CultureDetailScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: 10,
  },
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
  interventionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border.default,
  },
  interventionType: { fontSize: 14, fontWeight: '600', color: colors.neutral[900] },
}
);
