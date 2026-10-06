/**
 * Feuilles de style de `InterventionListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { stylesPartie1 } from './InterventionListScreenPartie1';
import { stylesTopSearch } from './InterventionListScreenTopSearch';
import { stylesAgriculturalList } from './InterventionListScreenAgriculturalList';
import { stylesCarte } from './InterventionListScreenCarte';
import { stylesPartie5 } from './InterventionListScreenPartie5';
import { stylesFormulaire } from './InterventionListScreenFormulaire';
import { stylesFiltreModal } from './InterventionListScreenFiltreModal';
import { stylesEmptyStates } from './InterventionListScreenEmptyStates';
import { stylesBlocked } from './InterventionListScreenBlocked';
import { stylesFab } from './InterventionListScreenFab';

/**
 * Feuille de styles de `InterventionListScreen` — agrégat des groupes.
 *
 * Les clés restent identiques à celles d'origine (`styles.xxx`) : seul le
 * rangement a changé, ce qui évite d'avoir un fichier de plusieurs milliers de
 * lignes.
 */
export const styles = {
  ...stylesPartie1,
  ...stylesTopSearch,
  ...stylesAgriculturalList,
  ...stylesCarte,
  ...stylesPartie5,
  ...stylesFormulaire,
  ...stylesFiltreModal,
  ...stylesEmptyStates,
  ...stylesBlocked,
  ...stylesFab,
};
