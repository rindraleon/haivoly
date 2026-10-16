import { ProfilFormulaireScreen } from '@/features/profil';
import EditProfileScreen from '@/screens/ProfileScreen/EditProfileScreen';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : formulaire profil au contrat clavier (lot 5) · V1 : formulaire d'origine.
export default avecVersionUi({ v1: EditProfileScreen, v2: ProfilFormulaireScreen });
