/**
 * Ombres douces. `boxShadow` (chaîne CSS) est pris en charge par React Native
 * sous la nouvelle architecture, sur iOS, Android et le web.
 * En mode sombre, l'ombre se voit peu : la bordure fine porte la séparation.
 */
export interface Ombres {
  carte: string;
  elevee: string;
  barre: string;
  focus: string;
}

export const OMBRES_CLAIR: Ombres = {
  carte: '0px 1px 2px rgba(16, 36, 26, 0.05), 0px 6px 16px rgba(16, 36, 26, 0.06)',
  elevee: '0px 10px 28px rgba(16, 36, 26, 0.12)',
  barre: '0px -6px 20px rgba(16, 36, 26, 0.06)',
  focus: '0px 0px 0px 3px rgba(27, 94, 32, 0.18)',
};

export const OMBRES_SOMBRE: Ombres = {
  carte: '0px 1px 2px rgba(0, 0, 0, 0.32)',
  elevee: '0px 10px 28px rgba(0, 0, 0, 0.45)',
  barre: '0px -6px 20px rgba(0, 0, 0, 0.35)',
  focus: '0px 0px 0px 3px rgba(123, 211, 137, 0.28)',
};

/** Durées d'animation (ms) : courtes, pour un usage terrain. */
export const MOUVEMENT = {
  rapide: 120,
  base: 200,
  lente: 320,
  /** Échelle d'un élément pressé. */
  echellePresse: 0.98,
} as const;
