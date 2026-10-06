/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `STEPPER` — extraits de `CultureCreateScreen`.
 */
export const stylesStepper = StyleSheet.create({
stepperCard: {
      minHeight: 86,
      paddingHorizontal: 10,
      paddingVertical: 12,
      borderRadius: 19,
      backgroundColor:
        'rgba(255,255,255,0.88)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
    },

stepperLine: {
      position: 'absolute',
      top: 28,
      left: 48,
      right: 48,
      height: 2,
      backgroundColor: '#E0E9E0',
    },

stepper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

step: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },

stepCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#E8EEE8',
      borderWidth: 2,
      borderColor: '#DCE5DC',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },

stepCircleActive: {
      backgroundColor:
        colors.primary[700],
      borderColor:
        colors.primary[700],
    },

stepCircleCompleted: {
      backgroundColor:
        colors.primary[600],
      borderColor:
        colors.primary[600],
    },

stepNumber: {
      fontSize: 11,
      fontWeight: '800',
      color: '#7D897F',
    },

stepNumberActive: {
      color: '#FFFFFF',
    },

stepLabel: {
      fontSize: 9.5,
      color: '#89938A',
      fontWeight: '600',
      textAlign: 'center',
    },

stepLabelActive: {
      color: '#24482A',
      fontWeight: '800',
    },

stepLabelCompleted: {
      color:
        colors.primary[700],
      fontWeight: '700',
    },
});
