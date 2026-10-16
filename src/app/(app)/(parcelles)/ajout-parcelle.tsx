import { ParcelleFormulaireScreen } from '@/features/parcelles/ParcelleFormulaireScreen';
import { avecVersionUi } from '@/features/shell/versionUi';
import ParcelleCreateScreen from '@/screens/ParcelleScreen/ParcelleCreateScreen';

// V2 : nom + type de sol puis proposition de délimitation (lot 4) · V1 : assistant.
export default avecVersionUi({ v1: ParcelleCreateScreen, v2: ParcelleFormulaireScreen });
