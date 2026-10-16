import NotificationScreen from '@/screens/NotificationScreen/NotificationScreen';
import { NotificationsCentreScreen } from '@/features/notifications';
import { avecVersionUi } from '@/features/shell/versionUi';

// V2 : centre de notifications groupé par jour (lot 5) · V1 : liste d'origine.
export default avecVersionUi({ v1: NotificationScreen, v2: NotificationsCentreScreen });
