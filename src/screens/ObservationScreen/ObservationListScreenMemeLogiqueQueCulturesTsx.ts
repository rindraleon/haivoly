/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `même logique que cultures.tsx` — extraits de `ObservationListScreen`.
 */
export const stylesMemeLogiqueQueCulturesTsx = StyleSheet.create({
topBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 12,
      backgroundColor:
        '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border.default,
      paddingBottom: 12,
    },

searchRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
    },

searchContainer: {
      flex: 1,
      minHeight: 44,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        colors.border.default,
      borderRadius: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 12,
    },

searchInput: {
      flex: 1,
      marginLeft: 8,
      paddingVertical: 0,
      fontSize: 14,
      color:
        colors.neutral[800],
    },

clearSearchButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems:
        'center',
      justifyContent:
        'center',
      backgroundColor:
        colors.neutral[100],
    },

filterButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        colors.border.default,
      alignItems:
        'center',
      justifyContent:
        'center',
      position: 'relative',
    },

filterButtonActive: {
      backgroundColor:
        colors.primary[500],
      borderColor:
        colors.primary[500],
    },

filterIndicator: {
      position: 'absolute',
      width: 7,
      height: 7,
      borderRadius: 4,
      top: 7,
      right: 7,
      backgroundColor:
        colors.primary[700],
      borderWidth: 1,
      borderColor:
        '#FFFFFF',
    },
});
