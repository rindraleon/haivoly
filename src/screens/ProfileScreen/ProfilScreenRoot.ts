import { StyleSheet } from 'react-native';


export const stylesRoot = StyleSheet.create({
screen: {
    flex: 1,
    backgroundColor:
      '#DCEBD7',
  },

scroll: {
    flex: 1,
  },

backgroundLayer: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
    backgroundColor:
      '#DCEBD7',
  },
});
