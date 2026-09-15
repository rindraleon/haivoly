import { View, Text, StyleSheet } from 'react-native';
import { MapPinned } from 'lucide-react-native';
import { colors } from '@/design/tokens';

export function ParcelleFormHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.header}>
      <View style={styles.icon}>
        <MapPinned size={20} color={colors.primary[600]} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', gap: 12, alignItems: 'center', marginBottom: 8 },
  icon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.4 },
  subtitle: { fontSize: 12.5, color: colors.neutral[500], lineHeight: 16 },
});
