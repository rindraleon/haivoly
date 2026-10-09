import { StyleSheet } from 'react-native';


export const stylesFondAgricole = StyleSheet.create({
fieldShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },

fieldShapeOne: {
    width: 330,
    height: 220,
    top: -90,
    right: -130,
    backgroundColor: '#C5DEBC',
    transform: [
      {
        rotate: '-18deg',
      },
    ],
  },

fieldShapeTwo: {
    width: 300,
    height: 200,
    bottom: 60,
    left: -150,
    backgroundColor: '#CBE4C3',
    transform: [
      {
        rotate: '18deg',
      },
    ],
  },

fieldShapeThree: {
    width: 170,
    height: 130,
    top: 260,
    right: -70,
    backgroundColor: '#D2E7CB',
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },

fieldLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: '#B8D4AE',
    opacity: 0.65,
  },

fieldLineOne: {
    width: 360,
    top: 125,
    left: -110,
    transform: [
      {
        rotate: '-16deg',
      },
    ],
  },

fieldLineTwo: {
    width: 330,
    top: 150,
    left: -80,
    transform: [
      {
        rotate: '-16deg',
      },
    ],
  },
});
