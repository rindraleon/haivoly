import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  JETONS_PAR_MODE,
  type Jetons,
  type ModeTheme,
} from './jetons';


export const CHOIX_THEME = ['light', 'dark', 'system'] as const;
export type ChoixTheme = (typeof CHOIX_THEME)[number];

export const CHOIX_THEME_DEFAUT: ChoixTheme = 'system';

const CLE_THEME = 'haivoly:theme';

/** Mode par défaut quand rien n'est encore connu : clair. */
export const MODE_PAR_DEFAUT: ModeTheme = 'light';

export function resoudreMode(
  choix: ChoixTheme,
  modeSysteme: ModeTheme | null | undefined,
): ModeTheme {
  if (choix === 'system') return modeSysteme ?? MODE_PAR_DEFAUT;
  return choix;
}

/** Lit la préférence persistée. `system` si absente ou illisible. */
export async function lireChoixTheme(): Promise<ChoixTheme> {
  try {
    const brut = await AsyncStorage.getItem(CLE_THEME);
    if (!brut) return CHOIX_THEME_DEFAUT;
    return (CHOIX_THEME as readonly string[]).includes(brut)
      ? (brut as ChoixTheme)
      : CHOIX_THEME_DEFAUT;
  } catch {
    return CHOIX_THEME_DEFAUT;
  }
}

export async function ecrireChoixTheme(choix: ChoixTheme): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_THEME, choix);
  } catch {
    // Un échec d'écriture ne doit pas empêcher le changement de thème.
  }
}

export function jetonsPourMode(mode: ModeTheme): Jetons {
  return JETONS_PAR_MODE[mode];
}
