import { useThemeContexte } from '@/theme/ThemeProvider';

/**
 * Accès au thème actif.
 *
 * Retourne les jetons sémantiques du mode courant (`light` ou `dark`), plus le
 * mode et le choix utilisateur pour les écrans de réglages.
 *
 * L'ancienne version retournait `Colors[scheme]` — les 5 jetons de
 * `theme/system.ts` dont la palette sombre était une simple inversion du clair
 * (`background: '#000000'`). Elle n'avait par ailleurs aucun consommateur :
 * le thème n'était donc appliqué nulle part.
 */
export function useTheme() {
  const { jetons, mode, choix, chargement, definirTheme } = useThemeContexte();
  return { jetons, mode, choix, chargement, definirTheme };
}
