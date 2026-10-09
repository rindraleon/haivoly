import {
  dateOnlyToUtcDate,
  dateOnlyVersDateLocale,
  dateOnlyVersIso,
  daysBetween,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  isDateOnly,
  progressionEntre,
  toDateOnly,
  todayDateOnly,
} from '@/utils/date';

describe('isDateOnly', () => {
  it('accepte une date calendaire stricte', () => {
    expect(isDateOnly('2026-05-18')).toBe(true);
  });

  it('refuse un instant ISO, un format français et une date non normalisée', () => {
    expect(isDateOnly('2026-05-18T00:00:00.000Z')).toBe(false);
    expect(isDateOnly('18/05/2026')).toBe(false);
    expect(isDateOnly('2026-5-8')).toBe(false);
    expect(isDateOnly(null)).toBe(false);
  });
});

describe('toDateOnly', () => {
  it('ne décale jamais d’un jour dans un fuseau positif (UTC+3)', () => {
    // 18 mai 2026 à 00:00 **local** : l'ancien `toISOString().slice(0, 10)`
    // renvoyait « 2026-05-17 » à Antananarivo.
    expect(toDateOnly(new Date(2026, 4, 18, 0, 0, 0))).toBe('2026-05-18');
    expect(toDateOnly(new Date(2026, 4, 18, 23, 59, 0))).toBe('2026-05-18');
  });

  it('laisse passer une date calendaire déjà au bon format', () => {
    expect(toDateOnly('2026-05-18')).toBe('2026-05-18');
  });

  it('renvoie null pour une valeur vide ou invalide', () => {
    expect(toDateOnly('')).toBeNull();
    expect(toDateOnly(null)).toBeNull();
    expect(toDateOnly('18/05/2026')).toBeNull();
  });
});

describe('conversions vers le sélecteur et vers l’API', () => {
  it('dateOnlyVersDateLocale donne minuit local (aller-retour stable)', () => {
    const date = dateOnlyVersDateLocale('2026-05-18');
    expect(date).not.toBeNull();
    expect(toDateOnly(date)).toBe('2026-05-18');
    expect(dateOnlyVersDateLocale('18/05/2026')).toBeNull();
  });

  it('dateOnlyVersIso n’accepte qu’une date calendaire', () => {
    expect(dateOnlyVersIso('2026-05-18')).toBe('2026-05-18T00:00:00.000Z');
    expect(dateOnlyVersIso('2026-05-18T00:00:00.000Z')).toBeNull();
    expect(dateOnlyVersIso(null)).toBeNull();
  });

  it('dateOnlyToUtcDate lit la date en UTC', () => {
    expect(dateOnlyToUtcDate('2026-05-18').toISOString()).toBe('2026-05-18T00:00:00.000Z');
  });
});

describe('affichage', () => {
  it('formate en français, sans dépendre de la locale du téléphone', () => {
    expect(formatDate('2026-05-18')).toBe('18/05/2026');
    expect(formatDateShort('2026-05-18')).toBe('18/05');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('pas une date')).toBe('—');
  });

  it('affiche un horodatage dans le fuseau local', () => {
    const instant = new Date(2026, 4, 18, 14, 30, 0);
    expect(formatDateTime(instant)).toBe('18/05/2026 14:30');
    expect(formatTime(instant)).toBe('14:30');
    expect(formatTime(null)).toBe('—');
  });
});

describe('calculs de cycle de vie', () => {
  it('daysBetween compte les jours écoulés dans les deux sens', () => {
    expect(daysBetween('2026-05-18', '2026-05-20')).toBe(2);
    expect(daysBetween('2026-05-20', '2026-05-18')).toBe(-2);
    expect(daysBetween('2026-05-18', '2026-05-18')).toBe(0);
  });

  it('progressionEntre borne la progression entre 0 et 1', () => {
    const reference = new Date('2026-01-06T00:00:00.000Z');
    expect(progressionEntre('2026-01-01', '2026-01-11', reference)).toBeCloseTo(0.5);
    expect(progressionEntre('2026-01-01', '2026-01-11', new Date('2020-01-01T00:00:00.000Z'))).toBe(0);
    expect(progressionEntre('2026-01-01', '2026-01-11', new Date('2030-01-01T00:00:00.000Z'))).toBe(1);
    expect(progressionEntre(null, '2026-01-11')).toBeNull();
    expect(progressionEntre('2026-01-11', '2026-01-01')).toBeNull();
  });

  it('todayDateOnly respecte le format attendu par l’API', () => {
    expect(todayDateOnly()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const jour = new Date();
    expect(todayDateOnly()).toBe(toDateOnly(jour));
  });
});
