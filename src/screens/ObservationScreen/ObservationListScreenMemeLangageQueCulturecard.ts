import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesMemeLangageQueCulturecard = StyleSheet.create({
observationCard: {
      padding: 15,
      gap: 0,
      backgroundColor:
        'rgba(255,255,255,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      borderRadius: 20,
      shadowColor:
        '#355D38',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
    },

observationHeader: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap: 11,
    },

observationHeaderLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      minWidth: 0,
    },

observationIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        'rgba(232,245,228,0.95)',
      borderWidth: 1,
      borderColor:
        'rgba(155,190,145,0.40)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

observationHeaderContent: {
      flex: 1,
      minWidth: 0,
      paddingTop: 1,
      marginLeft: 11,
    },

observationCultureName: {
      fontSize: 16,
      fontWeight: '900',
      color:
        colors.neutral[900],
      letterSpacing: 0.1,
      textTransform:
        'uppercase',
    },

observationSubtitleRow: {
      marginTop: 4,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 4,
      minWidth: 0,
    },

observationSubtitle: {
      flexShrink: 1,
      fontSize: 11.5,
      color:
        colors.neutral[500],
      fontWeight: '600',
    },

statusContainer: {
      paddingTop: 1,
      alignItems:
        'flex-end',
    },

cardSeparator: {
      height: 1,
      backgroundColor:
        'rgba(224,232,221,0.95)',
      marginTop: 15,
      marginBottom: 15,
    },
});
