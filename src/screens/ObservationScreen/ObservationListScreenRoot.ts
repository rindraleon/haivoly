/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `ROOT` — extraits de `ObservationListScreen`.
 */
export const stylesRoot = StyleSheet.create({
root: {
      flex: 1,
      backgroundColor:
        colors.background.app,
    },

detailContent: {
      paddingBottom: 120,
    },
});
