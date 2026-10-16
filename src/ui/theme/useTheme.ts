import { useThemeContexte } from '@/theme/ThemeProvider';

import { themePourMode, type Theme } from './theme';

/**
 * Thème V2 du mode affiché. La préférence (clair, sombre ou système) reste
 * celle du `ThemeProvider` existant : un seul réglage pour V1 et V2.
 */
export function useTheme(): Theme {
  const { mode } = useThemeContexte();
  return themePourMode(mode);
}
