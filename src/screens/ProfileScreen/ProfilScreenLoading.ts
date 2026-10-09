import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesLoading = StyleSheet.create({
loadingContainer: {
    flex: 1,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,
  },

loadingIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,

    alignItems: 'center',
    justifyContent: 'center',

    marginBottom: 16,

    backgroundColor:
      'rgba(255,255,255,0.92)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

loadingText: {
    marginTop: 10,

    fontSize: 13,
    fontWeight: '600',

    color:
      colors.neutral[600],
  },
});
