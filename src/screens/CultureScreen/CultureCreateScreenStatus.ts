/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `STATUS` — extraits de `CultureCreateScreen`.
 */
export const stylesStatus = StyleSheet.create({
statusCard: {
      flexDirection: 'row',
      gap: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: '#EEF6EE',
      borderWidth: 1,
      borderColor: '#DDEBDE',
    },

statusIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#E2F0E2',
      alignItems: 'center',
      justifyContent: 'center',
    },

statusContent: {
      flex: 1,
      gap: 2,
    },

statusLabel: {
      fontSize: 10,
      color: '#7B877D',
      fontWeight: '700',
    },

statusValue: {
      fontSize: 14,
      color: '#2C382E',
      fontWeight: '800',
    },

statusHint: {
      marginTop: 1,
      fontSize: 10,
      lineHeight: 15,
      color: '#859086',
    },
});
