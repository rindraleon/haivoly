import { StyleSheet } from 'react-native';


export const stylesDate = StyleSheet.create({
dateInput: {
      minHeight: 54,
      paddingHorizontal: 13,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#DCE5DC',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

dateInputSelected: {
      borderColor: '#CFE3CF',
      backgroundColor: '#F4F8F4',
    },

dateInputLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },

dateText: {
      fontSize: 13,
      color: '#778378',
      fontWeight: '600',
    },

dateTextSelected: {
      color: '#334036',
      fontWeight: '800',
    },
});
