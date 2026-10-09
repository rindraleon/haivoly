import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },


  content: {
    padding: 20,
    paddingBottom: 40,
  },


  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },


  loadingText: {
    fontSize: 16,
    color: '#555',
  },


  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },


  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },


  parcelleName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },


  backTopButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    marginBottom: 15,
  },


  backTopButtonText: {
    color: '#1565c0',
    fontWeight: 'bold',
    fontSize: 14,
  },


  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#ddd',
  },


  summaryLabel: {
    fontSize: 13,
    color: '#777',
    marginBottom: 4,
  },


  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
  },


  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },


  sectionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },


  mapContainer: {
    width: '100%',
    height: 500,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    backgroundColor: '#ddd',
  },


  mapLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#f5f5f5',
  },


  searchInput: {
    height: 48,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    fontSize: 15,
    marginBottom: 10,
  },


  searchActions: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },


  filterButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  sortButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#1565c0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },


  activeActionButton: {
    backgroundColor: '#f0f0f0',
  },


  filterButtonText: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },


  sortButtonText: {
    color: '#1565c0',
    fontWeight: 'bold',
  },


  resultCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },


  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },


  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },


  panelLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#555',
    marginTop: 8,
    marginBottom: 8,
  },


  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  optionButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },


  optionButtonActive: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },


  optionText: {
    fontSize: 12,
    color: '#555',
  },


  optionTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },


  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 5,
  },


  sortOptionActive: {
    backgroundColor: '#e8f5e9',
  },


  sortOptionText: {
    fontSize: 14,
    color: '#444',
  },


  sortOptionTextActive: {
    color: '#2e7d32',
    fontWeight: 'bold',
  },


  resetButton: {
    height: 42,
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },


  resetButtonText: {
    color: '#555',
    fontWeight: 'bold',
    fontSize: 13,
  },


  closeButton: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 12,
    textAlign: 'center',
  },


  emptyCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
    marginTop: 5,
  },


  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },


  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },


  cultureCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },


  cultureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },


  cultureTitleContainer: {
    flex: 1,
    paddingRight: 10,
  },


  cultureName: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
  },


  cultureType: {
    fontSize: 14,
    color: '#777',
    marginTop: 3,
  },


  statusBadge: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },


  statusRecoltee: {
    backgroundColor: '#D4EDDA',
  },


  statusAbandonnee: {
    backgroundColor: '#F8D7DA',
  },


  statusSupprimee: {
    backgroundColor: '#E0E0E0',
  },


  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
  },


  infoRow: {
    flexDirection: 'row',
    marginTop: 5,
  },


  infoLabel: {
    fontSize: 14,
    color: '#666',
    width: 110,
  },


  infoValue: {
    fontSize: 14,
    color: '#222',
    flex: 1,
  },


  delimitationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },


  delimitationIcon: {
    fontSize: 14,
    marginRight: 7,
  },


  delimitationOk: {
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: 'bold',
  },


  delimitationNone: {
    fontSize: 13,
    color: '#777',
  },


  detailLink: {
    color: '#1565c0',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 12,
    textAlign: 'right',
  },


  backButton: {
    marginTop: 20,
    backgroundColor: '#2e7d32',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 8,
  },


  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

}
);
