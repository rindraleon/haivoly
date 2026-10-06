/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { stylesRoot } from './ObservationListScreenRoot';
import { stylesMemeLogiqueQueCulturesTsx } from './ObservationListScreenMemeLogiqueQueCulturesTsx';
import { stylesFiltreRapide } from './ObservationListScreenFiltreRapide';
import { stylesStats } from './ObservationListScreenStats';
import { stylesMemeFondQueCulturesTsx } from './ObservationListScreenMemeFondQueCulturesTsx';
import { stylesExactementCommeCulturesTsx } from './ObservationListScreenExactementCommeCulturesTsx';
import { stylesMemeLangageQueCulturecard } from './ObservationListScreenMemeLangageQueCulturecard';
import { stylesInfoCard } from './ObservationListScreenInfoCard';
import { stylesPhotos } from './ObservationListScreenPhotos';
import { stylesFooter } from './ObservationListScreenFooter';
import { stylesActions } from './ObservationListScreenActions';
import { stylesScreenStates } from './ObservationListScreenScreenStates';
import { stylesEmptyLoading } from './ObservationListScreenEmptyLoading';
import { stylesStatus } from './ObservationListScreenStatus';
import { stylesSection } from './ObservationListScreenSection';
import { stylesFab } from './ObservationListScreenFab';
import { stylesModals } from './ObservationListScreenModals';
import { stylesCultureDropdown } from './ObservationListScreenCultureDropdown';
import { stylesSuivi } from './ObservationListScreenSuivi';
import { stylesAjoutEtapes } from './ObservationListScreenAjoutEtapes';
import { stylesSheetActions } from './ObservationListScreenSheetActions';

/**
 * Feuille de styles de `ObservationListScreen` — agrégat des groupes.
 *
 * Les clés restent identiques à celles d'origine (`styles.xxx`) : seul le
 * rangement a changé, ce qui évite d'avoir un fichier de plusieurs milliers de
 * lignes.
 */
export const styles = {
  ...stylesRoot,
  ...stylesMemeLogiqueQueCulturesTsx,
  ...stylesFiltreRapide,
  ...stylesStats,
  ...stylesMemeFondQueCulturesTsx,
  ...stylesExactementCommeCulturesTsx,
  ...stylesMemeLangageQueCulturecard,
  ...stylesInfoCard,
  ...stylesPhotos,
  ...stylesFooter,
  ...stylesActions,
  ...stylesScreenStates,
  ...stylesEmptyLoading,
  ...stylesStatus,
  ...stylesSection,
  ...stylesFab,
  ...stylesModals,
  ...stylesCultureDropdown,
  ...stylesSuivi,
  ...stylesAjoutEtapes,
  ...stylesSheetActions,
};
