/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors, radius, } from '@/theme';

/**
 * Styles `FILTRE RAPIDE` — extraits de `ObservationListScreen`.
 */
export const stylesFiltreRapide = StyleSheet.create({
filterPanel: {
      backgroundColor:
        colors.neutral[100],
      borderWidth: 1,
      borderColor:
        colors.border.default,
      borderRadius:
        radius.md,
      padding: 12,
      gap: 10,
    },

filterHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

filterLabel: {
      fontSize: 11,
      fontWeight: '800',
      color:
        colors.neutral[600],
      letterSpacing: 0.7,
      marginBottom: 8,
    },

filterSelect: {
      minHeight: 54,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        colors.border.default,
      paddingHorizontal: 11,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

filterSelectSecond: {
      marginTop: 2,
    },

filterSelectModal: {
      minHeight: 58,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        '#DDE7DD',
      paddingHorizontal: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

filterSelectOpen: {
      borderColor:
        colors.primary[500],
    },

filterSelectDisabled: {
      backgroundColor:
        colors.neutral[100],
      borderColor:
        '#E5E7EB',
    },

filterSelectLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      minWidth: 0,
    },

filterSelectIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        '#ECFDF3',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

filterSelectIconDisabled: {
      backgroundColor:
        '#E5E7EB',
    },

filterSelectText: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '700',
      color:
        '#1F2937',
    },

filterSelectPlaceholder: {
      color:
        '#9CA3AF',
      fontWeight: '500',
    },

chevronRotated: {
      transform: [
        {
          rotate:
            '180deg',
        },
      ],
    },

filterPanelActions: {
      flexDirection:
        'row',
      gap: 8,
      marginTop: 2,
    },

resetSmallButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        colors.neutral[200],
      alignItems:
        'center',
      justifyContent:
        'center',
    },

resetSmallButtonText: {
      color:
        colors.neutral[700],
      fontSize: 12,
      fontWeight: '700',
    },

applySmallButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        colors.primary[500],
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 6,
    },

applySmallButtonText: {
      color:
        '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },
});
