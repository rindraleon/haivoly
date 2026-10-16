/**
 * Couleurs du design system Haivoly V2.
 *
 * Règles :
 * - la palette de marque est imposée (cahier des charges) ;
 * - chaque couleur de fond a sa couleur « sur » (texte ou icône posé dessus)
 *   avec un contraste vérifié ;
 * - les teintes de marque trop claires pour du texte (`cta`, `alerte`, `info`,
 *   `secondaire`) ont une variante « texte » plus foncée.
 */

/** Palette de marque brute : ne pas utiliser directement dans les écrans. */
export const PALETTE = {
  vertProfond: '#1B5E20',
  vertSecondaire: '#43A047',
  vertCta: '#66BB6A',
  vertSucces: '#2E7D32',
  orangeAlerte: '#FB8C00',
  rougeErreur: '#E53935',
  bleuInfo: '#29B6F6',
  fondClair: '#F6F9F4',
  blanc: '#FFFFFF',
  encre: '#10241A',
  grisTexte: '#5F6F66',
  grisBordure: '#E3EAE3',
  fondSombre: '#0E1613',
  surfaceSombre: '#16221C',
} as const;

export interface Couleurs {
  /** Fond de l'application. */
  fond: string;
  /** Cartes, feuilles, barres. */
  surface: string;
  /** Sections discrètes, puces inactives, champs en lecture seule. */
  surfaceAlt: string;
  /** Élément pressé ou sélectionné. */
  surfaceSelection: string;

  texte: string;
  texteSecondaire: string;
  /** Indications, placeholders (≥ 3:1). */
  texteTertiaire: string;
  texteInverse: string;

  /** Bordure décorative (cartes, séparateurs) : ne porte pas d'information. */
  bordure: string;
  /** Séparateurs plus visibles. */
  bordureForte: string;
  /** Contour d'un champ de saisie (≥ 3:1, critère WCAG 1.4.11). */
  bordureChamp: string;

  primaire: string;
  surPrimaire: string;
  primaireConteneur: string;
  surPrimaireConteneur: string;

  /** Accents, icônes, jauges : jamais pour un texte courant. */
  secondaire: string;

  cta: string;
  surCta: string;

  succes: string;
  surSucces: string;
  succesConteneur: string;
  surSuccesConteneur: string;

  /** Orange de marque : icônes et fonds, jamais pour du texte sur blanc. */
  alerte: string;
  surAlerte: string;
  alerteTexte: string;
  alerteConteneur: string;
  surAlerteConteneur: string;

  /** Rouge de marque : icônes et contours. */
  erreur: string;
  /** Fond des boutons destructifs (texte blanc lisible). */
  erreurFonce: string;
  surErreurFonce: string;
  erreurTexte: string;
  erreurConteneur: string;
  surErreurConteneur: string;

  /** Bleu de marque : icônes et fonds. */
  info: string;
  infoTexte: string;
  infoConteneur: string;
  surInfoConteneur: string;

  superposition: string;
  squelette: string;
  squeletteReflet: string;
  ombre: string;
}

export const COULEURS_CLAIR: Couleurs = {
  fond: PALETTE.fondClair,
  surface: PALETTE.blanc,
  surfaceAlt: '#EEF4EC',
  surfaceSelection: '#E3F1E4',

  texte: PALETTE.encre,
  texteSecondaire: PALETTE.grisTexte,
  texteTertiaire: '#6F8076',
  texteInverse: PALETTE.blanc,

  bordure: PALETTE.grisBordure,
  bordureForte: '#C9D6CB',
  bordureChamp: '#7A8B81',

  primaire: PALETTE.vertProfond,
  surPrimaire: PALETTE.blanc,
  primaireConteneur: '#E3F1E4',
  surPrimaireConteneur: PALETTE.vertProfond,

  secondaire: PALETTE.vertSecondaire,

  cta: PALETTE.vertCta,
  surCta: PALETTE.encre,

  succes: PALETTE.vertSucces,
  surSucces: PALETTE.blanc,
  succesConteneur: '#E8F5E9',
  surSuccesConteneur: PALETTE.vertProfond,

  alerte: PALETTE.orangeAlerte,
  surAlerte: PALETTE.encre,
  alerteTexte: '#B45309',
  alerteConteneur: '#FFF3E0',
  surAlerteConteneur: '#8A4100',

  erreur: PALETTE.rougeErreur,
  erreurFonce: '#C62828',
  surErreurFonce: PALETTE.blanc,
  erreurTexte: '#C62828',
  erreurConteneur: '#FDECEA',
  surErreurConteneur: '#B71C1C',

  info: PALETTE.bleuInfo,
  infoTexte: '#01579B',
  infoConteneur: '#E1F5FE',
  surInfoConteneur: '#01579B',

  superposition: 'rgba(16, 36, 26, 0.48)',
  squelette: '#E6EEE5',
  squeletteReflet: '#F3F7F2',
  ombre: PALETTE.encre,
};

