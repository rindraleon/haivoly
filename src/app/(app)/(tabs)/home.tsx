import HomeScreen from '@/screens/HomeScreen/HomeScreen';
import { DashboardScreen } from '@/features/dashboard';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : tableau de bord · V1 : accueil d'origine (bascule dans « Apparence »).
export default avecVersionUi({ v1: HomeScreen, v2: DashboardScreen });
