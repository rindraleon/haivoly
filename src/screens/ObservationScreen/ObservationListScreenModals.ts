/**
 * Feuilles de style de `ObservationListScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';


/**
 * Styles `MODALS` — extraits de `ObservationListScreen`.
 */
export const stylesModals = StyleSheet.create({
modalOverlay: {
      flex: 1,
      justifyContent:
        'flex-end',
    },

modalBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor:
        'rgba(15,23,42,0.48)',
    },

filterSheet: {
      backgroundColor:
        '#F8FBF7',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight:
        '88%',
      overflow:
        'hidden',
    },

addSheet: {
      backgroundColor:
        '#F8FBF7',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight:
        '90%',
      overflow:
        'hidden',
    },

sheetHandle: {
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        '#D1D5DB',
      alignSelf:
        'center',
      marginTop: 9,
      marginBottom: 5,
    },

sheetHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor:
        '#E5EDE5',
    },

addSheetTitleBlock: {
      flex: 1,
      paddingRight: 10,
    },

sheetTitle: {
      fontSize: 20,
      fontWeight: '800',
      color:
        '#172018',
    },

sheetSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color:
        '#7A847A',
    },

sheetCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        '#EEF2EE',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

sheetContent: {
      padding: 20,
      paddingBottom: 30,
    },

filterLabelCulture: {
      marginTop: 20,
    },

filterDropdown: {
      marginTop: 7,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        '#E3EDE3',
      overflow:
        'hidden',
    },

filterDropdownScroll: {
      maxHeight: 190,
    },

filterDropdownItem: {
      minHeight: 50,
      paddingHorizontal: 13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F1',
    },

filterDropdownItemSelected: {
      backgroundColor:
        '#F0FDF4',
    },

dropdownItemLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      minWidth: 0,
    },

filterDropdownItemText: {
      marginLeft: 9,
      fontSize: 14,
      color:
        '#374151',
      fontWeight: '600',
    },

filterDropdownItemTextSelected: {
      color:
        '#166534',
      fontWeight: '800',
    },

dropdownLoading: {
      minHeight: 70,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 15,
    },

dropdownLoadingText: {
      marginTop: 7,
      fontSize: 12,
      color:
        '#6B7280',
    },

dropdownEmpty: {
      padding: 18,
      fontSize: 13,
      color:
        '#6B7280',
      textAlign:
        'center',
    },

dropdownError: {
      color:
        '#B91C1C',
      fontSize: 13,
      textAlign:
        'center',
    },
});
