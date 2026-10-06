/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `SUMMARY` — extraits de `CultureListScreen`.
 */
export const stylesSummary = StyleSheet.create({
summaryCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 18,
    backgroundColor:
      'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor:
      colors.border.default,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
  },

summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },

summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },

summaryLabel: {
    fontSize: 11,
    color:
      colors.neutral[500],
    fontWeight: '600',
  },

summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor:
      colors.border.default,
  },
});
