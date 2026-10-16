import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { CalendarDays, CircleAlert } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { dateOnlyVersDateLocale, formatDate, toDateOnly } from '@/utils/date';

import { Text, Touchable } from '../primitives';
import { useTheme } from '../theme';
import { useFormScroll } from '../layout/FormScrollContext';
import { PrimaryButton } from './PrimaryButton';

export interface DateFieldProps {
  label: string;
  /** Date calendaire `YYYY-MM-DD` (envoyée telle quelle, jamais convertie). */
  value: string;
  onChange: (valeur: string) => void;
  placeholder: string;
  /** Libellé du bouton de validation de la feuille iOS. */
  doneLabel: string;
  /** Indication lue par le lecteur d'écran (ex. « Touchez deux fois pour modifier »). */
  changeHint: string;
  required?: boolean;
  error?: string;
  helper?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  /** Locale du calendrier iOS (ex. `fr-FR`). */
  locale?: string;
  testID?: string;
}

export interface DateFieldHandle {
  focus: () => void;
}

/** Sélecteur de date natif : boîte de dialogue Android, feuille inférieure iOS. */
export const DateField = forwardRef<DateFieldHandle, DateFieldProps>(function DateField(
  {
    label,
    value,
    onChange,
    placeholder,
    doneLabel,
    changeHint,
    required,
    error,
    helper,
    minimumDate,
    maximumDate,
    locale = 'fr-FR',
    testID,
  },
  ref,
) {
  const theme = useTheme();
  const { couleurs } = theme;
  const insets = useSafeAreaInsets();
  const scroll = useFormScroll();
  const conteneur = useRef<View>(null);
  const [feuilleVisible, setFeuilleVisible] = useState(false);

  useImperativeHandle(ref, () => ({ focus: () => scroll?.assurerVisible(conteneur.current) }));

  const dateCourante = dateOnlyVersDateLocale(value) ?? new Date();
  const valeurLisible = value ? formatDate(value) : placeholder;

  const appliquer = (date: Date | undefined) => {
    const suivante = date ? toDateOnly(date) : null;
    if (suivante) onChange(suivante);
  };

  const ouvrir = () => {
    scroll?.assurerVisible(conteneur.current);
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: dateCourante,
        mode: 'date',
        minimumDate,
        maximumDate,
        onChange: (event, date) => {
          if (event.type === 'set') appliquer(date);
        },
      });
      return;
    }
    setFeuilleVisible(true);
  };

  return (
    <View ref={conteneur} collapsable={false} style={styles.groupe} testID={testID}>
      <Text variant="label" importantForAccessibility="no">
        {label}
        {required ? <Text variant="label" color="erreurTexte"> *</Text> : null}
      </Text>

      {Platform.OS === 'web' ? (
        // Web : pas de sélecteur natif — champ date HTML équivalent (AAAA-MM-JJ),
        // même validation et mêmes erreurs que les sélecteurs mobiles.
        <TextInput
          {...({ type: 'date' } as Record<string, string>)}
          value={value}
          onChangeText={(texte) => {
            if (texte === '' || /^\d{4}-\d{2}-\d{2}$/.test(texte)) onChange(texte);
          }}
          onFocus={() => scroll?.assurerVisible(conteneur.current)}
          accessibilityLabel={`${label}, ${valeurLisible}`}
          accessibilityHint={error ?? changeHint}
          style={[
            styles.cadre,
            styles.saisieWeb,
            {
              borderRadius: theme.rayon.md,
              borderColor: error ? couleurs.erreur : couleurs.bordureChamp,
              borderWidth: error ? 2 : 1.5,
              backgroundColor: couleurs.surface,
              color: value ? couleurs.texte : couleurs.texteTertiaire,
            },
          ]}
        />
      ) : (
        <Touchable
          onPress={ouvrir}
          feedback="opacity"
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${valeurLisible}`}
          accessibilityHint={error ?? changeHint}
          style={[
            styles.cadre,
            {
              borderRadius: theme.rayon.md,
              borderColor: error ? couleurs.erreur : couleurs.bordureChamp,
              borderWidth: error ? 2 : 1.5,
              backgroundColor: couleurs.surface,
            },
          ]}
        >
          <CalendarDays size={18} color={couleurs.texteSecondaire} />
          <Text variant="body" color={value ? 'texte' : 'texteTertiaire'} tabular style={styles.flex}>
            {valeurLisible}
          </Text>
        </Touchable>
      )}

      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <CircleAlert size={14} color={couleurs.erreurTexte} />
          <Text variant="caption" color="erreurTexte" style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="caption" color="texteSecondaire">
          {helper}
        </Text>
      ) : null}

      {Platform.OS === 'ios' ? (
        <Modal
          visible={feuilleVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setFeuilleVisible(false)}
        >
          <Pressable
            style={[styles.voile, { backgroundColor: couleurs.superposition }]}
            onPress={() => setFeuilleVisible(false)}
            accessibilityRole="button"
            accessibilityLabel={doneLabel}
          />
          <View
            style={[
              styles.feuille,
              {
                backgroundColor: couleurs.surface,
                borderTopLeftRadius: theme.rayon.xxl,
                borderTopRightRadius: theme.rayon.xxl,
                paddingBottom: Math.max(insets.bottom, 16),
              },
            ]}
          >
            <Text variant="h3" accessibilityRole="header">
              {label}
            </Text>
            <DateTimePicker
              value={dateCourante}
              mode="date"
              display="inline"
              locale={locale}
              accentColor={couleurs.primaire}
              minimumDate={minimumDate}
              maximumDate={maximumDate}
              onChange={(_event, date) => appliquer(date)}
            />
            <PrimaryButton label={doneLabel} onPress={() => setFeuilleVisible(false)} fullWidth />
          </View>
        </Modal>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  groupe: { gap: 6 },
  saisieWeb: { height: 52, paddingHorizontal: 12, fontSize: 15 } as const,
  cadre: { minHeight: 52, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  flex: { flex: 1 },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  voile: { flex: 1 },
  feuille: { paddingHorizontal: 20, paddingTop: 20, gap: 12 },
});
