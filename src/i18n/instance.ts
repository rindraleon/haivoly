import instanceI18next from 'i18next';

import fr from './locales/fr';
import en from './locales/en';
import mg from './locales/mg';

/** Instance partagee, re-exportee sous le nom `i18n`. */
export const i18n = instanceI18next;


/** Langues proposées. `fr` est la langue par défaut du produit. */
export const LANGUES_DISPONIBLES = ['fr', 'en', 'mg'] as const;
export type Langue = (typeof LANGUES_DISPONIBLES)[number];

export const LANGUE_PAR_DEFAUT: Langue = 'fr';

export type ChoixLangue = Langue | 'system';
export const CHOIX_SYSTEME = 'system' as const;

/** Normalise une balise (`fr-FR`, `en-US`, `mg`) en langue supportée. */
export function resoudreLangue(balise: string | null | undefined): Langue {
  if (!balise) return LANGUE_PAR_DEFAUT;
  const code = balise.toLowerCase().split('-')[0];
  return (LANGUES_DISPONIBLES as readonly string[]).includes(code)
    ? (code as Langue)
    : LANGUE_PAR_DEFAUT;
}

const RESSOURCES = {
  fr: { translation: fr },
  en: { translation: en },
  mg: { translation: mg },
} as const;

let instancePrete = false;

export async function initialiserInstance(langue?: Langue): Promise<void> {
  if (instancePrete) return;

  await i18n.init({
    resources: RESSOURCES,
    lng: langue ?? LANGUE_PAR_DEFAUT,
    fallbackLng: LANGUE_PAR_DEFAUT,
    interpolation: { escapeValue: false },
    returnNull: false,
  });
  instancePrete = true;
}

/** Vrai si l'instance a été initialisée (utilisé pour les replis sûrs). */
export function instancePreteOuNon(): boolean {
  return i18n.isInitialized;
}

// `i18n` est deja exporte comme constante en haut de fichier ; on ne garde
// qu'un export par defaut pour les imports historiques.
export default i18n;


export function baliseDeFormatage(): string {
  const langue = resoudreLangue(i18n.language);
  if (langue === 'mg') return 'fr-MG';
  return langue === 'en' ? 'en-US' : 'fr-FR';
}
