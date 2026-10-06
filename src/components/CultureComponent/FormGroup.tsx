/**
 * Sous-composant `FormGroup` extrait de `CultureCreateScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { Text, View } from 'react-native';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';

export function FormGroup({
  icon,
  label,
  required = false,
  helper,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={styles.formGroup}
    >
      <View
        style={styles.labelRow}
      >
        {icon}

        <Text
          style={styles.label}
        >
          {label}
        </Text>

        {required ? (
          <Text
            style={styles.required}
          >
            *
          </Text>
        ) : null}
      </View>

      {children}

      {helper ? (
        <Text
          style={styles.helperText}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}
