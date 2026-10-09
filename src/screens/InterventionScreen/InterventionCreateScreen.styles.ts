import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const styles = StyleSheet.create({
  flex: { flex: 1 },
  section: { gap: 14 },
  rowFields: { flexDirection: 'row', gap: 12 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  previewText: { fontSize: 12.5, color: colors.neutral[600] },
  warning: { fontSize: 12.5, color: colors.warning[600], lineHeight: 19 },
}
);
