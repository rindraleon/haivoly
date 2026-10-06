/**
 * Feuilles de style de `InterventionListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `FORMULAIRE` — extraits de `InterventionListScreen`.
 */
export const stylesFormulaire = StyleSheet.create({
formCard: {
    zIndex: 8,
    borderRadius: 17,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CDE7CF',
    padding: 14,
    marginBottom: 12,
    shadowColor: '#1E5128',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },

formHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },

formHeaderCopy: {
    flex: 1,
    minWidth: 0,
  },

formTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1F2937',
  },

formSubtitle: {
    marginTop: 2,
    fontSize: 11,
    color: colors.neutral[500],
    fontWeight: '600',
  },

formCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

label: {
    marginTop: 10,
    marginBottom: 6,
    fontSize: 11,
    color: '#374151',
    fontWeight: '800',
  },

input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE6DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    color: '#1F2937',
    fontSize: 13,
  },

textarea: {
    minHeight: 108,
    paddingTop: 11,
    paddingBottom: 11,
  },

dateHelp: {
    marginTop: 4,
    fontSize: 10.5,
    color: colors.neutral[400],
    fontWeight: '600',
  },

formTwoColumns: {
    flexDirection: 'row',
    gap: 8,
  },

formColumn: {
    flex: 1,
  },

formButtons: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 14,
  },

cancelButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },

cancelButtonText: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '800',
  },

saveButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

saveButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
  },

readOnlyBanner: {
    zIndex: 6,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'rgba(255,255,255,0.92)',
    padding: 12,
  },

readOnlyBannerTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#374151',
  },

readOnlyBannerText: {
    marginTop: 3,
    fontSize: 11,
    lineHeight: 16,
    color: colors.neutral[500],
    fontWeight: '600',
  },
});
