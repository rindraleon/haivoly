import { View } from 'react-native';
import { styles } from '@/screens/ProfileScreen/ProfilScreen.styles';

export function AgricultureBackground() {
  return (
    <View
      style={
        styles.backgroundLayer
      }
      pointerEvents="none"
    >
      <View
        style={[
          styles.fieldShape,
          styles.fieldShapeOne,
        ]}
      />

      <View
        style={[
          styles.fieldShape,
          styles.fieldShapeTwo,
        ]}
      />

      <View
        style={[
          styles.fieldShape,
          styles.fieldShapeThree,
        ]}
      />

      <View
        style={[
          styles.fieldLine,
          styles.fieldLineOne,
        ]}
      />

      <View
        style={[
          styles.fieldLine,
          styles.fieldLineTwo,
        ]}
      />

      <View
        style={
          styles.fieldLineThree
        }
      />
    </View>
  );
}
