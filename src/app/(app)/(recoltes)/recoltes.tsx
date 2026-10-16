import { RecoltesRentabiliteScreen } from '@/features/recoltes';
import RecolteListScreen from '@/screens/RecolteScreen/RecolteListScreen';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : récolte & rendement (KPI, filtre, liste) lot 5 · V1 : liste d'origine.
export default avecVersionUi({ v1: RecolteListScreen, v2: RecoltesRentabiliteScreen });
