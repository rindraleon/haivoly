import { useRef, useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { Touchable } from '../primitives';
import { useTheme } from '../theme';
import { styleTypo } from '../tokens';

export interface SearchFieldProps {
  value: string;
  onChangeText: (texte: string) => void;
  placeholder: string;
  /** Nom accessible du champ (le placeholder n'en tient pas lieu). */
  accessibilityLabel: string;
  /** Libellé du bouton d'effacement (ex. « Effacer la recherche »). */
  clearLabel: string;
  testID?: string;
}

/**
 * Champ de recherche de liste : icône, effacement en un tap, touche
 * « Rechercher » du clavier qui ferme le clavier. Hauteur 48 dp.
 */
export function SearchField({ value, onChangeText, placeholder, accessibilityLabel, clearLabel, testID }: SearchFieldProps) {
  const theme = useTheme();
  const { couleurs } = theme;
  const champ = useRef<TextInput>(null);
  const [focus, setFocus] = useState(false);

  return (
    <View
      style={[
        styles.cadre,
        {
          borderRadius: theme.rayon.md,
          backgroundColor: couleurs.surface,
          borderColor: focus ? couleurs.primaire : couleurs.bordure,
          borderWidth: focus ? 2 : 1,
          boxShadow: focus ? theme.ombres.focus : undefined,
        },
      ]}
    >
      <Search size={18} color={couleurs.texteSecondaire} />
      <TextInput
        ref={champ}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={couleurs.texteTertiaire}
        selectionColor={couleurs.primaire}
        cursorColor={couleurs.primaire}
        accessibilityLabel={accessibilityLabel}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="never"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        onSubmitEditing={() => champ.current?.blur()}
        testID={testID}
        style={[styleTypo('body'), styles.saisie, { color: couleurs.texte }]}
      />
      {value.length > 0 ? (
        <Touchable
          onPress={() => {
            onChangeText('');
            champ.current?.focus();
          }}
          accessibilityRole="button"
          accessibilityLabel={clearLabel}
          feedback="opacity"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.effacer, { borderRadius: theme.rayon.pill, backgroundColor: couleurs.surfaceAlt }]}
          testID={testID ? `${testID}-effacer` : undefined}
        >
          <X size={14} color={couleurs.texteSecondaire} strokeWidth={2.4} />
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: { minHeight: 48, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 10 },
  saisie: { flex: 1, paddingVertical: 10 },
  effacer: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
});
