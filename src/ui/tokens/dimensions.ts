/** Grille de 4 px. */
export const ESPACE = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  x3: 32,
  x4: 40,
  x5: 48,
} as const;

/** Rayons : cartes 16–20, champs 14, puces en pilule. */
export const RAYON = {
  xs: 6,
  sm: 10,
  md: 14,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
} as const;

export const DIMENSIONS = {
  /** Cible tactile minimale recommandée (48 dp Android, 44 pt iOS). */
  cible: 48,
  cibleMin: 44,
  /** Hauteur d'un champ de saisie. */
  champ: 52,
  boutonLg: 52,
  boutonMd: 48,
  boutonSm: 40,
  icone: 20,
  iconeLg: 24,
  /** Marge horizontale des écrans (gabarit 375 px). */
  margeEcran: 20,
  barreOnglets: 64,
  /** Marge minimale entre un champ actif et le haut du clavier. */
  margeClavier: 16,
} as const;

export type CleEspace = keyof typeof ESPACE;
export type CleRayon = keyof typeof RAYON;
