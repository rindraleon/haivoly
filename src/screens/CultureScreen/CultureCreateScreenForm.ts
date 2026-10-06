/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `FORM` — extraits de `CultureCreateScreen`.
 */
export const stylesForm = StyleSheet.create({
formGroup: {
      gap: 6,
    },

labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

label: {
      fontSize: 12,
      color: '#364238',
      fontWeight: '800',
    },

required: {
      color: '#D25454',
      fontSize: 13,
      fontWeight: '900',
    },

input: {
      minHeight: 52,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#DCE5DC',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      paddingHorizontal: 14,
      fontSize: 13.5,
      color: '#273329',
      fontWeight: '600',
    },

textArea: {
      minHeight: 105,
      paddingTop: 13,
      paddingBottom: 13,
    },

helperText: {
      fontSize: 10,
      color: '#899389',
      paddingHorizontal: 2,
      lineHeight: 14,
    },
});
