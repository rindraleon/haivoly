import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  title: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  infoContainer: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#e8f5e9',
    marginBottom: 20,
  },

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  nom: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  warning: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },

  input: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    marginBottom: 20,
  },

  confirmButton: {
    height: 52,
    borderRadius: 10,
    backgroundColor: '#d32f2f',
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  confirmText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  cancelButton: {
    height: 50,
    marginTop: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#777',
    justifyContent: 'center',
    alignItems: 'center',
  },

  cancelText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
}
);
