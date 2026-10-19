import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

/**
 * Styles de l'écran de modification d'observation, dérivés des jetons du
 * thème actif (clair/sombre cohérents avec le reste de l'application).
 */
export function creerStylesEditionObservation(j: Jetons) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: j.fond.app,
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },


  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: j.fond.app,
  },

  loadingIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: j.primaire.clair,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: j.primaire.clair,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  loadingText: {
    marginTop: 12,
    color: j.texte.secondaire,
    fontSize: 14,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: j.texte.principal,
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    color: j.texte.secondaire,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },

  backButtonLarge: {
    backgroundColor: j.primaire.fonce,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  backButtonText: {
    color: j.primaire.contraste,
    fontWeight: '800',
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
    backgroundColor: j.fond.carte,
    borderWidth: 1,
    borderColor: j.bordure.defaut,
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
    color: j.primaire.base,
    letterSpacing: 1,
    marginBottom: 3,
  },

  title: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '800',
    color: j.texte.principal,
    letterSpacing: -0.4,
  },

  subtitle: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color: j.texte.secondaire,
  },


  contextCard: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: j.fond.carte,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: j.bordure.defaut,
    marginBottom: 24,
    shadowColor: j.primaire.fonce,
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
    backgroundColor: j.primaire.base,
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
    backgroundColor: j.primaire.clair,
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
    color: j.texte.discret,
  },

  contextCulture: {
    marginTop: 2,
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: j.texte.principal,
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
    color: j.texte.secondaire,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: j.primaire.clair,
    borderWidth: 1,
    borderColor: j.primaire.clair,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: j.primaire.base,
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: j.primaire.fonce,
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
    backgroundColor: j.primaire.clair,
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
    color: j.texte.principal,
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11,
    lineHeight: 16,
    color: j.texte.secondaire,
  },


  existingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: j.fond.carte,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: j.bordure.defaut,
    padding: 12,
    marginBottom: 14,
  },

  existingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: j.primaire.clair,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  existingContent: {
    flex: 1,
  },

  existingLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: j.texte.discret,
  },

  existingDate: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: j.texte.principal,
  },


  descriptionCard: {
    backgroundColor: j.fond.carte,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: j.bordure.defaut,
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
    borderBottomColor: j.bordure.defaut,
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
    color: j.texte.secondaire,
  },

  requiredText: {
    fontSize: 9,
    fontWeight: '700',
    color: j.primaire.base,
  },

  descriptionInput: {
    minHeight: 165,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 21,
    color: j.texte.principal,
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
    color: j.texte.discret,
  },

  characterCount: {
    fontSize: 10,
    fontWeight: '700',
    color: j.texte.discret,
  },


  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: j.primaire.clair,
    borderWidth: 1,
    borderColor: j.primaire.clair,
    borderRadius: 15,
    padding: 12,
    marginBottom: 22,
  },

  tipIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: j.primaire.clair,
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
    color: j.primaire.fonce,
  },

  tipText: {
    marginTop: 3,
    fontSize: 10,
    lineHeight: 15,
    color: j.texte.secondaire,
  },


  dateCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: j.fond.carte,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: j.bordure.defaut,
    paddingHorizontal: 12,
  },

  dateIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: j.primaire.clair,
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
    color: j.texte.discret,
    marginBottom: 2,
  },

  dateInput: {
    minHeight: 30,
    paddingHorizontal: 0,
    paddingVertical: 0,
    fontSize: 13,
    fontWeight: '700',
    color: j.texte.principal,
  },

  dateHelp: {
    marginTop: 6,
    marginLeft: 3,
    marginBottom: 22,
    fontSize: 10,
    lineHeight: 15,
    color: j.texte.discret,
  },


  saveButton: {
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: j.primaire.fonce,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    shadowColor: j.primaire.fonce,
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
    backgroundColor: j.primaire.base,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  saveTextBlock: {
    flex: 1,
  },

  saveText: {
    color: j.primaire.contraste,
    fontSize: 14,
    fontWeight: '800',
  },

  saveSubtext: {
    marginTop: 2,
    color: j.primaire.clair,
    fontSize: 10,
    fontWeight: '500',
  },

  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: j.alerte.fond,
    borderWidth: 1,
    borderColor: j.alerte.fond,
    borderRadius: 16,
    padding: 14,
  },

  readOnlyIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: j.alerte.fond,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  readOnlyContent: {
    flex: 1,
  },

  readOnlyTitle: {
    color: j.alerte.texte,
    fontSize: 12,
    fontWeight: '800',
  },

  readOnlyText: {
    marginTop: 3,
    color: j.alerte.texte,
    fontSize: 10,
    lineHeight: 15,
  },

  bottomHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: j.texte.discret,
  },
}
);
}

export type StylesEditionObservation = ReturnType<typeof creerStylesEditionObservation>;

/** Hook : styles d'édition d'observation sur le thème actif. */
export function useStylesEditionObservation(): StylesEditionObservation {
  const { jetons } = useTheme();
  return useMemo(() => creerStylesEditionObservation(jetons), [jetons]);
}
