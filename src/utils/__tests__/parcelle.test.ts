/** Géométrie et affichage des parcelles (valeur indicative côté mobile). */
import { centroid, formatSuperficie, formatSuperficieValue, polygonArea, polishPolygon } from '@/utils/parcelle';

const CARRÉ = [
  { latitude: -18.91, longitude: 47.53 },
  { latitude: -18.91, longitude: 47.54 },
  { latitude: -18.92, longitude: 47.54 },
  { latitude: -18.92, longitude: 47.53 },
];

describe('polygonArea', () => {
  it('exige au moins trois sommets', () => {
    expect(polygonArea([])).toBe(0);
    expect(polygonArea(CARRÉ.slice(0, 2))).toBe(0);
  });

  it('calcule l’ordre de grandeur d’un carré d’environ 1 km de côté', () => {
    // 0,01° de côté ≈ 1,11 km (latitude) × 1,05 km (longitude à -18,9°) ≈ 1,17 km².
    const aire = polygonArea(CARRÉ);
    expect(aire).toBeGreaterThan(1_000_000);
    expect(aire).toBeLessThan(1_300_000);
  });
});

describe('formatSuperficieValue', () => {
  it('affiche des mètres carrés en dessous d’un hectare', () => {
    expect(formatSuperficieValue(1930)?.replace(/[\s\u202F\u00A0]/g, ' ')).toBe('1 930 m²');
  });

  it('bascule en hectares au-delà', () => {
    expect(formatSuperficieValue(20000)?.replace(/[\s\u202F\u00A0]/g, ' ')).toBe('2 ha');
  });

  it('renvoie null pour une valeur inexploitable', () => {
    expect(formatSuperficieValue(null)).toBeNull();
    expect(formatSuperficieValue(Number.NaN)).toBeNull();
  });
});

describe('formatSuperficie / polishPolygon / centroid', () => {
  it('formatSuperficie exige un polygone complet', () => {
    expect(formatSuperficie(CARRÉ.slice(0, 2))).toBeNull();
    expect(formatSuperficie(CARRÉ)).not.toBeNull();
  });

  it('polishPolygon retire les doublons consécutifs, renumérote et écarte l’invalide', () => {
    const points = polishPolygon([
      CARRÉ[0],
      CARRÉ[0],
      { latitude: 0, longitude: 0 },
      CARRÉ[1],
      CARRÉ[2],
      { latitude: 200, longitude: 47 },
    ]);

    expect(points.map((point) => point.ordre)).toEqual([0, 1, 2]);
    expect(points[0]).toMatchObject({ latitude: -18.91, longitude: 47.53 });
  });

  it('centroid renvoie le centre du polygone', () => {
    const centre = centroid(CARRÉ);
    expect(centre?.latitude).toBeCloseTo(-18.915, 3);
    expect(centre?.longitude).toBeCloseTo(47.535, 3);
  });
});
