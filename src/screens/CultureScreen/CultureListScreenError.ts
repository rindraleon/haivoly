/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `ERROR` — extraits de `CultureListScreen`.
 */
export const stylesError = StyleSheet.create({
errorInline: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },

errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color:
      colors.neutral[900],
    textAlign: 'center',
  },

errorMessage: {
    marginTop: 6,
    fontSize: 13,
    color:
      colors.neutral[500],
    textAlign: 'center',
  },

retryButton: {
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor:
      colors.primary[500],
  },

retryButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },

errorText: {
    fontSize: 15,
    color: '#D32F2F',
    textAlign: 'center',
  },

backButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor:
      colors.primary[500],
  },

backButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
