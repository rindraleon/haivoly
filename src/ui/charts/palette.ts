import type { ModeTheme } from '../theme';

/** Séries de graphique dérivées de la palette de marque (6 catégories max). */
const SERIES_CLAIR = ['#1B5E20', '#43A047', '#66BB6A', '#29B6F6', '#FB8C00', '#8D9C93'];
const SERIES_SOMBRE = ['#7BD389', '#5CC566', '#A5E3AE', '#4FC3F7', '#FFB74D', '#7F9087'];

export function couleursGraphique(mode: ModeTheme): readonly string[] {
  return mode === 'dark' ? SERIES_SOMBRE : SERIES_CLAIR;
}
