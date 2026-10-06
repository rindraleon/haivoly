/**
 * Feuilles de style de `ProfilScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `LOGOUT` — extraits de `ProfilScreen`.
 */
export const stylesLogout = StyleSheet.create({
logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',

    minHeight: 72,

    marginTop: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,

    borderRadius: 20,

    backgroundColor:
      'rgba(255,250,250,0.94)',

    borderWidth: 1,
    borderColor:
      colors.error[200],
  },

logoutPressed: {
    opacity: 0.72,
    transform: [
      {
        scale: 0.99,
      },
    ],
  },

logoutIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#FEF2F2',
  },

logoutContent: {
    flex: 1,
    marginLeft: 11,
  },

logoutText: {
    fontSize: 14,
    fontWeight: '800',
    color:
      colors.error[600],
  },

logoutSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },
});
