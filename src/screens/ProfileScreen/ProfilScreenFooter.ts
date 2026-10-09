import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesFooter = StyleSheet.create({
footer: {
    alignItems: 'center',
    justifyContent: 'center',

    flexDirection: 'row',

    gap: 6,

    marginTop: 22,
    marginBottom: 4,
  },

footerIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#E8F5E4',
  },

versionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color:
      colors.neutral[400],
  },
});
