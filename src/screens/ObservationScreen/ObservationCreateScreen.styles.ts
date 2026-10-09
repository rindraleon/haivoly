import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F3',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },


  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#DCE7DA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  headerTextBlock: {
    flex: 1,
    paddingTop: 1,
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    color: '#4D7C55',
    letterSpacing: 1,
    marginBottom: 3,
  },

  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    color: '#172018',
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: '#6B7280',
  },


  contextCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DCE7DA',
    marginBottom: 24,
    shadowColor: '#14532D',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },

  contextAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 5,
    backgroundColor: '#22C55E',
  },

  contextMain: {
    minHeight: 106,
    paddingVertical: 15,
    paddingHorizontal: 15,
    paddingLeft: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  contextIconLarge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  contextIdentity: {
    flex: 1,
    minWidth: 0,
  },

  contextOverline: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.9,
    color: '#9CA3AF',
  },

  contextCulture: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: '#172018',
  },

  parcelleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },

  parcelleText: {
    flex: 1,
    marginLeft: 5,
    fontSize: 11,
    color: '#6B7280',
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },


  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 2,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#E8F5E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  sectionHeaderText: {
    flex: 1,
  },

  sectionTitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '800',
    color: '#172018',
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: '#6B7280',
  },


  descriptionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#DCE7DA',
    overflow: 'hidden',
    marginBottom: 14,
  },

  fieldTopRow: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3ED',
  },

  fieldTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#4B5563',
  },

  requiredText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },

  descriptionInput: {
    minHeight: 165,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 21,
    color: '#172018',
  },

  descriptionFooter: {
    minHeight: 42,
    paddingHorizontal: 12,
    paddingBottom: 9,
    paddingTop: 2,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },

  descriptionHint: {
    flex: 1,
    paddingRight: 12,
    fontSize: 10,
    lineHeight: 14,
    color: '#9CA3AF',
  },

  characterCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },


  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#D1FAE5',
    borderRadius: 15,
    padding: 12,
    marginBottom: 22,
  },

  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 9,
  },

  tipContent: {
    flex: 1,
  },

  tipTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#166534',
  },

  tipText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: '#4B5563',
  },


  dateCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE7DA',
    paddingHorizontal: 12,
  },

  dateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  dateContent: {
    flex: 1,
  },

  dateLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#9CA3AF',
    marginBottom: 2,
  },

  dateInput: {
    minHeight: 30,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: '700',
    color: '#172018',
  },

  dateHelp: {
    marginTop: 6,
    marginLeft: 3,
    marginBottom: 22,
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },


  saveButton: {
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: '#166534',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 4,
  },

  saveButtonDisabled: {
    opacity: 0.72,
  },

  saveIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#22C55E',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  saveTextBlock: {
    flex: 1,
  },

  saveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  saveSubtext: {
    marginTop: 2,
    color: '#DCFCE7',
    fontSize: 10,
    fontWeight: '500',
  },

  bottomHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },
}
);
