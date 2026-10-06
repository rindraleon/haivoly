/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `SUIVI` — extraits de `ObservationListScreen`.
 */
export const stylesSuivi = StyleSheet.create({
followSection: {
      marginTop: 22,
    },

followButton: {
      minHeight: 68,
      backgroundColor:
        '#166534',
      borderRadius: 17,
      paddingHorizontal: 8,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

followButtonDisabled: {
      backgroundColor:
        '#E5E7EB',
    },

followButtonIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
        '#22C55E',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

followButtonContent: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
    },

followButtonTitle: {
      color:
        '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

followButtonSubtitle: {
      marginTop: 3,
      color:
        '#DCFCE7',
      fontSize: 11,
      fontWeight: '500',
    },
});
