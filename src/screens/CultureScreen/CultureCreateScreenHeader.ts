/**
 * Feuilles de style de `CultureCreateScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `HEADER` — extraits de `CultureCreateScreen`.
 */
export const stylesHeader = StyleSheet.create({
header: {
      minHeight: 67,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      gap: 10,
      backgroundColor:
        'rgba(220,234,219,0.97)',
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(54,77,57,0.08)',
    },

headerButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        'rgba(255,255,255,0.74)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      alignItems: 'center',
      justifyContent: 'center',
    },

backArrow: {
      fontSize: 31,
      lineHeight: 31,
      color: '#1E3121',
      marginTop: -2,
      fontWeight: '400',
    },

headerContent: {
      flex: 1,
    },

headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#19241B',
    },

headerSubtitle: {
      marginTop: 2,
      fontSize: 10.5,
      color: '#748076',
      fontWeight: '600',
    },

headerLeaf: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#E5F1E5',
      borderWidth: 1,
      borderColor: '#CEE3CF',
      alignItems: 'center',
      justifyContent: 'center',
    },
});
