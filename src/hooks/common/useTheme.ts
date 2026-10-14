import { useThemeContexte } from '@/theme/ThemeProvider';

export function useTheme() {
  const { jetons, mode, choix, chargement, definirTheme } = useThemeContexte();
  return { jetons, mode, choix, chargement, definirTheme };
}
