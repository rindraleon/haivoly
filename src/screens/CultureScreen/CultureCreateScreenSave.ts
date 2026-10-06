/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `SAVE` — extraits de `CultureCreateScreen`.
 */
export const stylesSave = StyleSheet.create({
saveButton: {
      minHeight: 57,
      borderRadius: 17,
      backgroundColor:
        colors.primary[700],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#214126',
      shadowOpacity: 0.16,
      shadowRadius: 11,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },

disabledButton: {
      opacity: 0.65,
    },

saveText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
    },

editBeforeSave: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

editBeforeSaveText: {
      fontSize: 11.5,
      color:
        colors.primary[700],
      fontWeight: '800',
    },
});
