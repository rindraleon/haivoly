/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `FAB` — extraits de `ObservationListScreen`.
 */
export const stylesFab = StyleSheet.create({
fab: {
      position: 'absolute',
      right: 18,
      bottom: 18,
      width: 58,
      height: 58,
      borderRadius: 29,
      backgroundColor:
        colors.primary[500],
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor:
        colors.primary[700],
      shadowOffset: {
        width: 0,
        height: 6,
      },
      shadowOpacity: 0.28,
      shadowRadius: 12,
      elevation: 10,
      zIndex: 50,
    },
});
