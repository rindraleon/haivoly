import { beforeEach, describe, expect, it } from '@jest/globals';

import { baliseDeFormatage, i18n } from '@/i18n/instance';
import { formatNombre, formatNombreDecimal, formatMontant } from '@/utils/formatNombre';

/**
 * Le formatage doit suivre la langue active.
 *
 * Ces tests existent parce que le branchement de `baliseDeFormatage()` ne se
 * voit pas à la compilation : un formatteur construit au chargement du module
 * avec `'fr-FR'` en dur compilait très bien et ignorait silencieusement tout
 * changement de langue. Seul un test qui change la langue le révèle.
 */
describe('formatNombre — localisation', () => {
  beforeEach(async () => {
    if (!i18n.isInitialized) {
      await i18n.init({
        lng: 'fr',
        fallbackLng: 'fr',
        resources: { fr: { translation: {} }, en: { translation: {} }, mg: { translation: {} } },
        interpolation: { escapeValue: false },
      });
    }
  });

  it('résout fr-MG pour le malgache, faute de données ICU propres', async () => {
    await i18n.changeLanguage('mg');
    expect(baliseDeFormatage()).toBe('fr-MG');
  });

  it('résout en-US pour l’anglais', async () => {
    await i18n.changeLanguage('en');
    expect(baliseDeFormatage()).toBe('en-US');
  });

  it('résout fr-FR pour le français', async () => {
    await i18n.changeLanguage('fr');
    expect(baliseDeFormatage()).toBe('fr-FR');
  });

  it('sépare les milliers différemment selon la langue', async () => {
    await i18n.changeLanguage('fr');
    const francais = formatNombre(1234567);

    await i18n.changeLanguage('en');
    const anglais = formatNombre(1234567);

    // fr utilise une espace fine insécable, en-US une virgule.
    expect(francais).not.toBe(anglais);
    expect(anglais).toBe('1,234,567');
    expect(francais.replace(/\u202F|\u00A0| /g, '')).toBe('1234567');
  });

  it('utilise la virgule décimale en français et le point en anglais', async () => {
    await i18n.changeLanguage('fr');
    expect(formatNombreDecimal(1234.5)).toBe('1\u202F234,5');

    await i18n.changeLanguage('en');
    expect(formatNombreDecimal(1234.5)).toBe('1,234.5');
  });

  it('conserve l’unité ariary quelle que soit la langue', async () => {
    await i18n.changeLanguage('en');
    expect(formatMontant(15000)).toBe('15,000 Ar');
  });

  it('ne casse pas sur une valeur absente ou invalide', async () => {
    await i18n.changeLanguage('fr');
    expect(formatNombre(null)).toBe('0');
    expect(formatNombre(undefined)).toBe('0');
    expect(formatNombre('abc')).toBe('0');
    expect(formatNombreDecimal(NaN)).toBe('0');
  });
});
