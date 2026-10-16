import {
  COULEURS_CLAIR,
  COULEURS_SOMBRE,
  DIMENSIONS,
  ESPACE,
  MOUVEMENT,
  OMBRES_CLAIR,
  OMBRES_SOMBRE,
  RAYON,
  type Couleurs,
  type Ombres,
} from '../tokens';

export type ModeTheme = 'light' | 'dark';

export interface Theme {
  mode: ModeTheme;
  couleurs: Couleurs;
  ombres: Ombres;
  espace: typeof ESPACE;
  rayon: typeof RAYON;
  dimensions: typeof DIMENSIONS;
  mouvement: typeof MOUVEMENT;
}

export const THEME_CLAIR: Theme = {
  mode: 'light',
  couleurs: COULEURS_CLAIR,
  ombres: OMBRES_CLAIR,
  espace: ESPACE,
  rayon: RAYON,
  dimensions: DIMENSIONS,
  mouvement: MOUVEMENT,
};

export const THEME_SOMBRE: Theme = {
  mode: 'dark',
  couleurs: COULEURS_SOMBRE,
  ombres: OMBRES_SOMBRE,
  espace: ESPACE,
  rayon: RAYON,
  dimensions: DIMENSIONS,
  mouvement: MOUVEMENT,
};

export function themePourMode(mode: ModeTheme): Theme {
  return mode === 'dark' ? THEME_SOMBRE : THEME_CLAIR;
}
