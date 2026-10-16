import { CircleAlert, type LucideIcon } from 'lucide-react-native';
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { styleTypo } from '../tokens';
import { useFormScroll } from '../layout/FormScrollContext';

export interface FormInputProps extends Omit<TextInputProps, 'style' | 'editable'> {
  label: string;
  required?: boolean;
  /** Aide sous le champ (masquée quand une erreur est affichée). */
  helper?: string;
  error?: string;
  /** Unité affichée à droite : « kg », « Ar »… */
  suffix?: string;
  icon?: LucideIcon;
  disabled?: boolean;
  testID?: string;
}

/**
 * Champ de saisie V2 : libellé visible, états focus/erreur/désactivé, unité,
 * annonce d'erreur, et remontée automatique au-dessus du clavier dans un
 * `FormScreen`. Le `ref` expose l'instance `TextInput` (react-hook-form
 * l'utilise pour focaliser la première erreur).
 */
export const FormInput = forwardRef<TextInput, FormInputProps>(function FormInput(
  { label, required, helper, error, suffix, icon: Icone, disabled, multiline, onFocus, onBlur, testID, ...rest },
  ref,
) {
  const theme = useTheme();
  const { couleurs } = theme;
  const { t } = useTranslation();
  const scroll = useFormScroll();
  const champ = useRef<TextInput>(null);
  const [focus, setFocus] = useState(false);

  useImperativeHandle(ref, () => champ.current as TextInput);

  const surFocus: NonNullable<TextInputProps['onFocus']> = (event) => {
    setFocus(true);
    scroll?.surFocus(champ.current);
    onFocus?.(event);
  };
  const surBlur: NonNullable<TextInputProps['onBlur']> = (event) => {
    setFocus(false);
    scroll?.surBlur(champ.current);
    onBlur?.(event);
  };

  const couleurBordure = error ? couleurs.erreur : focus ? couleurs.primaire : couleurs.bordureChamp;
  const libelleAccessible = required ? `${label}, ${t('formulaire.obligatoire')}` : label;

  return (
    <View style={styles.groupe} testID={testID}>
      <Text variant="label" importantForAccessibility="no">
        {label}
        {required ? <Text variant="label" color="erreurTexte"> *</Text> : null}
      </Text>

      <View
        style={[
          styles.cadre,
          multiline ? styles.cadreMultiligne : null,
          {
            borderColor: couleurBordure,
            borderWidth: focus || error ? 2 : 1.5,
            borderRadius: theme.rayon.md,
            backgroundColor: disabled ? couleurs.surfaceAlt : couleurs.surface,
            boxShadow: focus && !error ? theme.ombres.focus : undefined,
          },
        ]}
      >
        {Icone ? <Icone size={18} color={couleurs.texteSecondaire} style={styles.icone} /> : null}
        <TextInput
          ref={champ}
          {...rest}
          multiline={multiline}
          editable={!disabled}
          onFocus={surFocus}
          onBlur={surBlur}
          accessibilityLabel={libelleAccessible}
          accessibilityHint={error ?? helper}
          aria-disabled={disabled}
          placeholderTextColor={couleurs.texteTertiaire}
          selectionColor={couleurs.primaire}
          cursorColor={couleurs.primaire}
          style={[
            styleTypo('body'),
            styles.saisie,
            multiline ? styles.saisieMultiligne : null,
            { color: couleurs.texte },
          ]}
        />
        {suffix ? (
          <Text variant="label" color="texteSecondaire" style={styles.suffixe}>
            {suffix}
          </Text>
        ) : null}
      </View>

      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <CircleAlert size={14} color={couleurs.erreurTexte} />
          <Text variant="caption" color="erreurTexte" style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : helper ? (
        <Text variant="caption" color="texteSecondaire" importantForAccessibility="no">
          {helper}
        </Text>
      ) : null}
    </View>
  );
});

const styles = StyleSheet.create({
  groupe: { gap: 6 },
  cadre: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14 },
  cadreMultiligne: { minHeight: 112, alignItems: 'flex-start', paddingVertical: 10 },
  icone: { marginRight: 10 },
  saisie: { flex: 1, paddingVertical: 12 },
  saisieMultiligne: { minHeight: 90, textAlignVertical: 'top', paddingVertical: 2 },
  suffixe: { marginLeft: 8 },
  message: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  flex: { flex: 1 },
});
