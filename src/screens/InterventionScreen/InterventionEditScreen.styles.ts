/**
 * Feuilles de style de `InterventionEditScreen`.
 *
 * Extraites du composant pour garder des fichiers courts et lisibles :
 * le composant décrit l'interface, ce module décrit son apparence.
 */
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f2',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7f2',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2e5d2e',
    marginBottom: 20,
    textAlign: 'center',
  },

  contextCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },

  contextLabel: {
    fontSize: 13,
    color: '#558b2f',
    fontWeight: '600',
    marginBottom: 3,
  },

  cultureLabel: {
    marginTop: 12,
  },

  contextValue: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '600',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37474f',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#263238',
  },

  textarea: {
    minHeight: 110,
    paddingTop: 12,
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#558b2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 15,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  cancelButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#eceff1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  cancelButtonText: {
    color: '#455a64',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingText: {
    marginTop: 12,
    color: '#546e7a',
    fontSize: 15,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 8,
  },

  errorText: {
    color: '#546e7a',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  backButton: {
    backgroundColor: '#558b2f',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
}
);
