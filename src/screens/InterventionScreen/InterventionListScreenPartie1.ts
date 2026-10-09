import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesPartie1 = StyleSheet.create({
root: {
    flex: 1,
    backgroundColor: colors.background.app,
  },

center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    backgroundColor: colors.background.app,
  },
});
