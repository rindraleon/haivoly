import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { radius } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';


export function creerStylesEditionIntervention(j: Jetons) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: j.fond.app },
    content: { padding: 20, paddingBottom: 40 },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: j.fond.app,
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      color: j.primaire.fonce,
      marginBottom: 20,
      textAlign: 'center',
    },
    contextCard: {
      backgroundColor: j.primaire.clair,
      borderRadius: radius.md,
      padding: 16,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
    },
    contextLabel: {
      fontSize: 13,
      color: j.primaire.fonce,
      fontWeight: '600',
      marginBottom: 3,
    },
    cultureLabel: { marginTop: 12 },
    contextValue: { fontSize: 16, color: j.texte.principal, fontWeight: '600' },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: j.texte.principal,
      marginBottom: 7,
      marginTop: 12,
    },
    input: {
      backgroundColor: j.fond.carte,
      borderWidth: 1,
      borderColor: j.bordure.appuyee,
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: j.texte.principal,
    },
    textarea: { minHeight: 110, paddingTop: 12 },
    saveButton: {
      minHeight: 52,
      borderRadius: radius.md,
      backgroundColor: j.primaire.base,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 28,
      paddingHorizontal: 15,
    },
    disabledButton: { opacity: 0.6 },
    saveButtonText: {
      color: j.primaire.contraste,
      fontSize: 16,
      fontWeight: '700',
      textAlign: 'center',
    },
    cancelButton: {
      minHeight: 50,
      borderRadius: radius.md,
      backgroundColor: j.fond.attenue,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 12,
    },
    cancelButtonText: { color: j.texte.principal, fontSize: 16, fontWeight: '600' },
    loadingText: { marginTop: 12, color: j.texte.secondaire, fontSize: 15 },
    errorTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: j.erreur.base,
      marginBottom: 8,
    },
    errorText: {
      color: j.texte.secondaire,
      textAlign: 'center',
      marginBottom: 20,
      lineHeight: 22,
    },
    backButton: {
      backgroundColor: j.primaire.base,
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: radius.md,
    },
    backButtonText: { color: j.primaire.contraste, fontWeight: '700', fontSize: 16 },
    photosSection: {
      marginTop: 20,
      backgroundColor: j.fond.carte,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
      padding: 14,
    },
  });
}

export type StylesEditionIntervention = ReturnType<typeof creerStylesEditionIntervention>;

/** Hook : styles de l'édition d'intervention sur le thème actif. */
export function useStylesEditionIntervention(): StylesEditionIntervention {
  const { jetons } = useTheme();
  return useMemo(() => creerStylesEditionIntervention(jetons), [jetons]);
}
