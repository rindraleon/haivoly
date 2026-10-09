import { Check } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { colors } from '@/theme';
import { styles } from '@/screens/AuthScreen/ResetPasswordScreen.styles';

export function PasswordRuleItem({ valid, text }: { valid: boolean; text: string }) {
  return (
    <View style={styles.checkRow}>
      <View style={[styles.checkIcon, valid && styles.checkIconValid]}>
        <Check size={11} color={valid ? colors.primary[700] : colors.neutral[400]} strokeWidth={3} />
      </View>
      <Text style={[styles.checkText, valid && styles.checkTextValid]}>{text}</Text>
    </View>
  );
}
