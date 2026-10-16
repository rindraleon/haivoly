/**
 * Contraste WCAG 2.x entre deux couleurs hexadécimales `#RRGGBB`.
 * Utilisé par les tests du design system pour verrouiller l'accessibilité.
 */
function luminance(hex: string): number {
  const valeur = hex.replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(valeur)) {
    throw new Error(`Couleur hexadécimale attendue (#RRGGBB) : ${hex}`);
  }
  const canaux = [0, 2, 4].map((i) => parseInt(valeur.slice(i, i + 2), 16) / 255);
  const lineaire = canaux.map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );
  return 0.2126 * lineaire[0] + 0.7152 * lineaire[1] + 0.0722 * lineaire[2];
}

export function contraste(premier: string, second: string): number {
  const a = luminance(premier);
  const b = luminance(second);
  const [clair, fonce] = a > b ? [a, b] : [b, a];
  return (clair + 0.05) / (fonce + 0.05);
}

/** Seuils WCAG AA. */
export const SEUILS = {
  texte: 4.5,
  grandTexte: 3,
  elementGraphique: 3,
} as const;
