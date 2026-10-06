/**
 * Feuilles de style de `ProfilScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { stylesRoot } from './ProfilScreenRoot';
import { stylesFondAgricole } from './ProfilScreenFondAgricole';
import { stylesContenu } from './ProfilScreenContenu';
import { stylesHeader } from './ProfilScreenHeader';
import { stylesCarteProfil } from './ProfilScreenCarteProfil';
import { stylesSections } from './ProfilScreenSections';
import { stylesInfoCard } from './ProfilScreenInfoCard';
import { stylesMenuCompte } from './ProfilScreenMenuCompte';
import { stylesLogout } from './ProfilScreenLogout';
import { stylesFooter } from './ProfilScreenFooter';
import { stylesLoading } from './ProfilScreenLoading';
import { stylesError } from './ProfilScreenError';

/**
 * Feuille de styles de `ProfilScreen` — agrégat des groupes.
 *
 * Les clés restent identiques à celles d'origine (`styles.xxx`) : seul le
 * rangement a changé, ce qui évite d'avoir un fichier de plusieurs milliers de
 * lignes.
 */
export const styles = {
  ...stylesRoot,
  ...stylesFondAgricole,
  ...stylesContenu,
  ...stylesHeader,
  ...stylesCarteProfil,
  ...stylesSections,
  ...stylesInfoCard,
  ...stylesMenuCompte,
  ...stylesLogout,
  ...stylesFooter,
  ...stylesLoading,
  ...stylesError,
};
