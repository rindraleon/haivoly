import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as Crypto from 'expo-crypto';

import { getCurrentLocation } from '@/services/location';
import { synchronize } from '@/api/sync';

interface GPSPoint {
  id: string;
  ordre: number;
  latitude: number;
  longitude: number;
  parcelleId: string;
}

export default function DelimiterParcelleScreen() {
  const { parcelleId } =
  useLocalSearchParams<{ parcelleId: string }>();

  const [pointsGPS, setPointsGPS] = useState<GPSPoint[]>([]);
  const [loading, setLoading] = useState(false);

  const handleAddPoint = async () => {
    try {
      setLoading(true);

      console.log('PARCELLE ID:', parcelleId);

      const position = await getCurrentLocation();

      const nouveauPoint: GPSPoint = {
  id: Crypto.randomUUID(),
  ordre: pointsGPS.length + 1,
  latitude: position.latitude,
  longitude: position.longitude,
  parcelleId,
};

      setPointsGPS((previousPoints) => [
        ...previousPoints,
        nouveauPoint,
      ]);

      Alert.alert(
        'Point ajouté',
        `P${nouveauPoint.ordre} enregistré.`,
      );
    } catch (error: any) {
      console.log('GPS POINT ERROR:', error);

      Alert.alert(
        'Erreur GPS',
        error?.message ||
          'Impossible de récupérer la position.',
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
  if (pointsGPS.length < 3) {
    Alert.alert(
      'Points insuffisants',
      'Il faut au moins 3 points pour délimiter une parcelle.',
    );
    return;
  }

  if (!parcelleId) {
    Alert.alert(
      'Erreur',
      'Identifiant de la parcelle introuvable.',
    );
    return;
  }

  try {
    setLoading(true);

    console.log('PARCELLE ID:', parcelleId);
    console.log('POINTS GPS:', pointsGPS);

    const response = await synchronize({
      pointsGPS,
    });

    console.log('SYNC RESPONSE:', response);

    Alert.alert(
      'Succès',
      `${pointsGPS.length} points GPS ont été enregistrés.`,
      [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ],
    );
  } catch (error: any) {
    console.log(
      'SYNC GPS ERROR:',
      error?.response?.data || error,
    );

    const message =
      error?.response?.data?.message ||
      'Impossible de synchroniser les points GPS.';

    Alert.alert(
      'Erreur de synchronisation',
      String(message),
    );
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>
          Délimiter la parcelle
        </Text>

        <Text style={styles.info}>
          Déplacez-vous autour de la parcelle et
          ajoutez un point GPS à chaque endroit
          important.
        </Text>

        <View style={styles.counterContainer}>
          <Text style={styles.counter}>
            Points enregistrés : {pointsGPS.length}
          </Text>
        </View>

        {pointsGPS.map((point) => (
          <View
            key={point.id}
            style={styles.pointCard}
          >
            <Text style={styles.pointTitle}>
               P{point.ordre}
            </Text>

            <Text style={styles.coordinate}>
              Latitude : {point.latitude}
            </Text>

            <Text style={styles.coordinate}>
              Longitude : {point.longitude}
            </Text>
          </View>
        ))}

        <TouchableOpacity
          style={[
            styles.addButton,
            loading && styles.buttonDisabled,
          ]}
          onPress={handleAddPoint}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.addButtonText}>
              AJOUTER UN POINT
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.finishButton}
          onPress={handleFinish}
        >
          <Text style={styles.finishButtonText}>
             TERMINER
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
        >
          <Text style={styles.cancelText}>
            Annuler
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  info: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },

  counterContainer: {
    backgroundColor: '#e8f5e9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },

  counter: {
    color: '#2e7d32',
    fontSize: 16,
    fontWeight: 'bold',
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
    marginBottom: 8,
  },

  coordinate: {
    fontSize: 15,
    marginTop: 3,
    color: '#444',
  },

  addButton: {
    height: 52,
    backgroundColor: '#2e7d32',
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
    backgroundColor: '#1565c0',
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
});