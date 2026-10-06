/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { stylesRoot } from './CultureCreateScreenRoot';
import { stylesHeader } from './CultureCreateScreenHeader';
import { stylesStepper } from './CultureCreateScreenStepper';
import { stylesStepContent } from './CultureCreateScreenStepContent';
import { stylesContextParcelle } from './CultureCreateScreenContextParcelle';
import { stylesForm } from './CultureCreateScreenForm';
import { stylesDate } from './CultureCreateScreenDate';
import { stylesCalculated } from './CultureCreateScreenCalculated';
import { stylesStepActions } from './CultureCreateScreenStepActions';
import { stylesNextButton } from './CultureCreateScreenNextButton';
import { stylesDelimitation } from './CultureCreateScreenDelimitation';
import { stylesReview } from './CultureCreateScreenReview';
import { stylesChecklist } from './CultureCreateScreenChecklist';
import { stylesInfo } from './CultureCreateScreenInfo';
import { stylesStatus } from './CultureCreateScreenStatus';
import { stylesSave } from './CultureCreateScreenSave';
import { stylesFooter } from './CultureCreateScreenFooter';

/**
 * Feuille de styles de `CultureCreateScreen` — agrégat des groupes.
 *
 * Les clés restent identiques à celles d'origine (`styles.xxx`) : seul le
 * rangement a changé, ce qui évite d'avoir un fichier de plusieurs milliers de
 * lignes.
 */
export const styles = {
  ...stylesRoot,
  ...stylesHeader,
  ...stylesStepper,
  ...stylesStepContent,
  ...stylesContextParcelle,
  ...stylesForm,
  ...stylesDate,
  ...stylesCalculated,
  ...stylesStepActions,
  ...stylesNextButton,
  ...stylesDelimitation,
  ...stylesReview,
  ...stylesChecklist,
  ...stylesInfo,
  ...stylesStatus,
  ...stylesSave,
  ...stylesFooter,
};
