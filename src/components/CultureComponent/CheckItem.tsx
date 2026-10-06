/**
 * Sous-composant `CheckItem` extrait de `CultureCreateScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';

export function CheckItem({
  label,
  checked,
  last = false,
}: {
  label: string;
  checked: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.checkItem,
        !last &&
          styles.checkItemBorder,
      ]}
    >
      <View
        style={[
          styles.checkItemIcon,
          checked
            ? styles.checkItemIconChecked
            : styles.checkItemIconEmpty,
        ]}
      >
        {checked ? (
          <Check
            size={13}
            color="#FFFFFF"
            strokeWidth={3}
          />
        ) : null}
      </View>

      <Text
        style={[
          styles.checkItemText,
          checked &&
            styles.checkItemTextChecked,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}
