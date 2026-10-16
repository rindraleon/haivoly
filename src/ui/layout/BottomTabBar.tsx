import type { LucideIcon } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';
import { useClavier } from './useClavier';

export interface OngletBarre<C extends string = string> {
  cle: C;
  libelle: string;
  icone: LucideIcon;
  /** Pastille (non lues…) : masquée si absente, nulle ou vide. */
  badge?: number | null;
  /** Libellé complet lu par les lecteurs d'écran (position, non lues). */
  accessibilityLabel?: string;
  testID?: string;
}

export interface BottomTabBarProps<C extends string = string> {
  onglets: readonly OngletBarre<C>[];
  /** Onglet en surbrillance ; `null` = aucun. */
  actif: C | null;
  onSelect: (cle: C) => void;
  testID?: string;
}

/** Pastille lisible : au-delà de 99, « 99+ ». */
export function texteBadge(badge: number | null | undefined): string | null {
  if (badge == null || !Number.isFinite(badge) || badge <= 0) return null;
  return badge > 99 ? '99+' : String(Math.floor(badge));
}

/**
 * Barre d'onglets V2 : 5 destinations, pastille active, badge, libellés
 * toujours visibles, rôle « tab » et position annoncée aux lecteurs d'écran.
 * Indépendante du navigateur : la coque (`features/shell`) la rend une seule
 * fois sous la pile, elle reste donc affichée sur TOUTES les pages (détails,
 * formulaires, notifications) et ne bouge pas pendant les transitions.
 * Masquée quand le clavier est ouvert sur Android : le bouton « Enregistrer »
 * des formulaires reste ainsi collé au clavier.
 */
export function BottomTabBar<C extends string>({ onglets, actif, onSelect, testID }: BottomTabBarProps<C>) {
  const theme = useTheme();
  const { couleurs } = theme;
  const insets = useSafeAreaInsets();
  const clavier = useClavier();

  if (clavier.visible && Platform.OS === 'android') return null;

  return (
    <View
      accessibilityRole="tablist"
      testID={testID}
      style={[
        styles.barre,
        {
          backgroundColor: couleurs.surface,
          borderTopColor: couleurs.bordure,
          boxShadow: theme.ombres.barre,
          paddingBottom: Math.max(insets.bottom, theme.espace.sm),
        },
      ]}
    >
      {onglets.map(({ cle, libelle, icone: Icone, badge, accessibilityLabel, testID: idOnglet }) => {
        const estActif = actif === cle;
        const couleur = estActif ? couleurs.surPrimaireConteneur : couleurs.texteSecondaire;
        const pastille = texteBadge(badge);

        return (
          <Touchable
            key={cle}
            onPress={() => onSelect(cle)}
            feedback="opacity"
            accessibilityRole="tab"
            aria-selected={estActif}
            accessibilityLabel={accessibilityLabel ?? libelle}
            testID={idOnglet}
            style={styles.onglet}
          >
            <View
              style={[
                styles.pastille,
                { borderRadius: theme.rayon.pill },
                estActif ? { backgroundColor: couleurs.primaireConteneur } : null,
              ]}
            >
              <Icone color={couleur} size={22} strokeWidth={estActif ? 2.4 : 2} />
              {pastille ? (
                <View
                  style={[styles.badge, { backgroundColor: couleurs.erreurFonce, borderColor: couleurs.surface }]}
                  testID={idOnglet ? `${idOnglet}-badge` : undefined}
                >
                  <Text variant="micro" style={{ color: couleurs.surErreurFonce }} tabular>
                    {pastille}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text
              variant="caption"
              numberOfLines={1}
              maxFontSizeMultiplier={1.3}
              style={{ color: estActif ? couleurs.primaire : couleurs.texteSecondaire }}
            >
              {libelle}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  barre: {
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  onglet: { flex: 1, alignItems: 'center', gap: 4, minHeight: 52 },
  pastille: { width: 56, height: 32, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute',
    top: -2,
    right: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
