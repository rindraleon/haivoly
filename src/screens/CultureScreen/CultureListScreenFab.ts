/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `FAB` — extraits de `CultureListScreen`.
 */
export const stylesFab = StyleSheet.create({
fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
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
    elevation: 7,
  },

bottomSpace: {
    height: 100,
  },
});
