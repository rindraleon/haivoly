/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';
import { colors } from '@/theme';

/**
 * Styles `PHOTOS` — extraits de `ObservationListScreen`.
 */
export const stylesPhotos = StyleSheet.create({
photoSection: {
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        'rgba(248,250,247,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(222,230,219,0.95)',
    },

photoTitleRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

photoTitle: {
      marginLeft: 8,
      fontSize: 8.8,
      color:
        colors.neutral[500],
      fontWeight: '900',
      letterSpacing: 0.55,
    },

photoCount: {
      marginLeft: 7,
      minWidth: 22,
      textAlign:
        'center',
      backgroundColor:
        '#EAF0E7',
      borderRadius: 11,
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 10.5,
      color:
        colors.neutral[700],
      fontWeight: '800',
    },

photoList: {
      gap: 10,
      paddingBottom: 8,
      paddingTop: 10,
    },

photoContainer: {
      width: 108,
      height: 108,
      borderRadius: 14,
      overflow:
        'hidden',
      position:
        'relative',
      backgroundColor:
        '#F3F4F6',
    },

photo: {
      width: '100%',
      height: '100%',
    },

deletePhotoButton: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        'rgba(31,41,55,0.82)',
      justifyContent:
        'center',
      alignItems:
        'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.8)',
    },

photoLoading: {
      minHeight: 50,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
    },

photoLoadingText: {
      fontSize: 11.5,
      color:
        colors.neutral[500],
      fontWeight: '600',
    },

noPhotoText: {
      marginTop: 9,
      color:
        colors.neutral[400],
      fontSize: 12,
    },

photoAddTile: {
      width: 108,
      height: 108,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor:
        '#86EFAC',
      backgroundColor:
        '#F0FDF4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

photoAddIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        '#DCFCE7',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

/** Pastille « Compression… » / « Envoi… » (identique aux interventions). */
envoiPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 8,
      marginTop: 10,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 999,
      backgroundColor: '#DCFCE7',
    },

envoiPillText: {
      fontSize: 12.5,
      fontWeight: '600',
      color: '#166534',
    },

/** Explication de la compression automatique. */
compressionNote: {
      marginTop: 9,
      fontSize: 11.5,
      lineHeight: 16,
      color: colors.neutral[500],
    },
});
