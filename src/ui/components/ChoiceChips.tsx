import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';
import { useFormScroll } from '../layout/FormScrollContext';

export interface ChoiceOption<T extends string> {
  value: T;
  label: string;
}

export interface ChoiceChipsProps<T extends string> {
  label?: string;
  options: readonly ChoiceOption<T>[];
  value: T | null;
  onChange: (valeur: T) => void;
  required?: boolean;
  error?: string;
  testID?: string;
}

export interface ChoiceChipsHandle {
  /** Appelé par react-hook-form pour amener le groupe à l'écran en cas d'erreur. */
  focus: () => void;
}

/**
 * Choix unique en puces (unités, filtres « Toutes / En croissance / Prêt à
 * récolter / Alerte »). Plus rapide qu'une liste déroulante : 1 tap.
 */
function ChoiceChipsInterne<T extends string>(
  { label, options, value, onChange, required, error, testID }: ChoiceChipsProps<T>,
  ref: React.ForwardedRef<ChoiceChipsHandle>,
) {
  const theme = useTheme();
  const { couleurs } = theme;
  const conteneur = useRef<View>(null);
  const scroll = useFormScroll();

  useImperativeHandle(ref, () => ({
    focus: () => scroll?.assurerVisible(conteneur.current),
  }));

  return (
    <View ref={conteneur} collapsable={false} style={styles.groupe} testID={testID}>
      {label ? (
        <Text variant="label">
          {label}
          {required ? <Text variant="label" color="erreurTexte"> *</Text> : null}
        </Text>
      ) : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={label} style={styles.puces}>
        {options.map((option) => {
          const actif = option.value === value;
          return (
            <Touchable
              key={option.value}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              aria-checked={actif}
              accessibilityLabel={option.label}
              feedback="opacity"
              style={[
                styles.puce,
                {
                  borderRadius: theme.rayon.md,
                  backgroundColor: actif ? couleurs.primaire : couleurs.surface,
                  borderColor: actif ? couleurs.primaire : error ? couleurs.erreur : couleurs.bordureChamp,
                },
              ]}
            >
              {actif ? <Check size={14} color={couleurs.surPrimaire} strokeWidth={2.6} /> : null}
              <Text variant="label" style={{ color: actif ? couleurs.surPrimaire : couleurs.texte }}>
                {option.label}
              </Text>
            </Touchable>
          );
        })}
      </View>
      {error ? (
        <Text variant="caption" color="erreurTexte" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export const ChoiceChips = forwardRef(ChoiceChipsInterne) as <T extends string>(
  props: ChoiceChipsProps<T> & { ref?: React.Ref<ChoiceChipsHandle> },
) => React.ReactElement;

const styles = StyleSheet.create({
  groupe: { gap: 8 },
  puces: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  puce: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
