import { ScrollView, StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';

export interface FilterChipOption<T extends string> {
  value: T;
  label: string;
  /** Effectif affiché dans la puce (masqué si non fourni). */
  count?: number;
}

export interface FilterChipsProps<T extends string> {
  options: readonly FilterChipOption<T>[];
  value: T;
  onChange: (valeur: T) => void;
  /** Nom du groupe pour les lecteurs d'écran (ex. « Filtrer les parcelles »). */
  accessibilityLabel: string;
  /**
   * Marge horizontale de l'écran : la rangée défile bord à bord tout en
   * restant alignée sur le contenu au repos.
   */
  inset?: number;
  testID?: string;
}

/**
 * Puces de filtre de liste (« Toutes », « Actives », « À délimiter »…) :
 * une rangée défilante, sélection unique, effectif par puce. L'état choisi
 * est porté par la couleur ET une coche, jamais par la couleur seule.
 */
export function FilterChips<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  inset = 0,
  testID,
}: FilterChipsProps<T>) {
  const theme = useTheme();
  const { couleurs } = theme;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      style={{ marginHorizontal: -inset, flexGrow: 0, flexShrink: 0 }}
      contentContainerStyle={[styles.rangee, { paddingHorizontal: inset }]}
      testID={testID}
    >
      <View accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel} style={styles.rangee}>
        {options.map((option) => {
          const actif = option.value === value;
          const avecCompteur = typeof option.count === 'number';
          return (
            <Touchable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              aria-checked={actif}
              accessibilityLabel={avecCompteur ? `${option.label}, ${option.count}` : option.label}
              feedback="opacity"
              testID={testID ? `${testID}-${option.value}` : undefined}
              style={[
                styles.puce,
                {
                  borderRadius: theme.rayon.md,
                  backgroundColor: actif ? couleurs.primaire : couleurs.surface,
                  borderColor: actif ? couleurs.primaire : couleurs.bordure,
                },
              ]}
            >
              {actif ? <Check size={14} color={couleurs.surPrimaire} strokeWidth={2.6} /> : null}
              <Text variant="label" style={{ color: actif ? couleurs.surPrimaire : couleurs.texte }}>
                {option.label}
              </Text>
              {avecCompteur ? (
                <View
                  style={[
                    styles.compteur,
                    {
                      borderRadius: theme.rayon.md,
                      backgroundColor: actif ? couleurs.surPrimaire : couleurs.surfaceAlt,
                    },
                  ]}
                >
                  <Text variant="micro" tabular style={{ color: actif ? couleurs.primaire : couleurs.texteSecondaire }}>
                    {option.count}
                  </Text>
                </View>
              ) : null}
            </Touchable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  rangee: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  puce: {
    minHeight: 44,
    alignSelf: 'center',
    paddingLeft: 14,
    paddingRight: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  compteur: { minWidth: 22, paddingHorizontal: 6, paddingVertical: 1, alignItems: 'center' },
});
