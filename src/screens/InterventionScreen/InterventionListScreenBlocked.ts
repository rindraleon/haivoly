import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesBlocked = StyleSheet.create({
blockedIcon: {
    fontSize: 50,
    marginBottom: 12,
  },

blockedTitle: {
    color: '#1F2937',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },

blockedText: {
    maxWidth: 330,
    color: colors.neutral[500],
    fontSize: 13.5,
    lineHeight: 21,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 18,
  },

backButton: {
    minHeight: 46,
    paddingHorizontal: 25,
    borderRadius: 13,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
});
