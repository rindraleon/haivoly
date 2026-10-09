import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesParcelle = StyleSheet.create({
parcelleCard: {
    marginTop: 2,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor:
      'rgba(246,250,244,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(218,229,214,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },

parcelleCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

parcelleCardText: {
    flex: 1,
    minWidth: 0,
  },

parcelleCardLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color:
      colors.neutral[500],
    letterSpacing: 0.65,
  },

parcelleCardValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },
});
