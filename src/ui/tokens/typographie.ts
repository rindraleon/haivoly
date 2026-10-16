import type { TextStyle } from 'react-native';

/**
 * Typographie V2 : Inter, une famille par graisse.
 *
 * Avec le SDK 57, les polices variables ne sont pas prises en charge sur
 * Android et iOS : chaque graisse est donc un fichier statique chargé par
 * `useFonts` (compatible Expo Go) et référencé par son nom de famille.
 */
export const POLICES = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export type GraissePolice = keyof typeof POLICES;

const POIDS_DE_SECOURS: Record<GraissePolice, TextStyle['fontWeight']> = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

/**
 * Renseigné au démarrage par `PreferencesBootstrap`. Si Inter n'a pas pu être
 * chargée, on retombe sur la police système avec la graisse équivalente plutôt
 * que d'afficher tout le texte en graisse normale.
 */
let policesChargees = false;

export function definirPolicesChargees(valeur: boolean): void {
  if (policesChargees === valeur) return;
  policesChargees = valeur;
  cache.clear();
}

export function policesSontChargees(): boolean {
  return policesChargees;
}

export function stylePolice(graisse: GraissePolice): TextStyle {
  return policesChargees
    ? { fontFamily: POLICES[graisse] }
    : { fontWeight: POIDS_DE_SECOURS[graisse] };
}

interface Niveau {
  taille: number;
  interligne: number;
  graisse: GraissePolice;
  espacement: number;
  tabulaire?: boolean;
}

/**
 * Échelle typographique : display, h1, h2, h3, body, caption, label.
 * Corps 14–16 px, micro-texte 11–12 px, KPI en gras à chiffres tabulaires.
 */
export const ECHELLE = {
  display: { taille: 32, interligne: 40, graisse: 'bold', espacement: -0.6 },
  h1: { taille: 26, interligne: 32, graisse: 'bold', espacement: -0.4 },
  h2: { taille: 22, interligne: 28, graisse: 'semibold', espacement: -0.2 },
  h3: { taille: 18, interligne: 24, graisse: 'semibold', espacement: -0.1 },
  body: { taille: 16, interligne: 24, graisse: 'regular', espacement: 0 },
  bodyStrong: { taille: 16, interligne: 24, graisse: 'semibold', espacement: 0 },
  bodySmall: { taille: 14, interligne: 20, graisse: 'regular', espacement: 0 },
  label: { taille: 14, interligne: 20, graisse: 'semibold', espacement: 0 },
  caption: { taille: 12, interligne: 16, graisse: 'medium', espacement: 0.1 },
  micro: { taille: 11, interligne: 14, graisse: 'semibold', espacement: 0.3 },
  kpi: { taille: 28, interligne: 34, graisse: 'bold', espacement: -0.5, tabulaire: true },
  button: { taille: 16, interligne: 20, graisse: 'semibold', espacement: 0.1 },
} as const satisfies Record<string, Niveau>;

export type VarianteTexte = keyof typeof ECHELLE;

const cache = new Map<VarianteTexte, TextStyle>();

/** Style complet d'une variante (mis en cache, recalculé si la police change). */
export function styleTypo(variante: VarianteTexte): TextStyle {
  const existant = cache.get(variante);
  if (existant) return existant;

  const niveau: Niveau = ECHELLE[variante];
  const style: TextStyle = {
    ...stylePolice(niveau.graisse),
    fontSize: niveau.taille,
    lineHeight: niveau.interligne,
    letterSpacing: niveau.espacement,
    ...(niveau.tabulaire ? { fontVariant: ['tabular-nums'] } : null),
  };
  cache.set(variante, style);
  return style;
}
