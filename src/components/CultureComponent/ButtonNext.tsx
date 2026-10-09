import { ChevronRight } from 'lucide-react-native';
import { Text, TouchableOpacity, View } from 'react-native';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';

export function ButtonNext({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.nextButton}
      onPress={onPress}
    >
      <Text
        style={
          styles.nextButtonText
        }
      >
        {label}
      </Text>

      <View
        style={
          styles.nextButtonIcon
        }
      >
        <ChevronRight
          size={18}
          color="#FFFFFF"
        />
      </View>
    </TouchableOpacity>
  );
}
