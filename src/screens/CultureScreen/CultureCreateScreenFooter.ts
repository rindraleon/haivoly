/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `FOOTER` — extraits de `CultureCreateScreen`.
 */
export const stylesFooter = StyleSheet.create({
footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingTop: 2,
    },

footerIcon: {
      width: 25,
      height: 25,
      borderRadius: 9,
      backgroundColor:
        'rgba(255,255,255,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },

footerText: {
      fontSize: 10.5,
      color: '#748075',
      fontWeight: '600',
    }
});
