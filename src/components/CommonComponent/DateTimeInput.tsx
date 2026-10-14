import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useTranslation } from 'react-i18next';
import React, { useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/CommonComponent/Button';
import { Input } from '@/components/CommonComponent/Input';
import { colors, radius, spacing } from '@/theme';
import { formatDateTime } from '@/utils/date';
import { i18n } from '@/i18n/instance';

type Props = {
  label?: string;
  /** Instant ISO-8601 (`2026-10-01T08:30:00.000Z`) ou chaîne vide. */
  value: string;
  onChange: (valeur: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  placeholder?: string;
};

/** Instant exploitable : la valeur reçue, sinon maintenant. */
function instantDepart(valeur: string): Date {
  if (valeur) {
    const date = new Date(valeur);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

/** Copie de `base` en remplaçant le jour (mois, année) par ceux de `jour`. */
function avecLeJour(base: Date, jour: Date): Date {
  const fusion = new Date(base);
  fusion.setFullYear(jour.getFullYear(), jour.getMonth(), jour.getDate());
  return fusion;
}

/** Copie de `base` en remplaçant les heures et minutes par celles de `heure`. */
function avecLHeure(base: Date, heure: Date): Date {
  const fusion = new Date(base);
  fusion.setHours(heure.getHours(), heure.getMinutes(), 0, 0);
  return fusion;
}

export function DateTimeInput({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
  leftIcon,
  placeholder,
}: Props) {
  const { t } = useTranslation();
  const placeholderAffiche = placeholder ?? t('commun.placeholders.selectionnerDateHeure');
  const [pickerVisible, setPickerVisible] = useState(false);
  const [brouillon, setBrouillon] = useState<Date | null>(null);

  const initiale = useMemo(() => instantDepart(value), [value]);

  const affiche = useMemo(() => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return formatDateTime(date);
  }, [value]);

  const ouvrir = () => {
    if (disabled) return;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initiale,
        mode: 'date',
        is24Hour: true,
        onChange: (evenement, jour) => {
          if (evenement.type !== 'set' || !jour) return;

          const avecJour = avecLeJour(initiale, jour);

          DateTimePickerAndroid.open({
            value: avecJour,
            mode: 'time',
            is24Hour: true,
            onChange: (evenementHeure, heure) => {
              const finale =
                evenementHeure.type === 'set' && heure
                  ? avecLHeure(avecJour, heure)
                  : avecJour;
              onChange(finale.toISOString());
            },
          });
        },
      });
      return;
    }

    setBrouillon(initiale);
    setPickerVisible(true);
  };

  const valider = () => {
    if (brouillon) onChange(brouillon.toISOString());
    setPickerVisible(false);
  };

  return (
    <>
      <Pressable onPress={ouvrir} disabled={disabled}>
        <View pointerEvents="none">
          <Input
            label={label}
            required={required}
            hint={hint}
            error={error}
            leftIcon={leftIcon}
            editable={false}
            value={affiche}
            placeholder={placeholderAffiche}
          />
        </View>
      </Pressable>

      {Platform.OS === 'ios' && (
        <Modal
          visible={pickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setPickerVisible(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <Text style={styles.title}>{label ?? i18n.t('domaine.choisirDate')}</Text>

              <DateTimePicker
                value={brouillon ?? initiale}
                mode="date"
                display="spinner"
                locale="fr-FR"
                onChange={(_evenement, jour) => {
                  if (jour) setBrouillon((precedent) => avecLeJour(precedent ?? jour, jour));
                }}
              />

              <DateTimePicker
                value={brouillon ?? initiale}
                mode="time"
                display="spinner"
                is24Hour
                locale="fr-FR"
                onChange={(_evenement, heure) => {
                  if (heure) setBrouillon((precedent) => avecLHeure(precedent ?? heure, heure));
                }}
              />

              <View style={styles.actions}>
                <Button variant="primary" fullWidth onPress={valider}>
                  Terminé
                </Button>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.neutral[0],
    borderRadius: radius.lg,
    padding: spacing.lg,
    width: '100%',
  },
  title: {
    color: colors.neutral[800],
    fontSize: 16,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  actions: {
    marginTop: spacing.md,
  },
});

export default DateTimeInput;
