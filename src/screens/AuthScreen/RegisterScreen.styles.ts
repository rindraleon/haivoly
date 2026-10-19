import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

export const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F4F2' },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingVertical: 26 },
  contenu: { paddingHorizontal: 20, gap: 18 },

  backWrap: { alignSelf: 'flex-start' },
  back: {
    width: 40,
    height: 40,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EAE6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#122618',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  headerBloc: { alignItems: 'center', gap: 3, paddingHorizontal: 24 },
  headerTitre: {
    marginTop: 2,
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: '#17301D',
  },
  headerSousTitre: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#66706A',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 18,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    borderWidth: 1,
    borderColor: '#E7EBE7',
    paddingHorizontal: 22,
    paddingVertical: 26,
    shadowColor: '#122618',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.07,
    shadowRadius: 22,
    elevation: 5,
  },

  /* Contenu du formulaire (deux étapes) rendu dans la carte. */
  formContenu: { gap: 16 },

  progression: { gap: 6 },
  progressionRail: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(27, 94, 32, 0.12)',
    overflow: 'hidden',
  },
  progressionTrait: { height: 4, borderRadius: 2, backgroundColor: colors.primary[600] },
  progressText: { fontSize: 11.5, fontWeight: '600', color: '#68736C' },

  grille: { gap: 12 },
  duo: { flexDirection: 'row', gap: 10 },
  duoCol: { flex: 1 },

  bannerError: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'flex-start',
    backgroundColor: colors.error[50],
    borderWidth: 1,
    borderColor: colors.error[200],
    borderRadius: 12,
    padding: 12,
  },
  bannerText: { flex: 1, fontSize: 13, lineHeight: 18, color: colors.error[700], fontWeight: '600' },

  /* Vérifications de robustesse du mot de passe (PwdCheck). */
  checkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 8,
    columnGap: 10,
  },
  checkItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  checkIcon: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[200],
  },
  checkIconValid: {
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  checkText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 14,
    color: colors.neutral[500],
  },
  checkTextValid: {
    color: colors.primary[700],
    fontWeight: '700',
  },

  footer: { textAlign: 'center', fontSize: 11.5, color: '#98A29A', marginTop: 2 },
});
