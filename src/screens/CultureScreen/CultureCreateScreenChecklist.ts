/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `CHECKLIST` — extraits de `CultureCreateScreen`.
 */
export const stylesChecklist = StyleSheet.create({
checklistCard: {
      padding: 13,
      borderRadius: 18,
      backgroundColor:
        'rgba(255,255,255,0.82)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.86)',
    },

checklistTitle: {
      fontSize: 12,
      color: '#39453B',
      fontWeight: '800',
      marginBottom: 4,
    },

checkItem: {
      minHeight: 39,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

checkItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        '#EDF1ED',
    },

checkItemIcon: {
      width: 22,
      height: 22,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },

checkItemIconChecked: {
      backgroundColor:
        colors.primary[700],
    },

checkItemIconEmpty: {
      backgroundColor: '#E8ECE8',
      borderWidth: 1,
      borderColor: '#D8E0D8',
    },

checkItemText: {
      flex: 1,
      fontSize: 10.5,
      color: '#879188',
      fontWeight: '600',
    },

checkItemTextChecked: {
      color: '#506052',
      fontWeight: '700',
    },
});
