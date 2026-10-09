import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesHeader = StyleSheet.create({
header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

headerIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor:
      'rgba(255,255,255,0.90)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },

headerTexts: {
    flex: 1,
    marginLeft: 11,
  },

eyebrow: {
    fontSize: 9,
    fontWeight: '900',
    color:
      colors.primary[700],
    letterSpacing: 1,
  },

title: {
    marginTop: 1,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
    color:
      colors.neutral[900],
  },

subtitle: {
    marginTop: 3,
    fontSize: 13,
    lineHeight: 19,
    color:
      colors.neutral[600],
  },
});
