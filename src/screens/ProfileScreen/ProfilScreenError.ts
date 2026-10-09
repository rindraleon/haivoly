import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesError = StyleSheet.create({
errorContainer: {
    flexGrow: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

errorIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(255,255,255,0.92)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',

    marginBottom: 16,
  },

errorTitle: {
    fontSize: 19,
    lineHeight: 25,
    fontWeight: '900',

    color:
      colors.neutral[900],

    textAlign: 'center',
  },

errorText: {
    marginTop: 8,

    fontSize: 13.5,
    lineHeight: 21,

    color:
      colors.neutral[600],

    textAlign: 'center',
  },

retryButton: {
    marginTop: 20,

    minHeight: 46,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 22,

    borderRadius: 14,

    backgroundColor:
      colors.primary[600],

    shadowColor:
      colors.primary[900],

    shadowOffset: {
      width: 0,
      height: 4,
    },

    shadowOpacity: 0.16,
    shadowRadius: 8,

    elevation: 3,
  },

retryButtonPressed: {
    opacity: 0.82,

    transform: [
      {
        scale: 0.98,
      },
    ],
  },

retryButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
  }
});
