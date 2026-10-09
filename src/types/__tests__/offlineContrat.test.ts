import { ACTION_TYPES, ENTITY_TYPES, estActionSynchronisable } from '@/types/offline.types';

describe('estActionSynchronisable', () => {
  it('accepte le couple attendu par l’API', () => {
    expect(estActionSynchronisable({ actionType: 'CREATE', entityType: 'OBSERVATION' })).toBe(true);
    expect(estActionSynchronisable({ actionType: 'UPDATE', entityType: 'CULTURE' })).toBe(true);
    expect(estActionSynchronisable({ actionType: 'DELETE', entityType: 'PARCELLE' })).toBe(true);
  });

  it('refuse l’ancien vocabulaire local', () => {
    expect(estActionSynchronisable({ actionType: 'CREATE_PARCELLE', entityType: 'PARCELLE' })).toBe(false);
    expect(estActionSynchronisable({ actionType: 'OTHER', entityType: 'UTILISATEUR' })).toBe(false);
    expect(estActionSynchronisable({ actionType: 'CREATE', entityType: 'POINT_GPS' })).toBe(true);
  });

  it('expose exactement le vocabulaire du serveur', () => {
    expect([...ACTION_TYPES]).toEqual(['CREATE', 'UPDATE', 'DELETE']);
    expect([...ENTITY_TYPES]).toEqual([
      'PARCELLE',
      'POINT_GPS',
      'CULTURE',
      'INTERVENTION',
      'OBSERVATION',
      'PHOTO',
      'RECOLTE',
    ]);
  });
});
