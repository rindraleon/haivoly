import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesMap = StyleSheet.create({
mapCard: {
    height: 420,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor:
      colors.neutral[200],
    borderWidth: 1,
    borderColor:
      colors.border.default,
  },

mapUpdatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor:
      'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor:
      'rgba(218,229,214,0.95)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },

mapUpdatingText: {
    fontSize: 11,
    color:
      colors.neutral[700],
    fontWeight: '700',
  },
});
