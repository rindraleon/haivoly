import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesFab = StyleSheet.create({
fab: {
    position: 'absolute',
    right: 18,
    bottom: 92,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#14532D',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.20,
    shadowRadius: 10,
    elevation: 7,
    zIndex: 30,
  }
});
