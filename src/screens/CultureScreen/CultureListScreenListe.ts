/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `LISTE` — extraits de `CultureListScreen`.
 */
export const stylesListe = StyleSheet.create({
listArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#DCEBD7',
  },

listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },

detailListArea: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor:
      '#DCEBD7',
    paddingBottom: 4,
  },

detailListContent: {
    padding: 12,
    gap: 12,
  },
});
