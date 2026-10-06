/**
 * Règles de compression d'image — vérifiées hors appareil.
 *
 * Ces tests protègent la promesse faite à l'utilisateur : **moins d'espace sans
 * perte visible**. Ils garantissent qu'on ne recompresse jamais inutilement une
 * image déjà optimisée, qu'on n'agrandit jamais une image, et que le ratio est
 * conservé.
 */
import {
  calculerDimensions,
  doitRecompresser,
  DIMENSION_MAX_PX,
  extensionDuFichier,
  OCTETS_SANS_RECOMPRESSION,
  pourcentageGain,
  QUALITE_JPEG,
} from '../image.regles';

describe('calculerDimensions', () => {
  it('réduit le côté le plus long à la limite, en conservant le ratio', () => {
    // Photo de capteur classique (4:3), 4032 × 3024.
    expect(calculerDimensions(4032, 3024)).toEqual({ width: 1920, height: 1440 });
  });

  it('traite aussi le portrait', () => {
    expect(calculerDimensions(3024, 4032)).toEqual({ width: 1440, height: 1920 });
  });

  it('n’agrandit jamais une image plus petite que la limite', () => {
    expect(calculerDimensions(800, 600)).toEqual({ width: 800, height: 600 });
    expect(calculerDimensions(DIMENSION_MAX_PX, DIMENSION_MAX_PX)).toEqual({
      width: DIMENSION_MAX_PX,
      height: DIMENSION_MAX_PX,
    });
  });

  it('ne renvoie jamais une dimension nulle après arrondi', () => {
    // Panorama très allongé : 20000 × 50.
    const { width, height } = calculerDimensions(20000, 50);
    expect(width).toBe(DIMENSION_MAX_PX);
    expect(height).toBe(5);
    expect(height).toBeGreaterThanOrEqual(1);
  });

  it('tolère des dimensions invalides (0 ou négatives)', () => {
    expect(calculerDimensions(0, 0)).toEqual({ width: 0, height: 0 });
    expect(calculerDimensions(-10, 20)).toEqual({ width: -10, height: 20 });
  });
});

describe('doitRecompresser', () => {
  const base = { largeur: 4032, hauteur: 3024, octets: 4 * 1024 * 1024, extension: 'jpg' };

  it('compresse une photo de capteur trop lourde', () => {
    expect(doitRecompresser(base)).toBe(true);
  });

  it('ne recompresse pas une JPEG déjà optimisée (aucune perte)', () => {
    expect(
      doitRecompresser({
        largeur: 1600,
        hauteur: 1200,
        octets: 180 * 1024,
        extension: 'jpg',
      }),
    ).toBe(false);
  });

  it('recompresse une JPEG trop grande même si elle est légère', () => {
    expect(
      doitRecompresser({ largeur: 4000, hauteur: 3000, octets: 200 * 1024, extension: 'jpeg' }),
    ).toBe(true);
  });

  it('normalise les formats non JPEG (PNG, HEIC)', () => {
    for (const extension of ['png', 'heic', 'webp', '']) {
      expect(
        doitRecompresser({ largeur: 800, hauteur: 600, octets: 90 * 1024, extension }),
      ).toBe(true);
    }
  });

  it('compresse par prudence quand le poids est inconnu', () => {
    expect(
      doitRecompresser({ largeur: 1200, hauteur: 900, octets: null, extension: 'jpg' }),
    ).toBe(true);
  });

  it('seuil : juste en dessous → intact, juste au-dessus → compressé', () => {
    const commun = { largeur: 1200, hauteur: 900, extension: 'jpg' };
    expect(
      doitRecompresser({ ...commun, octets: OCTETS_SANS_RECOMPRESSION }),
    ).toBe(false);
    expect(
      doitRecompresser({ ...commun, octets: OCTETS_SANS_RECOMPRESSION + 1 }),
    ).toBe(true);
  });

  it('ne compresse pas une image de taille inconnue mais raisonnable… non : elle est compressée', () => {
    // Cas limite documenté : dimensions inconnues → on compresse (jamais l'inverse).
    expect(
      doitRecompresser({ largeur: null, hauteur: null, octets: 100 * 1024, extension: 'jpg' }),
    ).toBe(true);
  });
});

describe('extensionDuFichier', () => {
  it('extrait l’extension d’un chemin de fichier', () => {
    expect(extensionDuFichier('file:///data/user/0/haivoly/cache/IMG_0042.JPG')).toBe('jpg');
    expect(extensionDuFichier('/tmp/photo.jpeg')).toBe('jpeg');
  });

  it('ignore les paramètres de requête', () => {
    expect(extensionDuFichier('file:///tmp/photo.png?t=1234')).toBe('png');
  });

  it('renvoie une chaîne vide quand il n’y a pas d’extension', () => {
    expect(extensionDuFichier('file:///tmp/photo')).toBe('');
  });
});

describe('pourcentageGain', () => {
  it('calcule la réduction réelle', () => {
    expect(pourcentageGain(4 * 1024 * 1024, 400 * 1024)).toBe(90);
  });

  it('renvoie 0 si le fichier n’a pas maigri', () => {
    expect(pourcentageGain(1000, 1200)).toBe(0);
  });

  it('renvoie null si le poids d’origine est inconnu', () => {
    expect(pourcentageGain(null, 500)).toBeNull();
  });
});

describe('constantes de qualité', () => {
  it('maintient un réglage visuellement transparent', () => {
    // Garde-fou : baisser cette valeur dégraderait visiblement les photos.
    expect(QUALITE_JPEG).toBeGreaterThanOrEqual(0.8);
    expect(DIMENSION_MAX_PX).toBeGreaterThanOrEqual(1600);
  });
});
