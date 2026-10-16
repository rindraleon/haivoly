import { ParcelleFormulaireScreen } from '@/features/parcelles/ParcelleFormulaireScreen';
import { avecVersionUi } from '@/features/shell/versionUi';
import ParcelleEditScreen from '@/screens/ParcelleScreen/ParcelleEditScreen';

// V2 : même formulaire que la création, pré-rempli par identifiant (lot 4).
export default avecVersionUi({ v1: ParcelleEditScreen, v2: ParcelleFormulaireScreen });
