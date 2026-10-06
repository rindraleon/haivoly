/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors, radius, } from '@/theme';

/**
 * Styles `STATS` — extraits de `ObservationListScreen`.
 */
export const stylesStats = StyleSheet.create({
statsBar: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
    },

statPill: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 5,
      backgroundColor:
        colors.primary[50],
      borderWidth: 1,
      borderColor:
        colors.primary[100],
      paddingHorizontal: 9,
      paddingVertical: 4,
      borderRadius:
        radius.full,
    },

statPillValue: {
      fontSize: 12,
      fontWeight: '800',
      color:
        colors.primary[700],
    },

statPillLabel: {
      fontSize: 11.5,
      color:
        colors.primary[700],
      fontWeight: '600',
    },

statHint: {
      fontSize: 12,
      color:
        colors.neutral[500],
      flex: 1,
    },
});
