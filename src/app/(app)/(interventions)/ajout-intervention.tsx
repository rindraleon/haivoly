import { InterventionFormulaireScreen } from '@/features/interventions';
import { avecVersionUi } from '@/features/shell/versionUi';
import InterventionCreateScreen from '@/screens/InterventionScreen/InterventionCreateScreen';

// V2 : formulaire complet avec puces de type et d'unité (lot 4) · V1 : écran d'origine.
export default avecVersionUi({ v1: InterventionCreateScreen, v2: InterventionFormulaireScreen });
