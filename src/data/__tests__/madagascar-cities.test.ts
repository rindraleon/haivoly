import {
  VILLES_MADAGASCAR,
  distanceEntre,
  villeLaPlusProche,
} from '../madagascar-cities';

describe('VILLES_MADAGASCAR', () => {
  it('contient Antananarivo comme ville de référence', () => {
    expect(VILLES_MADAGASCAR.some((ville) => ville.nom === 'Antananarivo')).toBe(true);
  });
});

describe('distanceEntre', () => {
  it('renvoie 0 pour deux positions identiques', () => {
    const position = { latitude: -18.8792, longitude: 47.5079 };

    expect(distanceEntre(position, position)).toBe(0);
  });

  it('renvoie une distance en mètres strictement positive', () => {
    const distance = distanceEntre(
      { latitude: -18.8792, longitude: 47.5079 },
      { latitude: -19.8659, longitude: 47.0325 },
    );

    expect(distance).toBeGreaterThan(0);
  });
});

describe('villeLaPlusProche', () => {
  it('retrouve Antananarivo depuis le centre-ville', () => {
    expect(
      villeLaPlusProche({ latitude: -18.8792, longitude: 47.5079 }).nom,
    ).toBe('Antananarivo');
  });

  it('retrouve Antsirabe depuis la zone d’Antsirabe', () => {
    expect(
      villeLaPlusProche({ latitude: -19.87, longitude: 47.03 }).nom,
    ).toBe('Antsirabe');
  });

  it('retrouve Taolagnaro depuis l’extrême-sud', () => {
    expect(
      villeLaPlusProche({ latitude: -25.03, longitude: 46.99 }).nom,
    ).toBe('Taolagnaro');
  });
});