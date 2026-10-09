import { StyleSheet } from 'react-native';


export const stylesStepContent = StyleSheet.create({
stepContent: {
      gap: 13,
    },

intro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingHorizontal: 2,
      paddingVertical: 3,
    },

introIcon: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: '#E5F2E5',
      borderWidth: 1,
      borderColor: '#CEE5CF',
      alignItems: 'center',
      justifyContent: 'center',
    },

introIconBlue: {
      backgroundColor: '#E8F1F7',
      borderColor: '#D2E3EF',
    },

introIconSuccess: {
      backgroundColor: '#E5F3E5',
      borderColor: '#C9E4CB',
    },

introText: {
      flex: 1,
      gap: 3,
    },

introTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#1B271C',
    },

introDescription: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#778378',
    },
});
