import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background.app },
  flex: { flex: 1 },
  scroll: { flexGrow: 1 },
  cardWrap: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 14, marginTop: -12 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border.default,
    padding: 20,
    gap: 18,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
  },
  header: { gap: 6 },
  hTitle: { fontSize: 22, fontWeight: '800', color: colors.neutral[900], letterSpacing: -0.5 },
  hSubtitle: { fontSize: 13.5, lineHeight: 19, color: colors.neutral[500] },
  bannerError: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: radius.md,
    padding: 12,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.error[700], fontWeight: '600' },
  footer: { textAlign: 'center', fontSize: 11.5, color: colors.neutral[400], marginTop: 2 },
});
