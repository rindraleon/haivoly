import React, { useMemo, useState } from 'react';
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

import { colors, radius, spacing } from '@/theme';

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
        <ChevronDown size={18} color={colors.neutral[400]} />
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
              <X size={20} color={colors.neutral[500]} />
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
                    {active ? <Check size={18} color={colors.primary[500]} /> : null}
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

const styles = StyleSheet.create({
  wrapper: { gap: 7 },
  labelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: {
    fontSize: 13.5,
    fontWeight: '600',
    color: colors.neutral[700],
    letterSpacing: -0.1,
  },
  required: { color: colors.error[500] },
  field: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1.25,
    borderColor: colors.border.strong,
    backgroundColor: colors.background.card,
  },
  fieldError: { borderColor: colors.border.error },
  fieldDisabled: { backgroundColor: colors.background.muted, opacity: 0.7 },
  valueText: { flex: 1, fontSize: 15, color: colors.neutral[900] },
  placeholderText: { flex: 1, fontSize: 15, color: colors.neutral[400] },
  hint: { fontSize: 12, color: colors.neutral[500] },
  error: { fontSize: 12, color: colors.error[500] },

  backdrop: { flex: 1, backgroundColor: colors.background.overlay },
  sheet: {
    maxHeight: '72%',
    backgroundColor: colors.background.card,
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
    borderBottomColor: colors.border.default,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.neutral[900] },
  list: { paddingHorizontal: 8 },
  empty: { padding: 24, textAlign: 'center', color: colors.neutral[500] },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: radius.md,
  },
  optionActive: { backgroundColor: colors.primary[50] },
  optionDisabled: { opacity: 0.4 },
  optionTexts: { flex: 1, gap: 2 },
  optionLabel: { fontSize: 15, color: colors.neutral[800] },
  optionLabelActive: { color: colors.primary[700], fontWeight: '600' },
  optionDescription: { fontSize: 12.5, color: colors.neutral[500] },
});

export default AppSelect;
