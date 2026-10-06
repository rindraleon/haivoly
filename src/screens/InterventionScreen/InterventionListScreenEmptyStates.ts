/**
 * Feuilles de style de `InterventionListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `EMPTY / STATES` — extraits de `InterventionListScreen`.
 */
export const stylesEmptyStates = StyleSheet.create({
loadingInline: {
    minHeight: 180,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    zIndex: 6,
  },

loadingInlineText: {
    color: colors.neutral[500],
    fontSize: 12.5,
    fontWeight: '600',
  },

emptyInline: {
    zIndex: 6,
    paddingVertical: 26,
  },

emptyCard: {
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor: '#E4ECE2',
    paddingHorizontal: 18,
    paddingVertical: 24,
    alignItems: 'center',
  },

emptyIcon: {
    fontSize: 38,
    marginBottom: 8,
  },

emptyTitle: {
    textAlign: 'center',
    color: '#1F2937',
    fontSize: 15,
    fontWeight: '900',
  },

emptyText: {
    maxWidth: 330,
    marginTop: 6,
    textAlign: 'center',
    color: colors.neutral[500],
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },

retryButton: {
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#166534',
    alignItems: 'center',
    justifyContent: 'center',
  },

retryText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '900',
  },
});
