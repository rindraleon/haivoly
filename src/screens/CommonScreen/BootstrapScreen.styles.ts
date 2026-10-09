import { StyleSheet } from 'react-native';

import { colors } from '@/theme';

export const styles = StyleSheet.create({
  centre: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.background.app,
  },

  texte: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.neutral[500],
  },
});
