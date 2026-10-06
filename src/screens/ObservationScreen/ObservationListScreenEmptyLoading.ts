/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `EMPTY / LOADING` — extraits de `ObservationListScreen`.
 */
export const stylesEmptyLoading = StyleSheet.create({
loadingInline: {
      paddingVertical: 45,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 12,
    },

loadingInlineText: {
      fontSize: 13,
      color:
        colors.neutral[500],
    },

emptyInline: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

emptyCard: {
      backgroundColor:
        'rgba(255,255,255,0.92)',
      borderRadius: 20,
      padding: 30,
      alignItems:
        'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      shadowColor:
        '#355D38',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    },

emptyIcon: {
      fontSize: 42,
      marginBottom: 10,
    },

emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color:
        colors.neutral[800],
      marginBottom: 6,
      textAlign:
        'center',
    },

emptyText: {
      fontSize: 14,
      color:
        colors.neutral[500],
      textAlign:
        'center',
      lineHeight: 20,
    },

errorTitle: {
      fontSize: 16,
      fontWeight: '800',
      color:
        colors.neutral[900],
      textAlign:
        'center',
    },

errorMessage: {
      marginTop: 6,
      fontSize: 13,
      color:
        colors.neutral[500],
      textAlign:
        'center',
    },

retryButtonInline: {
      marginTop: 15,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor:
        colors.primary[500],
    },

retryButtonInlineText: {
      fontSize: 13,
      color:
        '#FFFFFF',
      fontWeight: '800',
    },

resetEmptyButton: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor:
        '#F0FDF4',
    },

resetEmptyButtonText: {
      color:
        '#166534',
      fontSize: 13,
      fontWeight: '700',
    },
});
