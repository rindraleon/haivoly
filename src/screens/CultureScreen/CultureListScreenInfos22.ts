/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `INFOS 2 × 2` — extraits de `CultureListScreen`.
 */
export const stylesInfos22 = StyleSheet.create({
infoGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

infoCard: {
    width: '48%',
    minHeight: 70,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor:
      'rgba(248,250,247,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(222,230,219,0.95)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },

infoCardIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor:
      'rgba(232,245,228,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },

infoCardContent: {
    flex: 1,
    minWidth: 0,
  },

infoCardLabel: {
    fontSize: 8.8,
    fontWeight: '900',
    color:
      colors.neutral[500],
    letterSpacing: 0.55,
  },

infoCardValue: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 15,
    color:
      colors.neutral[800],
    fontWeight: '700',
  },

infoCardValueActive: {
    color:
      colors.primary[700],
  },
});
