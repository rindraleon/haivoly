/**
 * Feuilles de style de `ParcelleHistoryScreen` — module dédié pour garder le
 * composant court et lisible.
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
    padding: 20,
  },

  loadingText: {
    fontSize: 16,
  },

  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },

  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
  },

  searchContainer: {
    flex: 1,
  },

  searchInput: {
    height: 45,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    fontSize: 15,
  },

  actionButton: {
    height: 45,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2e7d32',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },

  actionButtonActive: {
    backgroundColor: '#2e7d32',
  },

  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  actionButtonTextActive: {
    color: '#fff',
  },

  panel: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 8,
  },

  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },

  option: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2e7d32',
  },

  optionActive: {
    backgroundColor: '#2e7d32',
  },

  optionText: {
    color: '#2e7d32',
  },

  optionTextActive: {
    color: '#fff',
  },

  panelActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  resetButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resetText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },

  applyButton: {
    flex: 1,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  applyText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  closeButton: {
    marginTop: 20,
    height: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  closeText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  resetSortButton: {
    marginTop: 10,
    height: 45,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  resetSortText: {
    color: '#d32f2f',
    fontWeight: 'bold',
  },

  list: {
    paddingBottom: 80,
  },

  card: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#f1f1f1',
    borderWidth: 1,
    borderColor: '#ddd',
  },

  nom: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 5,
  },

  statusAbandonnee: {
    backgroundColor: '#fff3e0',
  },

  statusArchivee: {
    backgroundColor: '#eeeeee',
  },

  statusSupprimee: {
    backgroundColor: '#ffebee',
  },

  statusBadgeText: {
    fontSize: 13,
    fontWeight: 'bold',
  },

  detailButton: {
    height: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },

  detailText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  suppressionInfo: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#ffebee',
  },

  suppressionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },

  suppressionText: {
    fontSize: 14,
  },

  description: {
    fontSize: 15,
    marginTop: 10,
    marginBottom: 8,
  },

  superficieContainer: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
  },

  superficieTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  superficieInfo: {
    fontSize: 14,
    marginTop: 2,
    color: '#444',
  },

  info: {
    fontSize: 14,
    marginTop: 8,
  },

  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyText: {
    fontSize: 16,
    textAlign: 'center',
  },

  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  backButton: {
    position: 'absolute',
    bottom: 15,
    left: 20,
  },

  backButtonCenter: {
    padding: 10,
  },

  backText: {
    fontWeight: 'bold',
  },
}
);
