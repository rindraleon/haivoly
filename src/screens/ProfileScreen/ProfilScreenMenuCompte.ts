/**
 * Feuilles de style de `ProfilScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `MENU COMPTE` — extraits de `ProfilScreen`.
 */
export const stylesMenuCompte = StyleSheet.create({
menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    minHeight: 78,

    paddingHorizontal: 15,
    paddingVertical: 12,
  },

menuItemPressed: {
    backgroundColor:
      'rgba(232,245,228,0.60)',
  },

menuLeft: {
    flex: 1,

    flexDirection: 'row',
    alignItems: 'center',

    minWidth: 0,
  },

menuIcon: {
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

menuTextBlock: {
    flex: 1,
    marginLeft: 12,
    minWidth: 0,
  },

menuTitle: {
    fontSize: 14,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },

menuSubtitle: {
    marginTop: 3,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },

chevronCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      '#F1F8EE',
  },
});
