/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `CONTEXT PARCELLE` — extraits de `CultureCreateScreen`.
 */
export const stylesContextParcelle = StyleSheet.create({
contextCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 17,
      backgroundColor: '#EEF6EE',
      borderWidth: 1,
      borderColor: '#DDEBDE',
    },

contextIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#E1F0E1',
      alignItems: 'center',
      justifyContent: 'center',
    },

contextContent: {
      flex: 1,
      gap: 2,
    },

contextLabel: {
      fontSize: 10,
      color: '#7B877D',
      fontWeight: '700',
    },

contextValue: {
      fontSize: 13.5,
      color: '#2C382E',
      fontWeight: '800',
    },
});
