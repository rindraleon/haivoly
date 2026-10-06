/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `SECTION` — extraits de `ObservationListScreen`.
 */
export const stylesSection = StyleSheet.create({
sectionHeader: {
      paddingHorizontal: 16,
      marginBottom: 10,
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
    },

sectionTitleBlock: {
      flex: 1,
    },

sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
      color:
        colors.neutral[900],
      letterSpacing: -0.3,
    },

sectionSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color:
        colors.neutral[500],
    },

countText: {
      fontSize: 12,
      color:
        colors.neutral[500],
      marginLeft: 8,
    },
});
