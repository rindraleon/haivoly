/**
 * Feuilles de style de `CultureListScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `CULTURE CARD` — extraits de `CultureListScreen`.
 */
export const stylesCultureCard = StyleSheet.create({
cultureCard: {
    padding: 15,
    gap: 0,
    backgroundColor:
      'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.88)',
    borderRadius: 20,
    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },

cultureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },

cultureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      'rgba(232,245,228,0.95)',
    borderWidth: 1,
    borderColor:
      'rgba(155,190,145,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },

cultureHeaderContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },

cultureName: {
    fontSize: 16,
    fontWeight: '900',
    color:
      colors.neutral[900],
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },

cultureSubtitleRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },

cultureSubtitle: {
    flexShrink: 1,
    fontSize: 11.5,
    color:
      colors.neutral[500],
    fontWeight: '600',
  },

cultureSubtitleSeparator: {
    fontSize: 11,
    color:
      colors.neutral[400],
    marginHorizontal: 1,
  },

statusContainer: {
    paddingTop: 1,
    alignItems: 'flex-end',
  },

cardSeparator: {
    height: 1,
    backgroundColor:
      'rgba(224,232,221,0.95)',
    marginTop: 15,
    marginBottom: 15,
  },
});
