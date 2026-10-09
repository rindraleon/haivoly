import { Text, View } from 'react-native';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';

export function ReviewRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueStyle?: any;
}) {
  return (
    <View
      style={styles.reviewRow}
    >
      <View
        style={styles.reviewRowLeft}
      >
        <View
          style={styles.reviewRowIcon}
        >
          {icon}
        </View>

        <Text
          style={styles.reviewRowLabel}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.reviewRowValue,
          valueStyle,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}
