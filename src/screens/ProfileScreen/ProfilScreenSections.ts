/**
 * Feuilles de style de `ProfilScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `SECTIONS` — extraits de `ProfilScreen`.
 */
export const stylesSections = StyleSheet.create({
section: {
    marginTop: 22,
  },

sectionHeader: {
    marginBottom: 10,
    paddingHorizontal: 2,
  },

sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color:
      colors.neutral[900],
  },

sectionSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },
});