export const COULEURS_SOMBRE: Couleurs = {
  fond: PALETTE.fondSombre,
  surface: PALETTE.surfaceSombre,
  surfaceAlt: '#1D2B24',
  surfaceSelection: '#21352A',

  texte: '#E6EEE9',
  texteSecondaire: '#A9B8AF',
  texteTertiaire: '#7F9087',
  texteInverse: PALETTE.fondSombre,

  bordure: '#26352D',
  bordureForte: '#33463B',
  bordureChamp: '#6E8377',

  primaire: '#7BD389',
  surPrimaire: PALETTE.fondSombre,
  primaireConteneur: '#1E3A25',
  surPrimaireConteneur: '#A5E3AE',

  secondaire: '#5CC566',

  cta: '#7BD389',
  surCta: PALETTE.fondSombre,

  succes: '#5CC566',
  surSucces: PALETTE.fondSombre,
  succesConteneur: '#163A21',
  surSuccesConteneur: '#A5E3AE',

  alerte: '#FFB74D',
  surAlerte: PALETTE.fondSombre,
  alerteTexte: '#FFB74D',
  alerteConteneur: '#3A2A12',
  surAlerteConteneur: '#FFCC80',

  erreur: '#EF5350',
  erreurFonce: '#EF5350',
  surErreurFonce: PALETTE.fondSombre,
  erreurTexte: '#FF8A80',
  erreurConteneur: '#3B1A19',
  surErreurConteneur: '#FFB4AB',

  info: '#4FC3F7',
  infoTexte: '#81D4FA',
  infoConteneur: '#0F2E3D',
  surInfoConteneur: '#B3E5FC',

  superposition: 'rgba(0, 0, 0, 0.6)',
  squelette: '#1F2D26',
  squeletteReflet: '#26372E',
  ombre: '#000000',
};

/** Tons sémantiques partagés par les badges, cartes d'alerte et KPI. */
export type Ton = 'primaire' | 'succes' | 'alerte' | 'erreur' | 'info' | 'neutre';

export interface CouleursDeTon {
  /** Fond teinté. */
  conteneur: string;
  /** Texte et icône sur le fond teinté. */
  surConteneur: string;
  /** Couleur pleine (icône, jauge, contour). */
  accent: string;
}

export function couleursDeTon(couleurs: Couleurs, ton: Ton): CouleursDeTon {
  switch (ton) {
    case 'primaire':
      return {
        conteneur: couleurs.primaireConteneur,
        surConteneur: couleurs.surPrimaireConteneur,
        accent: couleurs.primaire,
      };
    case 'succes':
      return {
        conteneur: couleurs.succesConteneur,
        surConteneur: couleurs.surSuccesConteneur,
        accent: couleurs.succes,
      };
    case 'alerte':
      return {
        conteneur: couleurs.alerteConteneur,
        surConteneur: couleurs.surAlerteConteneur,
        accent: couleurs.alerte,
      };
    case 'erreur':
      return {
        conteneur: couleurs.erreurConteneur,
        surConteneur: couleurs.surErreurConteneur,
        accent: couleurs.erreur,
      };
    case 'info':
      return {
        conteneur: couleurs.infoConteneur,
        surConteneur: couleurs.surInfoConteneur,
        accent: couleurs.info,
      };
    default:
      return {
        conteneur: couleurs.surfaceAlt,
        surConteneur: couleurs.texteSecondaire,
        accent: couleurs.texteSecondaire,
      };
  }
}
