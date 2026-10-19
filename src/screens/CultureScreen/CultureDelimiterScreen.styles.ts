import { useMemo } from 'react';
import { StyleSheet } from 'react-native';

import { radius } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

/**
 * Styles de l'écran de délimitation de culture, dérivés des jetons du thème
 * actif : couleurs, rayons et espacements alignés sur le reste de
 * l'application (parcelles, interventions, observations).
 */
export function creerStylesDelimitation(j: Jetons) {
  return StyleSheet.create({
    // ── États plein écran (chargement / erreur) ─────────────────────
    container: { flex: 1, backgroundColor: j.fond.app },
    content: { padding: 16, paddingBottom: 40, gap: 14 },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
      gap: 14,
      backgroundColor: j.fond.app,
    },
    loadingTexte: { fontSize: 14.5, color: j.texte.secondaire, textAlign: 'center' },
    errorText: {
      fontSize: 18,
      fontWeight: '800',
      textAlign: 'center',
      color: j.erreur.base,
    },
    errorDescription: {
      fontSize: 14,
      color: j.texte.secondaire,
      textAlign: 'center',
      lineHeight: 21,
    },

    // ── En-tête ─────────────────────────────────────────────────────
    enteteCarte: {
      backgroundColor: j.fond.carte,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
      padding: 16,
      gap: 10,
    },
    enteteLigne: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    enteteIcone: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: j.primaire.clair,
      alignItems: 'center',
      justifyContent: 'center',
    },
    enteteTextes: { flex: 1, minWidth: 0 },
    enteteSurLigne: {
      fontSize: 10.5,
      fontWeight: '800',
      letterSpacing: 0.9,
      textTransform: 'uppercase',
      color: j.primaire.base,
    },
    enteteTitre: {
      marginTop: 2,
      fontSize: 20,
      fontWeight: '800',
      letterSpacing: -0.3,
      color: j.texte.principal,
    },
    enteteNom: {
      fontSize: 13.5,
      fontWeight: '600',
      color: j.texte.secondaire,
    },
    enteteInfo: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: j.info.fond,
      borderRadius: radius.md,
      paddingHorizontal: 11,
      paddingVertical: 10,
    },
    enteteInfoTexte: { flex: 1, fontSize: 12.5, lineHeight: 18, color: j.info.texte },

    // ── Étapes ──────────────────────────────────────────────────────
    etapesCarte: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: j.fond.carte,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
      paddingHorizontal: 12,
      paddingVertical: 12,
    },
    etape: { flex: 1, alignItems: 'center', gap: 5 },
    etapePastille: {
      width: 27,
      height: 27,
      borderRadius: 999,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: j.fond.attenue,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
    },
    etapePastilleActive: { backgroundColor: j.primaire.clair, borderColor: j.primaire.base },
    etapePastilleFaite: { backgroundColor: j.primaire.base, borderColor: j.primaire.base },
    etapePastilleTexte: { fontSize: 12, fontWeight: '800', color: j.texte.secondaire },
    etapePastilleTexteActive: { color: j.primaire.fonce },
    etapePastilleTexteFaite: { color: j.primaire.contraste },
    etapeLibelle: {
      fontSize: 10.5,
      fontWeight: '600',
      color: j.texte.discret,
      textAlign: 'center',
      lineHeight: 14,
    },
    etapeLibelleActive: { color: j.primaire.fonce },
    etapeSeparateur: { width: 14, height: 1, backgroundColor: j.bordure.defaut, marginTop: -16 },

    // ── Légende ─────────────────────────────────────────────────────
    carte: {
      backgroundColor: j.fond.carte,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
      padding: 14,
      gap: 10,
    },
    carteTitre: { fontSize: 14, fontWeight: '800', color: j.texte.principal },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    legendParcelle: {
      width: 18,
      height: 18,
      borderRadius: 5,
      borderWidth: 3,
      borderColor: '#2E7D32',
      backgroundColor: 'transparent',
    },
    legendCultureExistante: {
      width: 18,
      height: 18,
      borderRadius: 5,
      backgroundColor: 'rgba(245, 124, 0, 0.55)',
      borderWidth: 1.5,
      borderColor: '#F57C00',
    },
    legendCulture: {
      width: 18,
      height: 18,
      borderRadius: 5,
      backgroundColor: 'rgba(21, 101, 192, 0.45)',
      borderWidth: 1.5,
      borderColor: '#1565C0',
    },
    legendText: { fontSize: 13, fontWeight: '600', color: j.texte.principal },
    legendAide: { fontSize: 11.5, color: j.texte.secondaire, lineHeight: 17 },

    // ── Cultures existantes ─────────────────────────────────────────
    existingCulture: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingVertical: 8,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: j.bordure.defaut,
    },
    existingNom: { flex: 1, fontSize: 13.5, fontWeight: '600', color: j.texte.principal },
    existingPoints: { fontSize: 12, color: j.texte.secondaire },
    noCultureText: { fontSize: 12.5, color: j.texte.secondaire, lineHeight: 18 },

    // ── Compteur + superficie ───────────────────────────────────────
    jumeles: { flexDirection: 'row', gap: 12 },
    compteCarte: {
      flex: 1,
      backgroundColor: j.fond.carte,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
      padding: 13,
      alignItems: 'center',
      gap: 3,
    },
    compteLabel: { fontSize: 11, fontWeight: '700', color: j.texte.secondaire },
    compteValeur: { fontSize: 24, fontWeight: '900', color: j.primaire.fonce },
    compteAide: { fontSize: 11, color: j.texte.discret, textAlign: 'center' },
    superficieValeur: { fontSize: 17, fontWeight: '800', color: j.texte.principal },
    superficieHectare: { fontSize: 11.5, color: j.texte.secondaire },

    // ── Bascule manuel / GPS ────────────────────────────────────────
    modeContainer: {
      flexDirection: 'row',
      gap: 4,
      backgroundColor: j.fond.attenue,
      borderRadius: radius.md,
      padding: 4,
    },
    modeButton: {
      flex: 1,
      minHeight: 44,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 7,
      borderRadius: radius.md - 4,
    },
    modeButtonActive: { backgroundColor: j.fond.carte, elevation: 1 },
    modeText: { fontSize: 13.5, fontWeight: '700', color: j.texte.secondaire },
    modeTextActive: { color: j.primaire.fonce },

    // ── Carte / WebView ─────────────────────────────────────────────
    map: {
      height: 380,
      borderRadius: radius.lg,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: j.bordure.defaut,
      backgroundColor: j.fond.attenue,
    },

    // ── Points placés ───────────────────────────────────────────────
    pointsEntete: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    pointsListe: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    pointPuce: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: j.primaire.clair,
      borderRadius: 999,
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderWidth: 1,
      borderColor: j.bordure.defaut,
    },
    pointPuceNumero: { fontSize: 12, fontWeight: '800', color: j.primaire.fonce },
    pointPuceCoord: { fontSize: 11, fontWeight: '600', color: j.texte.secondaire },

    // ── Actions ─────────────────────────────────────────────────────
    alerteInvalide: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 9,
      backgroundColor: j.alerte.fond,
      borderRadius: radius.md,
      paddingHorizontal: 12,
      paddingVertical: 11,
    },
    alerteInvalideTexte: { flex: 1, fontSize: 12.5, lineHeight: 18, color: j.alerte.texte },

    // ── Erreurs plein écran / annulation ────────────────────────────
    cancelButton: {
      minHeight: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: radius.md,
      backgroundColor: j.fond.attenue,
      paddingHorizontal: 16,
    },
    cancelText: { fontSize: 15, fontWeight: '700', color: j.texte.principal },
  });
}

export type StylesDelimitation = ReturnType<typeof creerStylesDelimitation>;

/** Hook : styles de délimitation sur le thème actif. */
export function useStylesDelimitation(): StylesDelimitation {
  const { jetons } = useTheme();
  return useMemo(() => creerStylesDelimitation(jetons), [jetons]);
}
