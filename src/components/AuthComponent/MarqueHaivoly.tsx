import { Image, StyleSheet, View, type ViewStyle } from 'react-native';

export interface MarqueHaivolyProps {
  /** Côté du logo (image carrée) en px. */
  taille?: number;
  testID?: string;
  style?: ViewStyle;
}

export function MarqueHaivoly({
  taille = 150,
  testID = 'logo-haivoly',
  style,
}: Readonly<MarqueHaivolyProps>) {
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
