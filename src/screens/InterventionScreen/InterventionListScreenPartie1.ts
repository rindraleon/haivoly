/**
 * Feuilles de style de `InterventionListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `Partie 1` — extraits de `InterventionListScreen`.
 */
export const stylesPartie1 = StyleSheet.create({
root: {
    flex: 1,
    backgroundColor: colors.background.app,
  },

center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.background.app,
  },
});
