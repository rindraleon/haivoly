import { SuiviUnifieScreen } from '@/features/suivi';
import { avecVersionUi } from '@/features/shell/versionUi';
import ObservationListScreen from '@/screens/ObservationScreen/ObservationListScreen';

// V2 : suivi unifié observations + interventions + récoltes (lot 4) · V1 : liste.
export default avecVersionUi({ v1: ObservationListScreen, v2: SuiviUnifieScreen });
