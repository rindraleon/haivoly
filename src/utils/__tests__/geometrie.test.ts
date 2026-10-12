import {
  aDesAutoIntersections,
  dedupliquer,
  messageDesDefauts,
  surfaceM2,
  validerGeometrie,
} from '@/utils/geometrie';

const TRIANGLE = [
  { latitude: -19.8669, longitude: 47.0332 },
  { latitude: -19.868, longitude: 47.0345 },
  { latitude: -19.866, longitude: 47.035 },
];

const PAPILLON = [
  { latitude: -19.8669, longitude: 47.0332 },
  { latitude: -19.868, longitude: 47.035 },
  { latitude: -19.8669, longitude: 47.035 },
  { latitude: -19.868, longitude: 47.0332 },
];

describe('validerGeometrie (mobile, miroir du backend)', () => {
  it('accepte un triangle valide', () => {
    expect(validerGeometrie(TRIANGLE).valide).toBe(true);
  });

  it('refuse moins de trois sommets', () => {
    const resultat = validerGeometrie(TRIANGLE.slice(0, 2));
    expect(resultat.valide).toBe(false);
    expect(resultat.defauts).toContain('TROP_PEU_DE_SOMMETS');
  });

  it('refuse trois sommets identiques', () => {
    const resultat = validerGeometrie([TRIANGLE[0], TRIANGLE[0], TRIANGLE[0]]);
    expect(resultat.valide).toBe(false);
    expect(resultat.defauts).toContain('SOMMETS_IDENTIQUES');
  });

  it('refuse un polygone auto-intersectant', () => {
    const resultat = validerGeometrie(PAPILLON);
    expect(resultat.valide).toBe(false);
    expect(resultat.defauts).toContain('AUTO_INTERSECTION');
  });

  it('refuse une latitude hors plage et signale l’index fautif', () => {
    const resultat = validerGeometrie([
      { latitude: 999, longitude: 47.0332 },
      TRIANGLE[1],
      TRIANGLE[2],
    ]);
    expect(resultat.defauts).toContain('COORDONNEES_INVALIDES');
    expect(resultat.indexConcernes).toEqual([0]);
  });

  it('refuse un sommet à (0 ; 0)', () => {
    const resultat = validerGeometrie([
      { latitude: 0, longitude: 0 },
      TRIANGLE[1],
      TRIANGLE[2],
    ]);
    expect(resultat.defauts).toContain('SOMMET_ISOLE_ZERO_ZERO');
  });

  it('accepte un polygone concave simple (en L)', () => {
    const enL = [
      { latitude: -19.866, longitude: 47.033 },
      { latitude: -19.866, longitude: 47.035 },
      { latitude: -19.867, longitude: 47.035 },
      { latitude: -19.867, longitude: 47.034 },
      { latitude: -19.868, longitude: 47.034 },
      { latitude: -19.868, longitude: 47.033 },
    ];
    expect(validerGeometrie(enL).valide).toBe(true);
    expect(aDesAutoIntersections(enL)).toBe(false);
  });
});

describe('dedupliquer', () => {
  it('retire la fermeture explicite sans créer de sommet métier', () => {
    expect(dedupliquer([...TRIANGLE, TRIANGLE[0]])).toEqual(TRIANGLE);
  });

  it('retire les doublons consécutifs en conservant l’ordre', () => {
    expect(
      dedupliquer([TRIANGLE[0], TRIANGLE[0], TRIANGLE[1], TRIANGLE[1], TRIANGLE[2]]),
    ).toEqual(TRIANGLE);
  });
});

describe('surfaceM2', () => {
  it('donne ~0 pour un polygone aplati', () => {
    expect(surfaceM2([TRIANGLE[0], TRIANGLE[0], TRIANGLE[0]])).toBeLessThan(1);
  });

  it('donne un ordre de grandeur cohérent pour le triangle de référence', () => {
    const aire = surfaceM2(TRIANGLE);
    expect(aire).toBeGreaterThan(10_000);
    expect(aire).toBeLessThan(30_000);
  });
});

describe('messageDesDefauts', () => {
  it('produit un message lisible pour l’utilisateur', () => {
    const message = messageDesDefauts(['AUTO_INTERSECTION']);
    expect(message).toContain('se croise elle-même');
  });
});
