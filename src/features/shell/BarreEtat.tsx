import { StatusBar } from 'expo-status-bar';

import { useThemeContexte } from '@/theme/ThemeProvider';

/**
 * Barre d'état alignée sur le thème **choisi** (et non sur le seul réglage
 * système) : icônes claires sur fond sombre, et inversement.
 */
export function BarreEtat() {
  const { mode } = useThemeContexte();
  return <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />;
}
