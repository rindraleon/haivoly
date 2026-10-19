import { StyleSheet } from 'react-native';

import type { Jetons } from '@/theme/jetons';

/** Styles de l'écran de création d'intervention, sur les jetons du thème actif. */
export function creerStylesCreationIntervention(j: Jetons) {
  return StyleSheet.create({
    flex: { flex: 1 },
    section: { gap: 14 },
    rowFields: { flexDirection: 'row', gap: 12 },
    previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    previewText: { fontSize: 12.5, color: j.texte.secondaire },
    warning: { fontSize: 12.5, color: j.alerte.texte, lineHeight: 19 },
  });
}
