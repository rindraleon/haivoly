import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({

  root: {
    flex: 1,
    backgroundColor:
      colors.background.app,
  },


  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border.default,
    paddingBottom: 12,
  },

  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },

  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor:
      colors.border.default,
    alignItems: 'center',
    justifyContent:
      'center',
  },

  filterBtnActive: {
    backgroundColor:
      colors.primary[500],
    borderColor:
      colors.primary[500],
  },

  filterPanel: {
    backgroundColor:
      colors.neutral[100],
    borderWidth: 1,
    borderColor:
      colors.border.default,
    borderRadius:
      radius.md,
    padding: 12,
    gap: 8,
  },

  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color:
      colors.neutral[700],
    textTransform:
      'uppercase',
    letterSpacing: 0.5,
  },

  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor:
      colors.primary[50],
    borderWidth: 1,
    borderColor:
      colors.primary[100],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius:
      radius.full,
  },

  statPillValue: {
    fontSize: 12,
    fontWeight: '800',
    color:
      colors.primary[700],
  },

  statPillLabel: {
    fontSize: 11.5,
    color:
      colors.primary[700],
    fontWeight: '600',
  },

  statHint: {
    fontSize: 12,
    color:
      colors.neutral[500],
    flex: 1,
  },


  listArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#DCEBD7',
  },

  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },


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


  card: {
    gap: 12,
    padding: 14,

    backgroundColor:
      'rgba(255,255,255,0.82)',

    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.78)',

    borderRadius: 18,

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.10,
    shadowRadius: 10,

    elevation: 3,
  },

  cardTop: {
    flexDirection: 'row',
    gap: 10,
    alignItems:
      'flex-start',
  },

  cardIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor:
      'rgba(232,245,228,0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(155,190,145,0.35)',
    alignItems: 'center',
    justifyContent:
      'center',
  },

  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color:
      colors.neutral[900],
    letterSpacing: -0.3,
  },

  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },

  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor:
      'rgba(242,247,240,0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(215,225,211,0.78)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius:
      radius.full,
  },

  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color:
      colors.neutral[600],
  },

  desc: {
    fontSize: 12.5,
    lineHeight: 18,
    color:
      colors.neutral[600],
  },

  descMuted: {
    fontSize: 12.5,
    color:
      colors.neutral[400],
    fontStyle: 'italic',
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginTop: 2,
  },

  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  dateText: {
    fontSize: 11.5,
    color:
      colors.neutral[400],
    fontWeight: '500',
  },

  chev: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      'rgba(240,245,238,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(215,225,211,0.75)',
    alignItems: 'center',
    justifyContent:
      'center',
  },


  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,

    width: 56,
    height: 56,
    borderRadius: 28,

    backgroundColor:
      colors.primary[500],

    alignItems: 'center',
    justifyContent:
      'center',

    shadowColor:
      colors.primary[700],
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.28,
    shadowRadius: 12,

    elevation: 7,
  },
}
);
