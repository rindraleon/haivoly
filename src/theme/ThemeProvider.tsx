import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useColorScheme } from 'react-native';

import type { Jetons, ModeTheme } from './jetons';
import {
  CHOIX_THEME_DEFAUT,
  ecrireChoixTheme,
  jetonsPourMode,
  lireChoixTheme,
  resoudreMode,
  type ChoixTheme,
} from './preference';


interface ValeurTheme {
  /** Jetons de couleur du mode actif. */
  jetons: Jetons;
  /** Mode réellement affiché : `light` ou `dark`. */
  mode: ModeTheme;
  /** Choix utilisateur : `light`, `dark` ou `system`. */
  choix: ChoixTheme;
  /** `true` tant que la préférence persistée n'a pas été lue. */
  chargement: boolean;
  definirTheme: (choix: ChoixTheme) => void;
}

const ContexteTheme = createContext<ValeurTheme | null>(null);

/** Préférence lue au démarrage, hors React, pour éviter tout flash. */
let choixInitial: ChoixTheme = CHOIX_THEME_DEFAUT;

export async function initialiserTheme(): Promise<ChoixTheme> {
  choixInitial = await lireChoixTheme();
  return choixInitial;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const schemeSysteme = useColorScheme();
  const modeSysteme: ModeTheme = schemeSysteme === 'dark' ? 'dark' : 'light';

  const [choix, setChoix] = useState<ChoixTheme>(choixInitial);
  const [chargement, setChargement] = useState(true);

  useEffect(() => {
    let actif = true;
    lireChoixTheme().then((lu) => {
      if (!actif) return;
      choixInitial = lu;
      setChoix(lu);
      setChargement(false);
    });
    return () => {
      actif = false;
    };
  }, []);

  const definirTheme = useCallback((nouveau: ChoixTheme) => {
    choixInitial = nouveau;
    setChoix(nouveau);
    void ecrireChoixTheme(nouveau);
  }, []);

  const valeur = useMemo<ValeurTheme>(() => {
    const mode = resoudreMode(choix, modeSysteme);
    return { jetons: jetonsPourMode(mode), mode, choix, chargement, definirTheme };
  }, [choix, modeSysteme, chargement, definirTheme]);

  return <ContexteTheme.Provider value={valeur}>{children}</ContexteTheme.Provider>;
}

export function useThemeContexte(): ValeurTheme {
  const ctx = useContext(ContexteTheme);
  if (!ctx) {
    throw new Error('useThemeContexte doit être utilisé dans un ThemeProvider');
  }
  return ctx;
}
