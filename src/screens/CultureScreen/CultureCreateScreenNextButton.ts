import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesNextButton = StyleSheet.create({
nextButton: {
      minHeight: 54,
      paddingLeft: 17,
      paddingRight: 7,
      borderRadius: 16,
      backgroundColor:
        colors.primary[700],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#214126',
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },

nextButtonText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
    },

nextButtonIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },
});
