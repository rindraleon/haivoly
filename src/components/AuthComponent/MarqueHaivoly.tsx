import { Image, StyleSheet, View } from 'react-native';

export interface MarqueHaivolyProps {
  /** Côté du logo (image carrée) en px, hors cadre blanc. */
  taille?: number;
  testID?: string;
}

/**
 * Logo officiel Haivoly (lot 8) : symbole, wordmark et signature sur fond
 * transparent, posés sur une carte blanche pour rester lisibles sur les
 * bandeaux colorés des écrans d'authentification (clair et sombre).
 */
export function MarqueHaivoly({ taille = 150, testID = 'logo-haivoly' }: MarqueHaivolyProps) {
  return (
    <View style={styles.cadre} testID={testID}>
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
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
