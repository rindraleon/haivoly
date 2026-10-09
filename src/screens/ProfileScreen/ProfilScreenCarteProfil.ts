import { StyleSheet } from 'react-native';
import { colors, radius, } from '@/theme';

export const stylesCarteProfil = StyleSheet.create({
profileCard: {
    position: 'relative',
    overflow: 'hidden',

    padding: 18,

    borderRadius: 22,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.95)',

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.11,
    shadowRadius: 14,
    elevation: 4,
  },

profileCardGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 100,
    right: -70,
    top: -75,
    backgroundColor:
      'rgba(210,231,203,0.42)',
  },

profileMain: {
    flexDirection: 'row',
    alignItems: 'center',
  },

avatarWrapper: {
    position: 'relative',
  },

avatar: {
    width: 78,
    height: 78,
    borderRadius: 39,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      colors.primary[600],

    borderWidth: 4,
    borderColor:
      '#F0F7ED',

    shadowColor:
      colors.primary[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },

avatarText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

avatarBadge: {
    position: 'absolute',
    right: -1,
    bottom: 1,

    width: 25,
    height: 25,
    borderRadius: 13,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      colors.primary[700],

    borderWidth: 3,
    borderColor: '#FFFFFF',
  },

profileIdentity: {
    flex: 1,
    marginLeft: 15,
    minWidth: 0,
  },

profileLabel: {
    fontSize: 9,
    fontWeight: '900',
    color:
      colors.neutral[500],
    letterSpacing: 0.7,
  },

fullName: {
    marginTop: 3,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    color:
      colors.neutral[900],
  },

roleBadge: {
    alignSelf: 'flex-start',

    flexDirection: 'row',
    alignItems: 'center',

    gap: 5,

    marginTop: 8,

    paddingHorizontal: 10,
    paddingVertical: 6,

    borderRadius:
      radius.full,

    backgroundColor:
      '#E8F5E4',

    borderWidth: 1,
    borderColor:
      '#D1E7CA',
  },

roleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color:
      colors.primary[700],
  },

profileDivider: {
    height: 1,
    marginTop: 16,
    backgroundColor:
      'rgba(224,232,221,0.95)',
  },

profileHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 12,
  },

profileHintText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11.5,
    lineHeight: 17,
    color:
      colors.neutral[500],
  },
});
