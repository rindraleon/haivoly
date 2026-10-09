import { StyleSheet } from 'react-native';


export const stylesAjoutEtapes = StyleSheet.create({
stepHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginBottom: 10,
    },

stepHeaderSecond: {
      marginTop: 22,
    },

stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 11,
      backgroundColor:
        '#DCFCE7',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

stepNumberText: {
      color:
        '#166534',
      fontSize: 14,
      fontWeight: '800',
    },

stepTitle: {
      color:
        '#172018',
      fontSize: 14,
      fontWeight: '800',
    },

stepSubtitle: {
      marginTop: 2,
      color:
        '#7A847A',
      fontSize: 11,
    },

addSummaryCard: {
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        '#F0FDF4',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        '#BBF7D0',
      padding: 13,
      marginTop: 20,
    },

addSummaryIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor:
        '#DCFCE7',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

addSummaryContent: {
      flex: 1,
      marginLeft: 10,
    },

addSummaryLabel: {
      fontSize: 9,
      fontWeight: '800',
      color:
        '#6B7280',
      letterSpacing: 0.7,
    },

addSummaryCulture: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: '800',
      color:
        '#166534',
    },

addSummaryParcelRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop: 3,
    },

addSummaryParcel: {
      marginLeft: 4,
      flex: 1,
      fontSize: 11,
      color:
        '#6B7280',
      fontWeight: '600',
    },
});
