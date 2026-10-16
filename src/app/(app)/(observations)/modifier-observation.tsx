import { ObservationFormulaireScreen } from '@/features/observations';
import { avecVersionUi } from '@/features/shell/versionUi';
import ObservationEditScreen from '@/screens/ObservationScreen/ObservationEditScreen';

// V2 : même formulaire que la création, pré-rempli par identifiant (lot 4).
export default avecVersionUi({ v1: ObservationEditScreen, v2: ObservationFormulaireScreen });
