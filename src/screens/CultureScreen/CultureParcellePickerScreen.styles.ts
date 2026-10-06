/**
 * Feuilles de style de `CultureParcellePickerScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
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
    padding: 20,
    gap: 15,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },

  list: {
    paddingBottom: 100,
  },

  card: {
    padding: 18,
    borderRadius: 12,
    backgroundColor: '#e8f5e9',
    marginBottom: 12,
  },

  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  cardText: {
    fontSize: 15,
    marginTop: 4,
  },

  cultureLink: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
  },

  retryText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },

  backButtonBottom: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}
);
