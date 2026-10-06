/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `ROOT` — extraits de `CultureListScreen`.
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
