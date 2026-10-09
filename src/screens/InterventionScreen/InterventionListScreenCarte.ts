import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const stylesCarte = StyleSheet.create({
interventionCard: {
    borderRadius: radius.lg,
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EDE3',
    shadowColor: '#244D2A',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },

interventionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },

interventionHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 10,
    minWidth: 0,
  },

interventionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

interventionHeaderContent: {
    flex: 1,
    minWidth: 0,
  },

interventionType: {
    fontSize: 15,
    fontWeight: '900',
    color: '#1F2937',
  },

interventionSubtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    minWidth: 0,
  },

interventionSubtitle: {
    maxWidth: 100,
    fontSize: 10.5,
    color: colors.neutral[500],
    fontWeight: '700',
  },

statusContainer: {
    alignItems: 'flex-end',
    maxWidth: 90,
  },

cardSeparator: {
    height: 1,
    backgroundColor: '#EEF2EC',
    marginTop: 12,
    marginBottom: 12,
  },

infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

infoCard: {
    minHeight: 58,
    flexGrow: 1,
    flexBasis: '47%',
    borderRadius: 12,
    backgroundColor: '#F8FAF8',
    borderWidth: 1,
    borderColor: '#EBF1E8',
    padding: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

infoCardIcon: {
    width: 30,
    height: 30,
    borderRadius: 9,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

infoCardContent: {
    flex: 1,
    minWidth: 0,
  },

infoCardLabel: {
    fontSize: 9.5,
    letterSpacing: 0.4,
    color: colors.neutral[400],
    fontWeight: '900',
  },

infoCardValue: {
    marginTop: 2,
    fontSize: 12,
    lineHeight: 16,
    color: '#1F2937',
    fontWeight: '800',
  },

currencyIcon: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary[700],
  },

descriptionCard: {
    marginTop: 9,
    borderRadius: 12,
    backgroundColor: '#FCFEFC',
    borderWidth: 1,
    borderColor: '#EBF1E8',
    padding: 11,
  },

descriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

interventionDescription: {
    marginTop: 7,
    fontSize: 12.5,
    lineHeight: 19,
    color: '#374151',
    fontWeight: '500',
  },

photoSection: {
    marginTop: 11,
  },

photoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

photoTitle: {
    color: colors.neutral[500],
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

photoCount: {
    minWidth: 22,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
    textAlign: 'center',
    backgroundColor: '#F0FDF4',
    color: '#166534',
    fontSize: 10,
    fontWeight: '900',
  },

photoLoading: {
    marginTop: 8,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },

photoLoadingText: {
    fontSize: 11,
    color: colors.neutral[500],
  },

noPhotoText: {
    marginTop: 7,
    color: colors.neutral[400],
    fontSize: 11,
    fontWeight: '600',
  },

photoList: {
    gap: 8,
    paddingTop: 8,
  },

photoContainer: {
    width: 108,
    height: 108,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },

photo: {
    width: '100%',
    height: '100%',
  },

deletePhotoButton: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(220,38,38,0.90)',
    alignItems: 'center',
    justifyContent: 'center',
  },

photoAddTile: {
    width: 108,
    height: 108,
    borderRadius: 14,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

photoAddIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

/** Pastille « Compression… » / « Envoi… » pendant un téléversement de photo. */
envoiPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 8,
    marginTop: 10,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#DCFCE7',
  },

envoiPillText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#166534',
  },

/** Explication de la compression automatique, sous la bande de photos. */
compressionNote: {
    marginTop: 9,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.neutral[500],
  },

cardFooter: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },

modifiedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

modifiedText: {
    flex: 1,
    color: colors.neutral[400],
    fontSize: 10.5,
    fontWeight: '600',
  },

detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

detailsButtonText: {
    color: colors.primary[700],
    fontSize: 11.5,
    fontWeight: '900',
  },

actionButtons: {
    flexDirection: 'row',
    gap: 9,
    marginTop: 10,
  },

editButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

editButtonText: {
    color: '#166534',
    fontSize: 13,
    fontWeight: '800',
  },

deleteButton: {
    flex: 1,
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },

deleteButtonText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '800',
  },

readOnlyFooter: {
    marginTop: 10,
    paddingTop: 9,
    borderTopWidth: 1,
    borderTopColor: '#EEF2EC',
  },
});
