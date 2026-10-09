import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesMemeFondQueCulturesTsx = StyleSheet.create({
listArea: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor:
        '#DCEBD7',
    },

listAreaDetail: {
      position: 'relative',
      overflow: 'hidden',
      marginHorizontal: 0,
      borderRadius: 20,
      backgroundColor:
        '#DCEBD7',
      paddingBottom: 4,
    },

detailBody: {
      flex: 1,
      position: 'relative',
    },

listScroll: {
      flex: 1,
    },

listScrollContent: {
      paddingBottom: 84,
    },

listContent: {
      padding: 12,
      gap: 12,
    },

activeFilterCard: {
      marginHorizontal: 12,
      marginTop: 12,
      padding: 11,
      borderRadius: 15,
      backgroundColor:
        'rgba(255,255,255,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(218,229,214,0.95)',
      flexDirection:
        'row',
      alignItems:
        'center',
    },

activeFilterIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        '#E8F5E4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

activeFilterContent: {
      flex: 1,
      marginLeft: 9,
      marginRight: 8,
    },

activeFilterLabel: {
      fontSize: 9,
      color:
        colors.neutral[500],
      fontWeight: '900',
      letterSpacing: 0.6,
      textTransform:
        'uppercase',
    },

activeFilterText: {
      marginTop: 2,
      color:
        colors.primary[700],
      fontSize: 12,
      fontWeight: '700',
    },

clearFilterButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        '#F0FDF4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },
});
