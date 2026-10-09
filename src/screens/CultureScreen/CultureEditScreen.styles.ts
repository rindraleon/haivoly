import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#f5f5f5',
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 20,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 16,
    },

    errorTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },

    errorText: {
      textAlign: 'center',
      color: '#666',
      marginBottom: 20,
    },

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 8,
    },

    parcelle: {
      fontSize: 16,
      color: '#666',
      marginBottom: 25,
    },

    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginBottom: 7,
      marginTop: 12,
    },

    input: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      backgroundColor: '#fff',
    },

    textArea: {
      minHeight: 100,
      textAlignVertical:
        'top',
    },

    dateInput: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 14,
      backgroundColor: '#fff',
    },

    dateText: {
      fontSize: 16,
      color: '#333',
    },

    statusContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 15,
    },

    statusButton: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#fff',
    },

    statusButtonSelected: {
      backgroundColor:
        '#2e7d32',
      borderColor:
        '#2e7d32',
    },

    statusButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#555',
    },

    statusButtonTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },

    warningBox: {
      backgroundColor:
        '#ffebee',
      borderWidth: 1,
      borderColor:
        '#ef9a9a',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
    },

    warningText: {
      color: '#c62828',
      fontSize: 14,
      lineHeight: 20,
    },

    saveButton: {
      height: 50,
      borderRadius: 10,
      backgroundColor:
        '#2e7d32',
      justifyContent:
        'center',
      alignItems: 'center',
      marginTop: 10,
    },

    disabledButton: {
      opacity: 0.6,
    },

    saveText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
    },

    cancelButton: {
      height: 50,
      marginTop: 10,
      borderRadius: 10,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#ddd',
    },

    cancelText: {
      fontWeight: 'bold',
      fontSize: 16,
    },

    backButton: {
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        '#2e7d32',
    },

    backText: {
      color: '#fff',
      fontWeight: 'bold',
    },

  }
);
