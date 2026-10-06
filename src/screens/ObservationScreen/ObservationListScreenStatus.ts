/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `STATUS` — extraits de `ObservationListScreen`.
 */
export const stylesStatus = StyleSheet.create({
statusBox: {
      padding: 14,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 18,
      borderWidth: 1,
    },

statusEditable: {
      backgroundColor:
        '#F0FDF4',
      borderColor:
        '#BBF7D0',
    },

statusReadOnly: {
      backgroundColor:
        '#FFF7ED',
      borderColor:
        '#FED7AA',
    },

statusHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

statusDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      marginRight: 8,
    },

statusDotEditable: {
      backgroundColor:
        '#22C55E',
    },

statusDotReadonly: {
      backgroundColor:
        '#F59E0B',
    },

statusText: {
      fontSize: 15,
      fontWeight: '800',
      color:
        '#374151',
    },

statusDescription: {
      marginTop: 6,
      color:
        '#6B7280',
      fontSize: 13,
      lineHeight: 19,
    },
});
