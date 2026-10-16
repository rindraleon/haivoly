import CultureDetailScreen from '@/screens/CultureScreen/CultureDetailScreen';
import { CultureCockpitScreen } from '@/features/cultures';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : détail « cockpit » (lot 3) · V1 : détail d'origine (bascule dans « Apparence »).
export default avecVersionUi({ v1: CultureDetailScreen, v2: CultureCockpitScreen });
