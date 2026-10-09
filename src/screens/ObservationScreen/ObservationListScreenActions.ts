import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesActions = StyleSheet.create({
actionButtons: {
      flexDirection:
        'row',
      gap: 10,
      marginTop: 10,
    },

editButton: {
      flex: 1,
      minHeight: 42,
      backgroundColor:
        '#F0FDF4',
      borderWidth: 1,
      borderColor:
        '#BBF7D0',
      borderRadius: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 10,
    },

editButtonText: {
      marginLeft: 6,
      color:
        '#166534',
      fontWeight: '700',
      fontSize: 13,
    },

deleteButton: {
      flex: 1,
      minHeight: 42,
      backgroundColor:
        '#FEF2F2',
      borderWidth: 1,
      borderColor:
        '#FECACA',
      borderRadius: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 10,
    },

deleteButtonText: {
      marginLeft: 6,
      color:
        '#DC2626',
      fontWeight: '700',
      fontSize: 13,
    },

readOnlyFooter: {
      marginTop: 10,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor:
        'rgba(226,233,224,0.95)',
    },

readOnlyFooterText: {
      fontSize: 10.5,
      color:
        colors.neutral[400],
      fontWeight: '700',
    },
});
