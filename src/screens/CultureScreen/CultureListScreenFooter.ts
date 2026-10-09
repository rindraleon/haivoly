import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesFooter = StyleSheet.create({
cardFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(226,233,224,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 10,
  },

modifiedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

modifiedText: {
    flex: 1,
    fontSize: 10.5,
    color:
      colors.neutral[400],
    fontWeight: '600',
  },

detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },

detailsButtonText: {
    fontSize: 11.5,
    color:
      colors.primary[700],
    fontWeight: '900',
  },
});
