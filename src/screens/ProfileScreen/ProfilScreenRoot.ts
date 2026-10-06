/**
 * Feuilles de style de `ProfilScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `ROOT` — extraits de `ProfilScreen`.
 */
export const stylesRoot = StyleSheet.create({
screen: {
    flex: 1,
    backgroundColor:
      '#DCEBD7',
  },

scroll: {
    flex: 1,
  },

backgroundLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    backgroundColor:
      '#DCEBD7',
  },
});
