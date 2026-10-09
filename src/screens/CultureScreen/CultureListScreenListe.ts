import { StyleSheet } from 'react-native';


export const stylesListe = StyleSheet.create({
listArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#DCEBD7',
  },

listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },

detailListArea: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor:
      '#DCEBD7',
    paddingBottom: 4,
  },

detailListContent: {
    padding: 12,
    gap: 12,
  },
});
