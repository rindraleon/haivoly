/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `SCREEN STATES` — extraits de `ObservationListScreen`.
 */
export const stylesScreenStates = StyleSheet.create({
center: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
      paddingVertical: 24,
      backgroundColor:
        colors.background.app,
    },

blockedIcon: {
      fontSize: 52,
      marginBottom: 14,
    },

blockedTitle: {
      fontSize: 20,
      fontWeight: '800',
      color:
        colors.neutral[800],
      textAlign:
        'center',
      marginBottom: 8,
    },

blockedText: {
      maxWidth: 320,
      fontSize: 14,
      lineHeight: 21,
      color:
        colors.neutral[500],
      textAlign:
        'center',
      marginBottom: 20,
    },

backButton: {
      minHeight: 46,
      paddingHorizontal: 24,
      borderRadius: 13,
      backgroundColor:
        '#166534',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

backButtonText: {
      color:
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

loadingText: {
      marginTop: 12,
      fontSize: 13,
      color:
        colors.neutral[500],
      textAlign:
        'center',
    },

errorText: {
      maxWidth: 320,
      fontSize: 14,
      lineHeight: 21,
      color:
        colors.neutral[700],
      fontWeight: '600',
      textAlign:
        'center',
      marginBottom: 16,
    },

retryButton: {
      minHeight: 46,
      paddingHorizontal: 24,
      borderRadius: 13,
      backgroundColor:
        '#166534',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

retryText: {
      color:
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },
});
