/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `CALCULATED` — extraits de `CultureCreateScreen`.
 */
export const stylesCalculated = StyleSheet.create({
calculatedCard: {
      flexDirection: 'row',
      gap: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: '#EEF6EE',
      borderWidth: 1,
      borderColor: '#DDEBDE',
    },

calculatedIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#E1F0E1',
      alignItems: 'center',
      justifyContent: 'center',
    },

calculatedContent: {
      flex: 1,
      gap: 2,
    },

calculatedTitle: {
      fontSize: 11,
      color: '#758178',
      fontWeight: '700',
    },

calculatedValue: {
      fontSize: 15,
      color: '#253226',
      fontWeight: '800',
    },

calculatedHint: {
      marginTop: 1,
      fontSize: 10,
      lineHeight: 15,
      color: '#859086',
    },
});
