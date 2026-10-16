import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { colors } from '@/theme';
import { useTheme } from '@/ui';

import { NOMS_ONGLETS, type NomOnglet } from './navigationOnglets';
import { useVersionUi } from './versionUi';

const TITRES: Readonly<Record<NomOnglet, string>> = {
  home: 'navigation.accueil',
  parcelles: 'navigation.parcelles',
  cultures: 'navigation.cultures',
  observations: 'navigation.suivi',
  profil: 'navigation.profil',
};

function aucuneBarre() {
  return null;
}

/**
 * Navigateur d'onglets. Les URL restent celles d'avant (`/home`,
 * `/parcelles`…) : le groupe `(tabs)` n'apparaît pas dans l'URL. Il ne rend
 * aucune barre, dans les deux versions : la barre du bas est portée par
 * `AppLayout`, sous la pile, pour rester affichée sur toutes les pages
 * (V2 : `BarreNavigation` ; V1 : ancienne barre). Changer d'onglet n'empile
 * jamais d'écran.
 */
export default function TabsLayout() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { version } = useVersionUi();

  return (
    <Tabs
      initialRouteName="home"
      backBehavior="firstRoute"
      tabBar={aucuneBarre}
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: version === 'v2' ? theme.couleurs.fond : colors.background.app },
      }}
    >
      {NOMS_ONGLETS.map((name) => (
        <Tabs.Screen key={name} name={name} options={{ title: t(TITRES[name]) }} />
      ))}
    </Tabs>
  );
}
