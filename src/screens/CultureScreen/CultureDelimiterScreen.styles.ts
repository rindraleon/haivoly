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
    padding: 20,
    gap: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  cultureName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1565c0',
    marginBottom: 12,
  },

  info: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },

  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#d32f2f',
  },

  errorDescription: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    lineHeight: 22,
  },

  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },

  legendParcelle: {
    width: 18,
    height: 18,
    borderWidth: 3,
    borderColor: '#2e7d32',
    marginRight: 8,
  },

  legendCultureExistante: {
    width: 18,
    height: 18,
    backgroundColor: '#f57c00',
    opacity: 0.7,
    marginRight: 8,
  },

  legendCulture: {
    width: 18,
    height: 18,
    backgroundColor: '#1565c0',
    opacity: 0.7,
    marginRight: 8,
  },

  legendText: {
    fontSize: 14,
    color: '#444',
  },

  existingContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  existingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  noCultureText: {
    color: '#777',
    fontSize: 14,
  },

  existingCulture: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  existingCultureName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#f57c00',
  },

  existingCulturePoints: {
    fontSize: 13,
    color: '#666',
  },

  counterContainer: {
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  counter: {
    color: '#1565c0',
    fontSize: 16,
    fontWeight: 'bold',
  },

  areaContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  areaLabel: {
    fontSize: 14,
    color: '#666',
  },

  areaValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1565c0',
    marginTop: 5,
  },

  areaHectare: {
    fontSize: 14,
    color: '#555',
    marginTop: 3,
  },

  modeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    gap: 10,
  },

  modeButton: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1565c0',
    borderRadius: 8,
    alignItems: 'center',
  },

  modeButtonActive: {
    backgroundColor: '#1565c0',
  },

  modeText: {
    color: '#1565c0',
    fontWeight: 'bold',
  },

  modeTextActive: {
    color: '#fff',
  },

  map: {
    width: '100%',
    height: 600,
    marginTop: 5,
    marginBottom: 20,
    borderRadius: 10,
    overflow: 'hidden',
  },

  pointCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  pointTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1565c0',
    marginBottom: 8,
  },

  coordinate: {
    fontSize: 15,
    marginTop: 3,
    color: '#444',
  },

  addButton: {
    height: 52,
    backgroundColor: '#1565c0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  finishButton: {
    height: 52,
    backgroundColor: '#2e7d32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },

  finishButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  cancelText: {
    color: '#d32f2f',
    fontSize: 16,
  },
}
);
