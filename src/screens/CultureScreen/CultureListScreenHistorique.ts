/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `HISTORIQUE` — extraits de `CultureListScreen`.
 */
export const stylesHistorique = StyleSheet.create({
historyButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor:
      colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 5,
  },

historyButtonText: {
    color:
      colors.primary[700],
    fontSize: 13.5,
    fontWeight: '800',
  },
});
