/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `SHEET ACTIONS` — extraits de `ObservationListScreen`.
 */
export const stylesSheetActions = StyleSheet.create({
sheetActions: {
      flexDirection:
        'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor:
        '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor:
        '#E5EDE5',
    },

resetButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 14,
      backgroundColor:
        '#F3F4F3',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

resetButtonText: {
      color:
        '#4B5563',
      fontSize: 13,
      fontWeight: '700',
    },

applyButton: {
      flex: 1.3,
      minHeight: 48,
      borderRadius: 14,
      backgroundColor:
        '#166534',
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 7,
    },

applyButtonDisabled: {
      backgroundColor:
        '#E5E7EB',
    },

applyButtonText: {
      color:
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

applyButtonTextDisabled: {
      color:
        '#9CA3AF',
    }
});
