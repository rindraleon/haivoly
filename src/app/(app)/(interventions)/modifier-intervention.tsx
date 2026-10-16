import { InterventionFormulaireScreen } from '@/features/interventions';
import { avecVersionUi } from '@/features/shell/versionUi';
import InterventionEditScreen from '@/screens/InterventionScreen/InterventionEditScreen';

// V2 : même formulaire que la création, pré-rempli par identifiant (lot 4).
// Route reliée depuis le cockpit de culture et la liste V1 (lot 4).
export default avecVersionUi({ v1: InterventionEditScreen, v2: InterventionFormulaireScreen });
