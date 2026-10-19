import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Check, ChevronDown, X } from 'lucide-react-native';

import { radius, spacing } from '@/theme';
import { useTheme } from '@/hooks/common/useTheme';
import type { Jetons } from '@/theme/jetons';

export interface SelectOption<T extends string = string> {
  /** Valeur réellement envoyée à l'API (identifiant technique). */
  value: T;
  /** Libellé affiché à l'utilisateur — jamais l'identifiant brut. */
  label: string;
  description?: string;
  disabled?: boolean;
}

interface AppSelectProps<T extends string = string> {
  label?: string;
  placeholder?: string;
  value: T | null | undefined;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  error?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  /** Affiche le libellé au lieu de la valeur technique (par défaut : oui). */
  emptyLabel?: string;
}

export function AppSelect<T extends string = string>({
  label,
  placeholder,
  value,
  options,
  onChange,
  error,
  hint,
  required,
  disabled,
  emptyLabel,
}: AppSelectProps<T>) {
  const { t } = useTranslation();
  const { jetons } = useTheme();
  const styles = useMemo(() => creerStyles(jetons), [jetons]);
  // Libellés par défaut résolus dans le corps, pas dans la signature (voir
  // ErrorState) : une valeur par défaut figée bloquerait la langue.
  const placeholderAffiche = placeholder ?? t('commun.placeholders.selectionner');
  const emptyLabelAffiche = emptyLabel ?? t('commun.etats.aucuneOption');
  const [open, setOpen] = useState(false);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  return (
    <View style={styles.wrapper}>
      {label ? (
        <View style={styles.labelRow}>
          {/* Label fixe au-dessus du champ : toujours visible pendant la saisie. */}
          <Text style={styles.label}>
            {label}
            {required ? <Text style={styles.required}> *</Text> : null}
          </Text>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholderAffiche}
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          error ? styles.fieldError : null,
          disabled ? styles.fieldDisabled : null,
        ]}
      >
        <Text
          numberOfLines={1}
          style={selected ? styles.valueText : styles.placeholderText}
        >
          {selected?.label ?? placeholderAffiche}
        </Text>
        <ChevronDown size={18} color={jetons.texte.discret} />
      </Pressable>

      {error ? <Text style={styles.error}>{error}</Text> : null}
      {!error && hint ? <Text style={styles.hint}>{hint}</Text> : null}

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label ?? 'Choisir'}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Fermer"
              onPress={() => setOpen(false)}
              hitSlop={10}
            >
              <X size={20} color={jetons.texte.secondaire} />
            </Pressable>
          </View>

          {options.length === 0 ? (
            <Text style={styles.empty}>{emptyLabelAffiche}</Text>
          ) : (
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={styles.list}
              renderItem={({ item }) => {
                const active = item.value === value;
                return (
                  <Pressable
                    accessibilityRole="button"
                    disabled={item.disabled}
                    onPress={() => {
                      onChange(item.value);
                      setOpen(false);
                    }}
                    style={[
                      styles.option,
                      active ? styles.optionActive : null,
                      item.disabled ? styles.optionDisabled : null,
                    ]}
                  >
                    <View style={styles.optionTexts}>
                      <Text
                        style={[styles.optionLabel, active ? styles.optionLabelActive : null]}
                      >
                        {item.label}
                      </Text>
                      {item.description ? (
                        <Text style={styles.optionDescription}>{item.description}</Text>
                      ) : null}
                    </View>
                    {active ? <Check size={18} color={jetons.primaire.base} /> : null}
                  </Pressable>
                );
              }}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

function creerStyles(jetons: Jetons) {
  return StyleSheet.create({
    wrapper: { gap: 7 },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    label: {
      fontSize: 13.5,
      fontWeight: '600',
      color: jetons.texte.principal,
      letterSpacing: -0.1,
    },
    required: { color: jetons.erreur.base },
    field: {
      minHeight: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      borderWidth: 1.25,
      borderColor: jetons.bordure.appuyee,
      backgroundColor: jetons.fond.carte,
    },
    fieldError: { borderColor: jetons.erreur.base },
    fieldDisabled: { backgroundColor: jetons.fond.attenue, opacity: 0.7 },
    valueText: { flex: 1, fontSize: 15, color: jetons.texte.principal },
    placeholderText: { flex: 1, fontSize: 15, color: jetons.texte.discret },
    hint: { fontSize: 12, color: jetons.texte.secondaire },
    error: { fontSize: 12, color: jetons.erreur.base },

    backdrop: { flex: 1, backgroundColor: jetons.fond.superposition },
    sheet: {
      maxHeight: '72%',
      backgroundColor: jetons.fond.carte,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      paddingBottom: spacing.xl ?? 24,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: jetons.bordure.defaut,
    },
    sheetTitle: { fontSize: 16, fontWeight: '700', color: jetons.texte.principal },
    list: { paddingHorizontal: 8 },
    empty: { padding: 24, textAlign: 'center', color: jetons.texte.secondaire },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: radius.md,
    },
    optionActive: { backgroundColor: jetons.primaire.clair },
    optionDisabled: { opacity: 0.4 },
    optionTexts: { flex: 1, gap: 2 },
    optionLabel: { fontSize: 15, color: jetons.texte.principal },
    optionLabelActive: { color: jetons.primaire.base, fontWeight: '600' },
    optionDescription: { fontSize: 12.5, color: jetons.texte.secondaire },
  });
}

export default AppSelect;
