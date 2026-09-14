import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useDeleteParcelle } from '@/hooks/useParcelles';

export default function ConfirmationSuppressionScreen() {
  const { parcelleId, nom } = useLocalSearchParams<{
    parcelleId: string;
    nom: string;
  }>();

  const [raison, setRaison] = useState('');

  const deleteParcelleMutation = useDeleteParcelle();

  const handleConfirmation = () => {
    const raisonTrim = raison.trim();

    if (!raisonTrim) {
      Alert.alert(
        'Raison obligatoire',
        'Veuillez préciser la raison de la suppression de cette parcelle.',
      );
      return;
    }

    Alert.alert(
      'Confirmation finale',
      `Voulez-vous vraiment supprimer la parcelle "${nom}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Confirmer',
          style: 'destructive',
          onPress: () => {
            deleteParcelleMutation.mutate(
              {
                id: parcelleId,
                raison: raisonTrim,
              },
              {
                onSuccess: () => {
                  Alert.alert(
                    'Suppression confirmée',
                    'La parcelle a été marquée comme supprimée.',
                    [
                      {
                        text: 'OK',
                        onPress: () => router.replace('/parcelles'),
                      },
                    ],
                  );
                },

                onError: (error: any) => {
                  console.log(
                    'DELETE PARCELLE ERROR:',
                    error?.response?.data || error,
                  );

                  Alert.alert(
                    'Erreur',
                    error?.response?.data?.message ||
                      'Impossible de supprimer la parcelle.',
                  );
                },
              },
            );
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Suppression de la parcelle
      </Text>

      <View style={styles.infoContainer}>
        <Text style={styles.label}>
          Parcelle
        </Text>

        <Text style={styles.nom}>
          {nom}
        </Text>
      </View>

      <Text style={styles.warning}>
        Cette opération modifiera le statut de la parcelle
        en « SUPPRIMÉE ».
      </Text>

      <Text style={styles.label}>
        Raison de la suppression *
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Ex : parcelle abandonnée, vente de la parcelle..."
        value={raison}
        onChangeText={setRaison}
        multiline
        numberOfLines={4}
        textAlignVertical="top"
        editable={!deleteParcelleMutation.isPending}
      />

      <TouchableOpacity
        style={[
          styles.confirmButton,
          deleteParcelleMutation.isPending &&
            styles.disabledButton,
        ]}
        onPress={handleConfirmation}
        disabled={deleteParcelleMutation.isPending}
      >
        {deleteParcelleMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.confirmText}>
            Confirmer la suppression
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => router.back()}
        disabled={deleteParcelleMutation.isPending}
      >
        <Text style={styles.cancelText}>
          Annuler
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});

