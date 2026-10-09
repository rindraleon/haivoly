import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesProgression = StyleSheet.create({
progressSection: {
    gap: 0,
  },

progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },

progressTitleArea: {
    flex: 1,
    paddingRight: 10,
  },

progressTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color:
      colors.neutral[700],
    letterSpacing: 0.65,
  },

progressLabelActive: {
    marginTop: 4,
    fontSize: 11.5,
    color:
      colors.primary[700],
    fontWeight: '700',
  },

progressLabelInactive: {
    marginTop: 4,
    fontSize: 11.5,
    color:
      colors.neutral[500],
    fontWeight: '600',
  },

progressPercent: {
    fontSize: 15,
    color:
      colors.primary[700],
    fontWeight: '900',
  },

progressPercentInactive: {
    fontSize: 15,
    color:
      colors.neutral[400],
    fontWeight: '800',
  },

progressTimeline: {
    position: 'relative',
    height: 48,
    marginTop: 10,
  },

progressLineBackground: {
    position: 'absolute',
    top: 4,
    left: 5.5,
    right: 5.5,
    height: 4,
    borderRadius: 999,
    backgroundColor:
      '#DDE6DA',
  },

progressLineActive: {
    position: 'absolute',
    top: 4,
    left: 5.5,
    height: 4,
    borderRadius: 999,
    backgroundColor:
      colors.primary[500],
  },

progressNodeRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

progressNodeItem: {
    flex: 1,
  },

progressNodeStart: {
    alignItems: 'flex-start',
  },

progressNodeCenter: {
    alignItems: 'center',
  },

progressNodeEnd: {
    alignItems: 'flex-end',
  },

progressNode: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor:
      '#D2DBD0',
    borderWidth: 2,
    borderColor:
      '#FFFFFF',
  },

progressNodeActive: {
    backgroundColor:
      colors.primary[500],
    borderColor:
      colors.primary[500],
  },

progressNodeInactive: {
    backgroundColor:
      '#C8D0C7',
    borderColor:
      '#C8D0C7',
  },

progressNodeLabel: {
    marginTop: 7,
    fontSize: 9.5,
    color:
      colors.neutral[400],
    fontWeight: '600',
  },

progressNodeLabelActive: {
    color:
      colors.primary[700],
    fontWeight: '800',
  },
});
