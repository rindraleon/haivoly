import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesDelimitation = StyleSheet.create({
delimitationCard: {
      padding: 13,
      borderRadius: 19,
      backgroundColor:
        'rgba(255,255,255,0.90)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      gap: 11,
    },

delimitationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },

delimitationHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

delimitationIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#EDF1EE',
      alignItems: 'center',
      justifyContent: 'center',
    },

delimitationTitle: {
      fontSize: 13,
      color: '#273329',
      fontWeight: '800',
    },

delimitationSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: '#829087',
      maxWidth: 220,
    },

delimitationDescription: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#6B776E',
    },

choiceRow: {
      flexDirection: 'row',
      gap: 9,
    },

choiceButton: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderColor: '#DCE5DC',
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.88)',
    },

choiceButtonActive: {
      backgroundColor:
        colors.primary[700],
      borderColor:
        colors.primary[700],
    },

choiceText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#667269',
    },

choiceTextActive: {
      color: '#FFFFFF',
    },

pointsBadge: {
      minWidth: 50,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: '#EFF2EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

pointsBadgeCompleted: {
      backgroundColor: '#E3F1E4',
    },

pointsBadgeText: {
      fontSize: 10.5,
      color: '#657168',
      fontWeight: '800',
    },

pointsBadgeTextCompleted: {
      color:
        colors.primary[700],
    },
});
