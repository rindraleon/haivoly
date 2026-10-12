/**
 * Jetons sémantiques de couleur, pour les thèmes clair et sombre.
 *
 * Le thème sombre n'est PAS une inversion mécanique du clair. Trois raisons,
 * vérifiables à l'œil comme au contrastomètre :
 *
 * 1. **Fond jamais noir pur.** `#0F1512` est un vert-gris très foncé, aligné
 *    sur la teinte agricole de la marque. Un noir pur (`#000000`) produit un
 *    halo autour des textes clairs et écrase les ombres portées.
 * 2. **Texte jamais blanc pur.** `#E8EDE9` au lieu de `#FFFFFF` : le contraste
 *    reste très au-dessus de 7:1 sans l'éblouissement du blanc sur fond sombre.
 * 3. **Le vert primaire s'éclaircit.** `#2E7D32` (500) en clair devient
 *    `#5DBB63` (400) en sombre : sur fond foncé, le 500 ne passerait pas
 *    4,5:1 sur du texte, alors que le 400 le dépasse.
 *
 * Les couleurs sémantiques (succès, alerte, erreur, info) suivent la même
 * règle : on remonte d'un cran d'échelle en sombre.
 */

export const jetonsClair = {
  fond: {
    app: '#F8FAF8',
    carte: '#FFFFFF',
    attenue: '#F2F4F7',
    agricole: '#DCEBD7',
    superposition: 'rgba(16, 24, 40, 0.52)',
  },
  texte: {
    principal: '#101828',
    secondaire: '#667085',
    discret: '#98A2B3',
    inverse: '#FFFFFF',
  },
  primaire: {
    base: '#2E7D32',
    fonce: '#1B4E1F',
    clair: '#EDF7ED',
    contraste: '#FFFFFF',
  },
  bordure: {
    defaut: '#EAECF0',
    appuyee: '#D0D5DD',
    focus: '#2E7D32',
  },
  succes: { base: '#039855', fond: '#ECFDF3', texte: '#027A48' },
  alerte: { base: '#F79009', fond: '#FFFAEB', texte: '#B54708' },
  erreur: { base: '#D92D20', fond: '#FEF3F2', texte: '#B42318' },
  info: { base: '#1570EF', fond: '#EFF8FF', texte: '#175CD3' },
  ombre: '#101828',
} as const;

export const jetonsSombre = {
  fond: {
    app: '#0F1512',
    carte: '#171E1A',
    attenue: '#1F2823',
    agricole: '#1B2A1F',
    superposition: 'rgba(0, 0, 0, 0.68)',
  },
  texte: {
    principal: '#E8EDE9',
    secondaire: '#A3B0A8',
    discret: '#6D7A70',
    inverse: '#0F1512',
  },
  primaire: {
    base: '#5DBB63',
    fonce: '#8CC989',
    clair: '#16241A',
    contraste: '#0F1512',
  },
  bordure: {
    defaut: '#2A332E',
    appuyee: '#3B463F',
    focus: '#5DBB63',
  },
  succes: { base: '#32D583', fond: '#12211A', texte: '#75E0A7' },
  alerte: { base: '#FDB022', fond: '#241C0E', texte: '#FEC84B' },
  erreur: { base: '#F97066', fond: '#2A1512', texte: '#FDA29B' },
  info: { base: '#53B1FD', fond: '#101D2A', texte: '#84CAFF' },
  ombre: '#000000',
} as const;

/**
 * Forme élargie des jetons.
 *
 * Les deux palettes sont déclarées `as const`, donc leurs feuilles sont des
 * littéraux de type (`'#F8FAF8'` et non `string`). Sans cet élargissement,
 * `jetonsSombre` ne serait pas assignable à `Jetons` et la table
 * `JETONS_PAR_MODE` refuserait de compiler.
 */
type Elargir<T> = { [K in keyof T]: T[K] extends string ? string : Elargir<T[K]> };

export type Jetons = Elargir<typeof jetonsClair>;
export type ModeTheme = 'light' | 'dark';

export const JETONS_PAR_MODE: Record<ModeTheme, Jetons> = {
  light: jetonsClair,
  dark: jetonsSombre,
};
