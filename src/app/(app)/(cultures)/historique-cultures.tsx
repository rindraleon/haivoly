import { HistoriqueCulturesScreen } from '@/features/cultures';
import CultureHistoryScreen from '@/screens/CultureScreen/CultureHistoryScreen';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : historique virtualisé avec KPI et recherche (lot 6) · V1 : écran d'origine.
export default avecVersionUi({ v1: CultureHistoryScreen, v2: HistoriqueCulturesScreen });
