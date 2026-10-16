import CultureListScreen from '@/screens/CultureScreen/CultureListScreen';
import { CulturesListeScreen } from '@/features/cultures';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : suivi des cultures avec puces, alertes et ordre d'urgence (lot 3) · V1 : liste d'origine.
export default avecVersionUi({ v1: CultureListScreen, v2: CulturesListeScreen });
