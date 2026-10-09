import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const stylesTopBar = StyleSheet.create({
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

localTopBar: {
    padding: 12,
    gap: 10,
    backgroundColor:
      'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.8)',
    borderRadius: 16,
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
    justifyContent: 'center',
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
    gap: 10,
  },

filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
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
});
