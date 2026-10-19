import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

export interface MarqueHaivolyProps {
  /** Côté du logo (image carrée) en px. */
  taille?: number;
  testID?: string;
  style?: ViewStyle;
}

/**
 * Logo officiel Haivoly — fichier PNG à ellipse réelle (canal alpha) affiché
 * tel quel, **sans fond blanc, cadre ni bloc de couleur** : il se pose
 * directement sur le fond des écrans (clair comme sombre, le logo étant
 * entièrement vert il reste lisible sur les teintes claires ou moyennes).
 * Règle d'affichage unique du projet : proportions préservées via `contain`,
 * aucune copie modifiée du fichier.
 */
export function MarqueHaivoly({
  taille = 150,
  testID = 'logo-haivoly',
  style,
}: MarqueHaivolyProps) {
  return (
    <View style={[styles.cadre, { width: taille, height: taille }, style]} testID={testID}>
      <Image
        source={require('../../../assets/images/logo-haivoly.png')}
        style={{ width: taille, height: taille }}
        resizeMode="contain"
        accessibilityLabel="Haivoly"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cadre: {
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
