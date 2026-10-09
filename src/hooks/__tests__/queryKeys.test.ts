import { queryKeys } from '@/hooks/queryKeys';

describe('queryKeys', () => {
  it('expose la clé du profil courant', () => {
    expect(queryKeys.me).toEqual(['auth', 'me']);
  });

  it('préfixe chaque famille par un nom stable', () => {
    expect(queryKeys.parcelles()[0]).toBe('parcelles');
    expect(queryKeys.parcelle('p1')).toEqual(['parcelle', 'p1']);
    expect(queryKeys.culture('c1')).toEqual(['culture', 'c1']);
    expect(queryKeys.interventions('c1')).toEqual(['interventions', 'c1']);
    expect(queryKeys.observations('c1')).toEqual(['observations', 'c1']);
    expect(queryKeys.recolte('c1')).toEqual(['recolte', 'c1']);
  });

  it('distingue les cultures d’une parcelle (tableau) de la liste paginée', () => {
    expect(queryKeys.culturesParcelle('p1')).toEqual(['cultures-parcelle', 'p1']);
    expect(queryKeys.culturesParcelle('p1')[0]).not.toBe(queryKeys.cultures()[0]);
  });

  it('inclut les identifiants parents dans les clés de photos', () => {
    expect(queryKeys.photosObservation('p1', 'c1', 'o1')).toEqual([
      'photos-observation',
      'p1',
      'c1',
      'o1',
    ]);
    expect(queryKeys.photosIntervention('p1', 'c1', 'i1')).toEqual([
      'photos-intervention',
      'p1',
      'c1',
      'i1',
    ]);
    expect(queryKeys.photosRecolte('r1')).toEqual(['photos-recolte', 'r1']);
  });
});
