/**
 * Feuilles de style de `ProfilScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `INFO CARD` — extraits de `ProfilScreen`.
 */
export const stylesInfoCard = StyleSheet.create({
infoCard: {
    overflow: 'hidden',

    borderRadius: 20,

    backgroundColor:
      'rgba(255,255,255,0.94)',

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.95)',

    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 3,
  },

infoRow: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 76,

    paddingHorizontal: 15,
    paddingVertical: 12,
  },

infoIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#E8F5E4',

    borderWidth: 1,
    borderColor:
      '#D5E8D0',
  },

infoContent: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

infoLabel: {
    fontSize: 10,
    fontWeight: '800',
    color:
      colors.neutral[500],
    letterSpacing: 0.3,
    textTransform:
      'uppercase',
  },

infoValue: {
    marginTop: 3,

    fontSize: 14,
    lineHeight: 19,
    fontWeight: '700',

    color:
      colors.neutral[900],
  },

separator: {
    height: 1,
    marginLeft: 70,

    backgroundColor:
      'rgba(224,232,221,0.95)',
  },
});
