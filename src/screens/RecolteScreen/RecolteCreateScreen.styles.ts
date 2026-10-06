/**
 * Feuilles de style de `RecolteCreateScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: 14 },
  rowFields: { flexDirection: 'row', gap: 12 },
  noteTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.neutral[800],
    marginBottom: 6,
  },
  noteText: { fontSize: 12.5, lineHeight: 19, color: colors.neutral[600] },
}
);
