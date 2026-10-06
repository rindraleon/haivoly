/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `CULTURE DROPDOWN` — extraits de `ObservationListScreen`.
 */
export const stylesCultureDropdown = StyleSheet.create({
filterCultureItem: {
      minHeight: 64,
      paddingHorizontal: 13,
      paddingVertical: 9,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F1',
    },

filterCultureItemSelected: {
      backgroundColor:
        '#F0FDF4',
    },

filterCultureItemDisabled: {
      backgroundColor:
        '#F9FAF9',
      opacity: 0.65,
    },

filterCultureInfo: {
      flex: 1,
      marginRight: 8,
    },

filterCultureNameRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

filterCultureName: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      color:
        '#1F2937',
      fontWeight: '700',
    },

filterCultureStatus: {
      marginTop: 4,
      marginLeft: 24,
      fontSize: 11,
      color:
        '#7A847A',
    },

disabledCultureText: {
      color:
        '#9CA3AF',
    },

selectedCheckCircle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor:
        '#22C55E',
      alignItems:
        'center',
      justifyContent:
        'center',
    },
});
