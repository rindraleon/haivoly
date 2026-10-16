import { StyleSheet } from 'react-native';

import type { Theme } from './theme';
import { useTheme } from './useTheme';

type StylesNommes<T> = StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<unknown>;

/**
 * Fabrique de styles dépendants du thème. Les feuilles sont créées une seule
 * fois par thème (clair, sombre) puis réutilisées : aucun recalcul au rendu.
 *
 * const useStyles = makeStyles((t) => ({ carte: { backgroundColor: t.couleurs.surface } }));
 */
export function makeStyles<T extends StylesNommes<T>>(fabrique: (theme: Theme) => T) {
  const cache = new WeakMap<Theme, T>();

  return function useStyles(): T {
    const theme = useTheme();
    let styles = cache.get(theme);
    if (!styles) {
      styles = StyleSheet.create(fabrique(theme)) as T;
      cache.set(theme, styles);
    }
    return styles;
  };
}
