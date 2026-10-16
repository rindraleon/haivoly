import ParcelleDetailScreen from '@/screens/ParcelleScreen/ParcelleDetailScreen';
import { ParcelleCockpitScreen } from '@/features/parcelles';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : détail « cockpit » (lot 2) · V1 : détail d'origine (bascule dans « Apparence »).
export default avecVersionUi({ v1: ParcelleDetailScreen, v2: ParcelleCockpitScreen });
