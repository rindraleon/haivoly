/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `REVIEW` — extraits de `CultureCreateScreen`.
 */
export const stylesReview = StyleSheet.create({
reviewCard: {
      padding: 14,
      borderRadius: 20,
      backgroundColor:
        'rgba(255,255,255,0.91)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.90)',
    },

reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingBottom: 13,
      marginBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor:
        '#EDF1ED',
    },

reviewHeaderIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: '#E5F2E5',
      alignItems: 'center',
      justifyContent: 'center',
    },

reviewHeaderText: {
      flex: 1,
      gap: 2,
    },

reviewTitle: {
      fontSize: 16,
      color: '#1E2A20',
      fontWeight: '800',
    },

reviewSubtitle: {
      fontSize: 10,
      color: '#7D887F',
    },

reviewRow: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        '#EDF1ED',
    },

reviewRowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

reviewRowIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor: '#F0F3F0',
      alignItems: 'center',
      justifyContent: 'center',
    },

reviewRowLabel: {
      fontSize: 11,
      color: '#7A867D',
      fontWeight: '600',
    },

reviewRowValue: {
      flex: 1.25,
      fontSize: 11.5,
      color: '#2D392F',
      fontWeight: '800',
      textAlign: 'right',
    },

reviewSuccessValue: {
      color:
        colors.primary[700],
    },

reviewDescriptionCard: {
      padding: 13,
      borderRadius: 16,
      backgroundColor: '#F4F8F4',
      borderWidth: 1,
      borderColor: '#E4ECE4',
    },

reviewDescriptionLabel: {
      fontSize: 10,
      color: '#7C887E',
      fontWeight: '800',
      marginBottom: 4,
    },

reviewDescriptionText: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#566359',
    },
});
