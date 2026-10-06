/**
 * Feuilles de style de `InterventionListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `FILTRE MODAL` — extraits de `InterventionListScreen`.
 */
export const stylesFiltreModal = StyleSheet.create({
modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },

modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(15,23,42,0.30)',
  },

filterSheet: {
    maxHeight: '82%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
  },

sheetHandle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: '#D1D5DB',
    marginBottom: 10,
  },

sheetHeader: {
    paddingHorizontal: 16,
    paddingBottom: 6,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

sheetTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F2937',
  },

sheetSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.neutral[500],
    fontWeight: '600',
  },

sheetCloseButton: {
    width: 38,
    height: 38,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

sheetContent: {
    paddingHorizontal: 16,
    paddingTop: 7,
    paddingBottom: 28,
  },

filterLabel: {
    marginTop: 10,
    marginBottom: 7,
    fontSize: 10,
    letterSpacing: 0.5,
    color: colors.neutral[500],
    fontWeight: '900',
  },

filterLabelCulture: {
    marginTop: 15,
  },

filterSelectModal: {
    minHeight: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#DDE6DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

filterSelectOpen: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },

filterSelectDisabled: {
    backgroundColor: '#F9FAFB',
    borderColor: '#E5E7EB',
  },

filterSelectLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    minWidth: 0,
  },

filterSelectIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

filterSelectIconDisabled: {
    backgroundColor: '#F3F4F6',
  },

filterSelectText: {
    flex: 1,
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '800',
  },

filterSelectPlaceholder: {
    color: colors.neutral[400],
    fontWeight: '600',
  },

chevronRotated: {
    transform: [{ rotate: '180deg' }],
  },

filterDropdown: {
    marginTop: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FCFEFC',
    overflow: 'hidden',
  },

filterDropdownScroll: {
    maxHeight: 220,
  },

dropdownLoading: {
    minHeight: 72,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },

dropdownLoadingText: {
    color: colors.neutral[500],
    fontSize: 11,
    fontWeight: '600',
  },

dropdownEmpty: {
    paddingHorizontal: 13,
    paddingVertical: 15,
    color: colors.neutral[500],
    fontSize: 11.5,
    fontWeight: '600',
  },

filterDropdownItem: {
    minHeight: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2EC',
    gap: 10,
  },

filterDropdownItemSelected: {
    backgroundColor: '#F0FDF4',
  },

dropdownItemLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

filterDropdownItemText: {
    flex: 1,
    color: '#374151',
    fontSize: 12,
    fontWeight: '700',
  },

filterDropdownItemTextSelected: {
    color: '#166534',
    fontWeight: '900',
  },

filterCultureItem: {
    minHeight: 57,
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2EC',
    gap: 10,
  },

filterCultureItemSelected: {
    backgroundColor: '#F0FDF4',
  },

filterCultureItemDisabled: {
    opacity: 0.55,
  },

filterCultureInfo: {
    flex: 1,
    minWidth: 0,
  },

filterCultureNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

filterCultureName: {
    flex: 1,
    color: '#374151',
    fontSize: 12.5,
    fontWeight: '800',
  },

disabledCultureText: {
    color: '#9CA3AF',
  },

filterCultureStatus: {
    marginTop: 2,
    color: colors.neutral[400],
    fontSize: 10.5,
    fontWeight: '600',
  },

selectedCheckCircle: {
    width: 25,
    height: 25,
    borderRadius: 13,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

followButton: {
    marginTop: 17,
    minHeight: 62,
    borderRadius: 14,
    backgroundColor: '#166534',
    paddingHorizontal: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

followButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },

followButtonIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },

followButtonContent: {
    flex: 1,
    minWidth: 0,
  },

followButtonTitle: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },

followButtonSubtitle: {
    marginTop: 2,
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10.5,
    fontWeight: '600',
  },

filterPanelActions: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 17,
  },

resetSmallButton: {
    flex: 1,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

resetSmallButtonText: {
    color: '#374151',
    fontSize: 12.5,
    fontWeight: '800',
  },

applySmallButton: {
    flex: 1.2,
    minHeight: 46,
    borderRadius: 12,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

applySmallButtonText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
