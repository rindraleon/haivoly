import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const stylesModal = StyleSheet.create({
modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(16,24,16,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },

modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },

modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },

modalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },

modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },

modalSubtitle: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    color:
      colors.neutral[500],
  },

modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:
      colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

modalDivider: {
    height: 1,
    backgroundColor:
      colors.border.default,
    marginVertical: 14,
  },

modalParcellesScroll: {
    maxHeight: 430,
  },

modalParcelleItem: {
    minHeight: 68,
    marginBottom: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor:
      colors.border.default,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },

modalParcelleItemSelected: {
    borderColor:
      colors.primary[500],
    backgroundColor:
      colors.primary[50],
  },

modalParcelleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

modalParcelleInfo: {
    flex: 1,
  },

modalParcelleNom: {
    fontSize: 14,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },

modalParcelleSuperficie: {
    marginTop: 3,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },

modalCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },

modalLoading: {
    paddingVertical: 35,
    alignItems: 'center',
    gap: 12,
  },

modalLoadingText: {
    color:
      colors.neutral[500],
    fontSize: 13,
  },

modalEmpty: {
    paddingVertical: 30,
    alignItems: 'center',
  },

modalEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color:
      colors.neutral[900],
    textAlign: 'center',
  },

modalEmptyText: {
    marginTop: 6,
    fontSize: 13,
    color:
      colors.neutral[500],
    textAlign: 'center',
    lineHeight: 19,
  }
});
