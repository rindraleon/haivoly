import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text, Touchable, couleursDeTon, useTheme, type Ton } from '@/ui';

export interface Raccourci {
  cle: string;
  libelle: string;
  icone: LucideIcon;
  ton: Ton;
  onPress: () => void;
}

/** Grille 2 × 2 d'actions fréquentes (≤ 3 taps jusqu'à la saisie), icône au-dessus du libellé. */
export function Raccourcis({ elements }: { elements: readonly Raccourci[] }) {
  const theme = useTheme();
  return (
    <View style={styles.grille}>
      {elements.map(({ cle, libelle, icone: Icone, ton, onPress }) => {
        const couleurs = couleursDeTon(theme.couleurs, ton);
        return (
          <Touchable
            key={cle}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={libelle}
            testID={`raccourci-${cle}`}
            style={[
              styles.tuile,
              {
                backgroundColor: theme.couleurs.surface,
                borderColor: theme.couleurs.bordure,
                borderRadius: theme.rayon.lg,
                boxShadow: theme.ombres.carte,
              },
            ]}
          >
            <View style={[styles.icone, { backgroundColor: couleurs.conteneur, borderRadius: theme.rayon.sm }]}>
              <Icone size={20} color={couleurs.surConteneur} strokeWidth={2.2} />
            </View>
            <Text variant="label" numberOfLines={2}>
              {libelle}
            </Text>
          </Touchable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  // Icône au-dessus du libellé : les mots longs (« Interventions », « Fanaraha-maso »)
  // disposent de toute la largeur de la tuile.
  tuile: {
    flexBasis: '47%',
    flexGrow: 1,
    minHeight: 96,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
    gap: 10,
  },
  icone: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
});
