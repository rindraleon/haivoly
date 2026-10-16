import RecolteCreateScreen from '@/screens/RecolteScreen/RecolteCreateScreen';
import { RecolteFormScreen } from '@/features/recoltes';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : formulaire conforme au contrat clavier · V1 : formulaire d'origine.
export default avecVersionUi({ v1: RecolteCreateScreen, v2: RecolteFormScreen });
