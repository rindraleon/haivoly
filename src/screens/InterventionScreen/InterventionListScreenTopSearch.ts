/**
 * Feuilles de style de `InterventionListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `TOP / SEARCH` — extraits de `InterventionListScreen`.
 */
export const stylesTopSearch = StyleSheet.create({
topBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    zIndex: 20,
  },

searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

searchContainer: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

searchInput: {
    flex: 1,
    minHeight: 42,
    marginLeft: 8,
    paddingVertical: 0,
    color: colors.neutral[800],
    fontSize: 13.5,
  },

clearSearchButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },

filterButtonDisabledVisual: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDEBDD',
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },

filterIndicator: {
    position: 'absolute',
    top: 7,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.primary[600],
  },

statsBar: {
    marginTop: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },

statPill: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#D1FAE5',
  },

statPillValue: {
    color: '#166534',
    fontWeight: '900',
    fontSize: 13,
  },

statPillLabel: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 11.5,
  },

statHint: {
    flex: 1,
    textAlign: 'right',
    color: colors.neutral[500],
    fontSize: 11.5,
    fontWeight: '600',
  },

contextBar: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

contextIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },

contextContent: {
    flex: 1,
  },

contextTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#1F2937',
  },

contextSubtitle: {
    marginTop: 2,
    fontSize: 11.5,
    color: colors.neutral[500],
    fontWeight: '600',
  },
});
