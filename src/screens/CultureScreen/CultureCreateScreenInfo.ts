import { StyleSheet } from 'react-native';


export const stylesInfo = StyleSheet.create({
infoCard: {
      flexDirection: 'row',
      gap: 8,
      padding: 11,
      borderRadius: 15,
      backgroundColor: '#EAF2F7',
      borderWidth: 1,
      borderColor: '#D9E8F0',
    },

infoIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor: '#DDEBF4',
      alignItems: 'center',
      justifyContent: 'center',
    },

infoText: {
      flex: 1,
      fontSize: 10.5,
      lineHeight: 16,
      color: '#5E7080',
      fontWeight: '600',
    },
});
