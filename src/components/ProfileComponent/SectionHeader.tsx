/**
 * Sous-composant `SectionHeader` extrait de `ProfilScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { Text, View } from 'react-native';
import { styles } from '@/screens/ProfileScreen/ProfilScreen.styles';

export function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <View
      style={
        styles.sectionHeader
      }
    >
      <View>
        <Text
          style={
            styles.sectionTitle
          }
        >
          {title}
        </Text>

        <Text
          style={
            styles.sectionSubtitle
          }
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}
