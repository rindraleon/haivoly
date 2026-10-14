import { StyleSheet } from 'react-native';
import { colors, radius, spacing } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  listFlex: { flex: 1 },
  list: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing['3xl'] },
  separator: { height: spacing.sm },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryText: { fontSize: 13, fontWeight: '700', color: colors.neutral[700] },
  markAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: '#ABEFC6',
  },
  markAllText: { fontSize: 12, fontWeight: '800', color: colors.primary[700] },
  pressed: { opacity: 0.75 },
  footerHint: {
    textAlign: 'center',
    fontSize: 11.5,
    color: colors.neutral[400],
    marginTop: spacing.lg,
  },
});
