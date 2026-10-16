import ParcelleListScreen from '@/screens/ParcelleScreen/ParcelleListScreen';
import { ParcellesListeScreen } from '@/features/parcelles';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : liste avec recherche, puces et mini-cartes (lot 2) · V1 : liste d'origine.
export default avecVersionUi({ v1: ParcelleListScreen, v2: ParcellesListeScreen });
