/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { stylesRoot } from './CultureListScreenRoot';
import { stylesTopBar } from './CultureListScreenTopBar';
import { stylesStats } from './CultureListScreenStats';
import { stylesListe } from './CultureListScreenListe';
import { stylesFondAgricole } from './CultureListScreenFondAgricole';
import { stylesCultureCard } from './CultureListScreenCultureCard';
import { stylesProgression } from './CultureListScreenProgression';
import { stylesParcelle } from './CultureListScreenParcelle';
import { stylesInfos22 } from './CultureListScreenInfos22';
import { stylesFooter } from './CultureListScreenFooter';
import { stylesSummary } from './CultureListScreenSummary';
import { stylesSection } from './CultureListScreenSection';
import { stylesMap } from './CultureListScreenMap';
import { stylesHistorique } from './CultureListScreenHistorique';
import { stylesLoading } from './CultureListScreenLoading';
import { stylesError } from './CultureListScreenError';
import { stylesFab } from './CultureListScreenFab';
import { stylesModal } from './CultureListScreenModal';

/**
 * Feuille de styles de `CultureListScreen` — agrégat des groupes.
 *
 * Les clés restent identiques à celles d'origine (`styles.xxx`) : seul le
 * rangement a changé, ce qui évite d'avoir un fichier de plusieurs milliers de
 * lignes.
 */
export const styles = {
  ...stylesRoot,
  ...stylesTopBar,
  ...stylesStats,
  ...stylesListe,
  ...stylesFondAgricole,
  ...stylesCultureCard,
  ...stylesProgression,
  ...stylesParcelle,
  ...stylesInfos22,
  ...stylesFooter,
  ...stylesSummary,
  ...stylesSection,
  ...stylesMap,
  ...stylesHistorique,
  ...stylesLoading,
  ...stylesError,
  ...stylesFab,
  ...stylesModal,
};
