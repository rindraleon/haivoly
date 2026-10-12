import { describe, expect, it } from '@jest/globals';

import {
  JETONS_PAR_MODE,
  jetonsClair,
  jetonsSombre,
  type Jetons,
} from '../jetons';
import {
  CHOIX_THEME_DEFAUT,
  MODE_PAR_DEFAUT,
  jetonsPourMode,
  resoudreMode,
} from '../preference';

/**
 * Le thème sombre ne doit PAS être une inversion mécanique du clair :
 * c'est une exigence explicite du module complémentaire. Les tests ci-dessous
 * la rendent vérifiable plutôt que déclarative.
 */

/** Aplatie un objet de jetons en `chemin -> valeur`. */
function aplatir(objet: Record<string, unknown>, prefixe = ''): Record<string, string> {
  const sortie: Record<string, string> = {};
  for (const [cle, valeur] of Object.entries(objet)) {
    const chemin = prefixe ? `${prefixe}.${cle}` : cle;
    if (typeof valeur === 'string') sortie[chemin] = valeur;
    else if (valeur && typeof valeur === 'object') {
      Object.assign(sortie, aplatir(valeur as Record<string, unknown>, chemin));
    }
  }
  return sortie;
}

/** Luminance relative WCAG d'une couleur `#RRGGBB`. */
function luminance(hex: string): number {
  const brut = hex.replace('#', '');
  const canal = (i: number) => {
    const c = parseInt(brut.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * canal(0) + 0.7152 * canal(2) + 0.0722 * canal(4);
}

/** Ratio de contraste WCAG entre deux couleurs, de 1 à 21. */
function contraste(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

describe('résolution du mode', () => {
  it('un choix explicite prime sur le système', () => {
    expect(resoudreMode('light', 'dark')).toBe('light');
    expect(resoudreMode('dark', 'light')).toBe('dark');
  });

  it('`system` suit le mode de l’appareil', () => {
    expect(resoudreMode('system', 'dark')).toBe('dark');
    expect(resoudreMode('system', 'light')).toBe('light');
  });

  it('un mode système inconnu retombe sur le défaut', () => {
    expect(resoudreMode('system', null)).toBe(MODE_PAR_DEFAUT);
    expect(resoudreMode('system', undefined)).toBe(MODE_PAR_DEFAUT);
    expect(MODE_PAR_DEFAUT).toBe('light');
    expect(CHOIX_THEME_DEFAUT).toBe('system');
  });

  it('la table des jetons couvre les deux modes', () => {
    expect(jetonsPourMode('light')).toBe(jetonsClair);
    expect(jetonsPourMode('dark')).toBe(jetonsSombre);
    expect(Object.keys(JETONS_PAR_MODE).sort()).toEqual(['dark', 'light']);
  });
});

describe('les deux palettes sont distinctes, pas inversées', () => {
  it('ont exactement les mêmes jetons', () => {
    expect(Object.keys(aplatir(jetonsSombre)).sort()).toEqual(
      Object.keys(aplatir(jetonsClair)).sort(),
    );
  });

  it('le fond sombre n’est ni noir pur ni le complément du fond clair', () => {
    /**
     * L'ancienne palette de `theme/system.ts` posait `background: '#000000'`
     * en sombre — exactement l'inversion mécanique interdite.
     */
    expect(jetonsSombre.fond.app.toLowerCase()).not.toBe('#000000');
    expect(jetonsSombre.fond.carte.toLowerCase()).not.toBe('#000000');
    expect(jetonsSombre.texte.principal.toLowerCase()).not.toBe('#ffffff');
  });

  it('le fond sombre reste un vert-gris très foncé, pas un gris neutre', () => {
    /**
     * Vérifie l'intention de marque : le canal vert doit dominer légèrement,
     * comme dans le fond clair `#F8FAF8` qui porte déjà une teinte verte.
     */
    const brut = jetonsSombre.fond.app.replace('#', '');
    const r = parseInt(brut.slice(0, 2), 16);
    const v = parseInt(brut.slice(2, 4), 16);
    const b = parseInt(brut.slice(4, 6), 16);
    expect(v).toBeGreaterThan(r);
    expect(v).toBeGreaterThan(b);
  });

  it('aucun jeton sombre ne reprend la valeur claire correspondante', () => {
    const clair = aplatir(jetonsClair);
    const sombre = aplatir(jetonsSombre);
    const identiques = Object.keys(clair).filter((c) => clair[c] === sombre[c]);
    expect(identiques).toEqual([]);
  });

  it('le vert primaire s’éclaircit en sombre pour rester lisible', () => {
    /**
     * Sur fond foncé, `#2E7D32` ne passerait pas 4,5:1 : le jeton sombre doit
     * donc être plus lumineux que le jeton clair, et non l'inverse.
     */
    expect(luminance(jetonsSombre.primaire.base)).toBeGreaterThan(
      luminance(jetonsClair.primaire.base),
    );
  });
});

describe('contraste suffisant dans chaque thème', () => {
  /** Paires soumises à au moins 4,5:1 (texte normal, WCAG AA). */
  const pairesTexte: [keyof Jetons['texte'], keyof Jetons['fond']][] = [
    ['principal', 'app'],
    ['principal', 'carte'],
    ['secondaire', 'app'],
    ['secondaire', 'carte'],
  ];

  it.each(['light', 'dark'] as const)(
    '%s : le texte atteint 4,5:1 sur ses fonds',
    (mode) => {
      const j = jetonsPourMode(mode);
      /**
       * Jest n'accepte qu'un seul argument à `expect` : le détail de la paire
       * fautive est donc agrégé dans un tableau, affiché tel quel en cas
       * d'échec.
       */
      const insuffisants = pairesTexte
        .map(([texte, fond]) => {
          const ratio = contraste(j.texte[texte] as string, j.fond[fond] as string);
          return { paire: `texte.${texte} sur fond.${fond}`, ratio: Number(ratio.toFixed(2)) };
        })
        .filter((r) => r.ratio < 4.5);
      expect(insuffisants).toEqual([]);
    },
  );

  it.each(['light', 'dark'] as const)(
    '%s : le texte sur primaire atteint 4,5:1',
    (mode) => {
      const j = jetonsPourMode(mode);
      const ratio = contraste(j.primaire.contraste, j.primaire.base);
      expect(ratio).toBeGreaterThanOrEqual(4.5);
    },
  );
});
