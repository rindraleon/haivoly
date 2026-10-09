import DateTimePicker, {
  DateTimePickerAndroid,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/CommonComponent/Button';
import { Input } from '@/components/CommonComponent/Input';
import { colors, radius, spacing } from '@/theme';
import { dateOnlyVersDateLocale, toDateOnly } from '@/utils/date';

type Props = {
  label?: string;
  value: string;
  onChange: (valeur: string) => void;
  required?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  placeholder?: string;
  minimumDate?: Date;
  maximumDate?: Date;
};

export function DateInput({
  label,
  value,
  onChange,
  required,
  hint,
  error,
  disabled,
  leftIcon,
  placeholder = 'Sélectionner une date',
  minimumDate,
  maximumDate,
}: Props) {
  const [pickerVisible, setPickerVisible] = useState(false);
  const initiale = dateOnlyVersDateLocale(value) ?? new Date();

  const appliquer = (date: Date | undefined) => {
    if (!date) return;
    const suivante = toDateOnly(date);
    if (suivante) onChange(suivante);
  };

  const ouvrir = () => {
    if (disabled) return;

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: initiale,
        mode: 'date',
        is24Hour: true,
        minimumDate,
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set') appliquer(date);
        },
      });
      return;
    }

    setPickerVisible(true);
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
            value={value}
            placeholder={placeholder}
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
              <Text style={styles.title}>{label ?? 'Choisir une date'}</Text>

              <DateTimePicker
                value={initiale}
                mode="date"
                display="spinner"
                locale="fr-FR"
                minimumDate={minimumDate}
                maximumDate={maximumDate}
                onChange={(_event, date) => appliquer(date)}
              />

              <View style={styles.actions}>
                <Button
                  variant="primary"
                  fullWidth
                  onPress={() => setPickerVisible(false)}
                >
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
