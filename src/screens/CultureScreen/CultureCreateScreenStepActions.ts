/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `STEP ACTIONS` — extraits de `CultureCreateScreen`.
 */
export const stylesStepActions = StyleSheet.create({
stepActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

secondaryStepButton: {
      minHeight: 54,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor:
        'rgba(255,255,255,0.86)',
      borderWidth: 1,
      borderColor: '#DCE5DC',
      justifyContent: 'center',
      alignItems: 'center',
    },

secondaryStepButtonText: {
      fontSize: 12.5,
      color: '#5E6C61',
      fontWeight: '800',
    },

stepActionFlex: {
      flex: 1,
    },
});
