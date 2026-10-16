import { ProfilParametresScreen } from '@/features/profil';
import ProfilScreen from '@/screens/ProfileScreen/ProfilScreen';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : profil & paramètres (lot 5) · V1 : profil d'origine.
export default avecVersionUi({ v1: ProfilScreen, v2: ProfilParametresScreen });
