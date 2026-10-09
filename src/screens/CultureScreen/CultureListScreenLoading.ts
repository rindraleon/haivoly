import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesLoading = StyleSheet.create({
loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    backgroundColor:
      colors.background.app,
  },

loadingText: {
    fontSize: 14,
    color:
      colors.neutral[500],
  },

loadingInline: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },

loadingInlineText: {
    fontSize: 13,
    color:
      colors.neutral[500],
  },
});
