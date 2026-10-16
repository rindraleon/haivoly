import { router, usePathname, useRootNavigationState } from 'expo-router';
import { ClipboardList, House, MapPinned, Sprout, User, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { useNombreNonLues } from '@/hooks';
import { BottomTabBar, type OngletBarre } from '@/ui';

import {
  NOMS_ONGLETS,
  actionPourOnglet,
  positionOnglets,
  type EtatNavigation,
  type NomOnglet,
} from './navigationOnglets';

const ONGLETS: Readonly<Record<NomOnglet, { cle: string; icone: LucideIcon }>> = {
  home: { cle: 'navigation.accueil', icone: House },
  parcelles: { cle: 'navigation.parcelles', icone: MapPinned },
  cultures: { cle: 'navigation.cultures', icone: Sprout },
  observations: { cle: 'navigation.suivi', icone: ClipboardList },
  profil: { cle: 'navigation.profil', icone: User },
};

/**
 * Barre d'onglets permanente de l'espace connecté (V2), rendue une seule fois
 * par `AppLayout` sous la pile : visible sur toutes les pages, immobile pendant
 * les transitions. L'onglet « Accueil » porte le nombre de recommandations non
 * lues : une recommandation envoyée depuis le web se voit depuis n'importe
 * quelle page (les notifications s'ouvrent depuis l'accueil).
 */
export function BarreNavigation() {
  const { t } = useTranslation();
  const chemin = usePathname();
  const racine = useRootNavigationState() as EtatNavigation | undefined;
  const nonLues = useNombreNonLues(chemin);
  const position = positionOnglets(racine, chemin);

  const onglets: OngletBarre<NomOnglet>[] = NOMS_ONGLETS.map((nom, index) => {
    const libelle = t(ONGLETS[nom].cle);
    const badge = nom === 'home' ? nonLues : null;
    const lecture = t('navigation.ongletPosition', { nom: libelle, position: index + 1, total: NOMS_ONGLETS.length });
    return {
      cle: nom,
      libelle,
      icone: ONGLETS[nom].icone,
      badge,
      accessibilityLabel: badge ? `${lecture}, ${t('navigation.nonLues', { count: badge })}` : lecture,
      testID: `onglet-${nom}`,
    };
  });

  const selectionner = (cible: NomOnglet) => {
    const action = actionPourOnglet(cible, position);
    if (action.type === 'changer') router.navigate(action.href);
    // Dépile jusqu'au navigateur d'onglets resté sous la pile, puis affiche la
    // cible (React Navigation `popTo` + paramètre `screen` imbriqué).
    if (action.type === 'revenir') router.dismissTo(action.href);
  };

  return <BottomTabBar onglets={onglets} actif={position.onglet} onSelect={selectionner} testID="barre-onglets" />;
}
