import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  i18n,
  CHOIX_SYSTEME,
  LANGUES_DISPONIBLES,
  LANGUE_PAR_DEFAUT,
  initialiserInstance,
  resoudreLangue,
  type ChoixLangue,
  type Langue,
} from './instance';


/** Clé de persistance. AsyncStorage — le SecureStore est réservé au jeton. */
const CLE_LANGUE = 'haivoly:langue';

export function langueDeLAppareil(): Langue {
  try {
    return resoudreLangue(Localization.getLocales()[0]?.languageCode);
  } catch {
    // En environnement de test ou hors périphérique : on retombe sur `fr`.
    return LANGUE_PAR_DEFAUT;
  }
}

let reactAttache = false;

export async function initialiserI18n(): Promise<void> {
  if (!reactAttache) {
    i18n.use(initReactI18next);
    reactAttache = true;
  }

  const choix = await lireChoixLangue();
  await initialiserInstance(choix === CHOIX_SYSTEME ? langueDeLAppareil() : choix);
  await appliquerLangueEnregistree();
}

/** Applique le choix persisté, ou la langue de l'appareil à défaut. */
export async function appliquerLangueEnregistree(): Promise<ChoixLangue> {
  const choix = await lireChoixLangue();
  const cible = choix === CHOIX_SYSTEME ? langueDeLAppareil() : choix;

  if (i18n.isInitialized && i18n.language !== cible) {
    await i18n.changeLanguage(cible);
  }
  return choix;
}

export async function lireChoixLangue(): Promise<ChoixLangue> {
  try {
    const brut = await AsyncStorage.getItem(CLE_LANGUE);
    if (!brut) return CHOIX_SYSTEME;
    return (LANGUES_DISPONIBLES as readonly string[]).includes(brut)
      ? (brut as Langue)
      : CHOIX_SYSTEME;
  } catch {
    return CHOIX_SYSTEME;
  }
}

/** Enregistre un choix explicite et l'applique immédiatement. */
export async function definirLangue(choix: ChoixLangue): Promise<void> {
  try {
    await AsyncStorage.setItem(CLE_LANGUE, choix);
  } catch {
    // Un échec d'écriture ne doit pas empêcher le changement de langue.
  }
  const cible = choix === CHOIX_SYSTEME ? langueDeLAppareil() : choix;
  await i18n.changeLanguage(cible);
}

/** Langue actuellement affichée. */
export function langueActive(): Langue {
  return resoudreLangue(i18n.language);
}

// Délegué à instance.ts pour que les utils purs puissent l'importer.
export { baliseDeFormatage } from './instance';

export {
  CHOIX_SYSTEME,
  LANGUES_DISPONIBLES,
  LANGUE_PAR_DEFAUT,
  i18n,
  resoudreLangue,
  type ChoixLangue,
  type Langue,
};
export default i18n;
