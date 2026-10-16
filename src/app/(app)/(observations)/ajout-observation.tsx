import { ObservationFormulaireScreen } from '@/features/observations';
import { avecVersionUi } from '@/features/shell/versionUi';
import ObservationCreateScreen from '@/screens/ObservationScreen/ObservationCreateScreen';

// V2 : formulaire unifié création/modification (lot 4) · V1 : écran d'origine.
export default avecVersionUi({ v1: ObservationCreateScreen, v2: ObservationFormulaireScreen });
