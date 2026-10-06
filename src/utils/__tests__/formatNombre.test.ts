/** Formatage des nombres et des montants (ariary). */
import { formatMontant, formatNombre, formatNombreDecimal } from '@/utils/formatNombre';

/** Les séparateurs de milliers varient (espace fine, insécable…) selon le moteur. */
const espaces = (valeur: string): string => valeur.replace(/[\s\u202F\u00A0]/g, ' ');

describe('formatNombre', () => {
  it('regroupe les milliers', () => {
    expect(espaces(formatNombre(1234567))).toBe('1 234 567');
    expect(espaces(formatNombre('15000'))).toBe('15 000');
  });

  it('tolère les valeurs absentes ou invalides', () => {
    expect(formatNombre(null)).toBe('0');
    expect(formatNombre(undefined)).toBe('0');
    expect(formatNombre('abc')).toBe('0');
  });
});

describe('formatNombreDecimal', () => {
  it('utilise la virgule décimale française', () => {
    expect(espaces(formatNombreDecimal(1234.56, 1))).toBe('1 234,6');
  });
});

describe('formatMontant', () => {
  it('suffixe le montant par l’unité monétaire', () => {
    expect(espaces(formatMontant(15000))).toBe('15 000 Ar');
  });
});
