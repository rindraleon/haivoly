import { StyleSheet } from 'react-native';


export const stylesAgriculturalList = StyleSheet.create({
listArea: {
    flex: 1,
    backgroundColor: '#DCEBD7',
    position: 'relative',
  },

listScroll: {
    flex: 1,
  },

listScrollContent: {
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 120,
    position: 'relative',
    minHeight: '100%',
  },

listScrollContentDetail: {
    paddingBottom: 150,
  },

cardsList: {
    gap: 12,
    zIndex: 5,
  },

fieldShape: {
    position: 'absolute',
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 90,
    zIndex: 0,
  },

fieldShapeOne: {
    width: 250,
    height: 140,
    top: 40,
    right: -80,
    transform: [{ rotate: '13deg' }],
  },

fieldShapeTwo: {
    width: 300,
    height: 160,
    top: 270,
    left: -120,
    transform: [{ rotate: '-12deg' }],
  },

fieldShapeThree: {
    width: 220,
    height: 120,
    bottom: 120,
    right: -50,
    transform: [{ rotate: '-10deg' }],
  },

fieldLine: {
    position: 'absolute',
    height: 2,
    width: 280,
    borderRadius: 999,
    backgroundColor: 'rgba(76, 122, 75, 0.10)',
    zIndex: 0,
  },

fieldLineOne: {
    top: 185,
    left: -40,
    transform: [{ rotate: '10deg' }],
  },

fieldLineTwo: {
    top: 405,
    right: -50,
    transform: [{ rotate: '-8deg' }],
  },

activeFilterCard: {
    zIndex: 6,
    marginBottom: 12,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: 'rgba(240,253,244,0.96)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

activeFilterIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

activeFilterContent: {
    flex: 1,
  },

activeFilterTitle: {
    color: '#166534',
    fontSize: 11.5,
    fontWeight: '900',
  },

activeFilterText: {
    marginTop: 1,
    color: '#365314',
    fontSize: 11,
    fontWeight: '600',
  },

activeFilterClear: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
