/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `SECTION` — extraits de `CultureListScreen`.
 */
export const stylesSection = StyleSheet.create({
sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },

sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color:
      colors.neutral[900],
    letterSpacing: -0.3,
  },

sectionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color:
      colors.neutral[500],
  },
});
