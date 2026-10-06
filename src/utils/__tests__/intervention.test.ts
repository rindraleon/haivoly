/**
 * Vocabulaire du domaine « intervention » : les sélecteurs n'affichent que des
 * libellés, l'API ne reçoit que des valeurs techniques.
 */
import {
  PRODUITS_INTERVENTION,
  TYPES_INTERVENTION,
  UNITES_INTERVENTION,
  libelleOption,
  statutInterventionPrevu,
} from '@/utils/intervention';

describe('listes de sélection', () => {
  const listes = { TYPES_INTERVENTION, UNITES_INTERVENTION, PRODUITS_INTERVENTION };

  it.each(Object.entries(listes))('%s est non vide et sans doublon', (_nom, options) => {
    expect(options.length).toBeGreaterThan(0);
    expect(new Set(options.map((option) => option.value)).size).toBe(options.length);
  });

  it('affiche un libellé lisible, jamais la valeur technique seule', () => {
    expect(TYPES_INTERVENTION.every((option) => option.label !== option.value)).toBe(true);
  });
});

describe('libelleOption', () => {
  it('traduit une valeur connue', () => {
    expect(libelleOption(TYPES_INTERVENTION, 'IRRIGATION')).toBe('Irrigation');
  });

  it('conserve une valeur inconnue (donnée historique) et marque l’absence', () => {
    expect(libelleOption(TYPES_INTERVENTION, 'GREFFAGE')).toBe('GREFFAGE');
    expect(libelleOption(TYPES_INTERVENTION, null)).toBe('—');
  });
});

describe('statutInterventionPrevu (aperçu local, le serveur fait foi)', () => {
  it('date passée → EN_COURS, date future → PLANIFIEE', () => {
    expect(statutInterventionPrevu('2020-01-01')).toBe('EN_COURS');
    expect(statutInterventionPrevu('2099-01-01')).toBe('PLANIFIEE');
  });

  it('date du jour → EN_COURS (la règle serveur est « ≤ maintenant »)', () => {
    const jour = new Date();
    const aujourdHui = `${jour.getFullYear()}-${`${jour.getMonth() + 1}`.padStart(2, '0')}-${`${jour.getDate()}`.padStart(2, '0')}`;
    expect(statutInterventionPrevu(aujourdHui)).toBe('EN_COURS');
  });

  it('valeur absente ou instant ISO → aucun aperçu (le champ n’est pas une date)', () => {
    expect(statutInterventionPrevu('')).toBeNull();
    expect(statutInterventionPrevu('2026-05-18T00:00:00.000Z')).toBeNull();
  });
});
