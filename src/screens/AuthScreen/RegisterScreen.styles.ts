import { StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.primary[700],
  },

  keyboard: {
    flex: 1,
  },

  scroll: {
    flexGrow: 1,
    paddingBottom: 24,
  },

  backgroundDecor: {
    ...StyleSheet.absoluteFill,
    overflow: 'hidden',
  },

  decorCircleLarge: {
    position: 'absolute',
    width: 330,
    height: 330,
    borderRadius: 165,
    backgroundColor: 'rgba(255,255,255,0.055)',
    top: -135,
    right: -115,
  },

  decorCircleMedium: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: 'rgba(255,255,255,0.045)',
    top: 170,
    left: -145,
  },

  decorCircleSmall: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.035)',
    top: 420,
    right: -65,
  },

  decorLeafOne: {
    position: 'absolute',
    top: 42,
    right: 22,
    transform: [
      {
        rotate: '-20deg',
      },
    ],
  },

  decorLeafTwo: {
    position: 'absolute',
    top: 250,
    left: -20,
    transform: [
      {
        rotate: '35deg',
      },
    ],
  },

  hero: {
    paddingTop: 54,
    paddingHorizontal: 24,
    paddingBottom: 86,
  },

  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  logoCircle: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.23)',
  },

  heroBadge: {
    minHeight: 30,
    paddingHorizontal: 11,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.11)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },

  heroBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    color: '#FFFFFF',
  },

  heroCopy: {
    marginTop: 28,
    maxWidth: 340,
  },

  brandTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.74)',
    marginBottom: 10,
  },

  heroTitle: {
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900',
    letterSpacing: -1.1,
    color: '#FFFFFF',
  },

  heroSubtitle: {
    marginTop: 12,
    maxWidth: 315,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.78)',
  },

  heroBottomHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 25,
  },

  heroDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },

  heroHintText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.72)',
  },

  cardWrap: {
    paddingHorizontal: 14,
    marginTop: -46,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,

    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.92)',

    shadowColor: '#0B2E17',
    shadowOffset: {
      width: 0,
      height: 16,
    },
    shadowOpacity: 0.15,
    shadowRadius: 28,
    elevation: 9,
  },

  cardHeader: {
    gap: 7,
    marginBottom: 22,
  },

  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  eyebrowDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.primary[500],
  },

  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.3,
    color: colors.primary[700],
  },

  cardTitle: {
    fontSize: 24,
    lineHeight: 29,
    fontWeight: '900',
    letterSpacing: -0.7,
    color: colors.neutral[900],
  },

  cardSubtitle: {
    fontSize: 13.5,
    lineHeight: 20,
    color: colors.neutral[500],
    maxWidth: 335,
  },

  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,

    backgroundColor: colors.error[50],

    borderWidth: 1,
    borderColor: colors.error[200],

    borderRadius: radius.md,

    padding: 12,
    marginBottom: 18,
  },

  bannerIcon: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.error[100],
  },

  bannerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: colors.error[700],
    paddingTop: 4,
  },

  section: {
    marginBottom: 24,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
    marginBottom: 15,
  },

  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: colors.primary[50],

    borderWidth: 1,
    borderColor: colors.primary[200],
  },

  sectionHeaderText: {
    flex: 1,
    paddingTop: 1,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.neutral[900],
  },

  sectionSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 16,
    color: colors.neutral[500],
  },

  form: {
    gap: 13,
  },

  optionalField: {
    position: 'relative',
  },

  passwordPanel: {
    marginTop: -2,
    padding: 13,
    borderRadius: 16,
    backgroundColor: colors.neutral[100],
    borderWidth: 1,
    borderColor: colors.border.default,
  },

  passwordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 9,
  },

  passwordLabel: {
    flex: 1,
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.neutral[600],
  },

  passwordScoreText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.neutral[500],
  },

  passwordScoreStrong: {
    color: colors.primary[700],
  },

  passwordProgress: {
    flexDirection: 'row',
    gap: 5,
    marginBottom: 12,
  },

  passwordSegment: {
    flex: 1,
    height: 4,
    borderRadius: 99,
    backgroundColor: colors.neutral[200],
  },

  passwordSegmentActive: {
    backgroundColor: colors.primary[500],
  },

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

  trustBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,

    padding: 13,
    marginBottom: 18,

    borderRadius: 16,

    backgroundColor: colors.primary[50],

    borderWidth: 1,
    borderColor: colors.primary[100],
  },

  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor: '#FFFFFF',
  },

  trustContent: {
    flex: 1,
  },

  trustTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.primary[700],
  },

  trustText: {
    marginTop: 2,
    fontSize: 10.5,
    lineHeight: 15,
    color: colors.neutral[500],
  },

  loginRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 15,
  },

  loginHint: {
    fontSize: 12,
    color: colors.neutral[500],
  },

  loginLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  loginLink: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary[700],
  },

  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingTop: 18,
    paddingBottom: 4,
  },

  footerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  footerText: {
    fontSize: 12,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.84)',
    letterSpacing: 0.3,
  },

  footerCopy: {
    fontSize: 10.5,
    color: 'rgba(255,255,255,0.56)',
  },
});
