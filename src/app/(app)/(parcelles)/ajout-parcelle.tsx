/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState , useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {router,useLocalSearchParams,} from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { addPointsGPS } from '@/api/parcelles';
import { useCreateParcelle } from '@/hooks/useParcelles';
import { getCurrentLocation } from '@/services/location';
import { getIsOnline , useNetwork } from '@/hooks/useNetwork';
import { enqueue , getPendingCount } from '@/features/sync/services/queue';
import { OfflineBanner } from '@/features/offline/components/OfflineBanner';


interface GPSPoint {
  id?: string;
  latitude: number;
  longitude: number;
  ordre: number;
  parcelleId?: string;
}


export default function AjouterParcelleScreen() {
  const params = useLocalSearchParams<{
  nom?: string;
  description?: string;
  typeSol?: string;
  latitude?: string;
  longitude?: string;
  superficie?: string;
  pointsGPS?: string;
}>();


const [nom, setNom] = useState(params.nom || '');
const [description, setDescription] = useState(params.description || '',);
const [superficie, setSuperficie] = useState(params.superficie || '',);
const [typeSol, setTypeSol] = useState(params.typeSol || '',);
const [latitude, setLatitude] = useState(params.latitude || '',);
const [longitude, setLongitude] = useState(params.longitude || '',);
const pointsGPS: GPSPoint[] = params.pointsGPS
  ? JSON.parse(params.pointsGPS).map((point: any) => ({
      id: point.id,
      latitude: Number(point.latitude),
      longitude: Number(point.longitude),
      ordre: Number(point.ordre),
    }))
  : [];

console.log(
  'POINTS RECUS DANS AJOUT PARCELLE:',
  pointsGPS,
);

  const createMutation = useCreateParcelle();
  const { isOnline } = useNetwork();
  const [pendingCount, setPendingCount] = useState(0);
  useEffect(() => {
    getPendingCount().then(setPendingCount);
    const id = setInterval(() => getPendingCount().then(setPendingCount), 3000);
    return () => clearInterval(id);
  }, []);

const handleDelimiterParcelle = () => {
  router.push({
    pathname: '/delimiter-parcelle',
    params: {
      nom,
      description,
      typeSol,
      latitude,
      longitude,
    },
  });
};

  const handleGetLocation = async () => {
  try {
    const position = await getCurrentLocation();

setLatitude(position.latitude.toString());
setLongitude(position.longitude.toString());

Alert.alert(
  'Position GPS',
  `Latitude : ${position.latitude}
Longitude : ${position.longitude}
Précision : ${
    position.accuracy !== undefined
      ? `${position.accuracy.toFixed(1)} m`
      : 'inconnue'
  }`,
);
  } catch (error: any) {
    console.log('GPS ERROR:', error);

    Alert.alert(
      'Erreur GPS',
      error?.message ||
        'Impossible de récupérer votre position.',
    );
  }
};

  const handleCreate = async () => {
    if (!nom.trim()) {
      Alert.alert(
        'Champ obligatoire',
        'Veuillez saisir le nom de la parcelle.',
      );
      return;
    }

    // Offline-first : si hors connexion, enqueue localement
    const online = await getIsOnline();
    if (!online) {
      await enqueue({
        actionType: 'CREATE_PARCELLE',
        entityType: 'PARCELLE',
        payload: {
          nom: nom.trim(),
          description: description.trim() || undefined,
          superficie: superficie ? Number(superficie) : undefined,
          typeSol: typeSol.trim() || undefined,
          latitude: latitude ? Number(latitude) : undefined,
          longitude: longitude ? Number(longitude) : undefined,
          pointsGPS,
        },
      });
      Alert.alert(
        'Enregistré localement',
        'Vous êtes hors connexion. La parcelle a été enregistrée localement et sera synchronisée automatiquement à la reconnexion.',
        [{ text: 'OK', onPress: () => router.replace('/(app)/(parcelles)/parcelles' as any) }],
      );
      return;
    }

    const superficieNumber = superficie
      ? Number(superficie)
      : undefined;

    
    if (
      superficie &&
      Number.isNaN(superficieNumber)
    ) {
      Alert.alert(
        'Erreur',
        'La superficie doit être un nombre.',
      );
      return;
    }

   

    createMutation.mutate(
      {
        nom: nom.trim(),
        description: description.trim() || undefined,
        superficie: superficieNumber,
        typeSol: typeSol.trim() || undefined,
      },
      {
onSuccess: async (parcelle) => {
  try {
    console.log('PARCELLE CREEE:', parcelle);

    console.log(
      'POINTS GPS A ENREGISTRER:',
      pointsGPS,
    );

    // Vérifier qu'on a au moins 3 points
    if (pointsGPS.length >= 3) {

  const pointsAEnvoyer = pointsGPS.map((point) => ({
    latitude: point.latitude,
    longitude: point.longitude,
    ordre: point.ordre,
  }));

  console.log(
    'POINTS GPS NETTOYES:',
    pointsAEnvoyer,
  );

  await addPointsGPS(
    parcelle.id,
    pointsAEnvoyer,
  );

  console.log(
    'POINTS GPS ENREGISTRES AVEC SUCCES',
  );
}

    Alert.alert(
      'Succès',
      'La parcelle a été créée avec ses points GPS.',
      [
        {
          text: 'OK',
          onPress: () => {
            router.replace('/parcelles');
          },
        },
      ],
    );
  } catch (error: any) {
    console.log(
      'ERREUR ENREGISTREMENT POINTS GPS:',
      error?.response?.data || error,
    );

    Alert.alert(
      'Attention',
      'La parcelle a été créée, mais les points GPS n’ont pas pu être enregistrés.',
    );
  }
},

        onError: (error: any) => {
          console.log(
            'CREATE PARCELLE ERROR:',
            error?.response?.data,
          );

          const message =
            error?.response?.data?.message ||
            'Impossible de créer la parcelle.';

          Alert.alert(
            'Erreur',
            String(message),
          );
        },
      },
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <OfflineBanner isOnline={isOnline ?? true} pendingCount={pendingCount} isSyncing={false} />
        <Text style={styles.title}>
          Ajouter une parcelle
        </Text>

        <Text style={styles.label}>
          Nom *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex : Rizière Nord"
          value={nom}
          onChangeText={setNom}
        />

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textarea,
          ]}
          placeholder="Description de la parcelle"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={styles.label}>
          Superficie (m²)
        </Text>

<TextInput
  style={[
    styles.input,
    styles.inputDisabled,
  ]}
  placeholder="Calculée automatiquement"
  value={superficie}
  editable={false}
/>

<Text style={styles.label}>
  Type de sol
</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={typeSol}
    onValueChange={(value) => setTypeSol(value)}
  >

    <Picker.Item
      label="Argileux"
      value="Argileux"
    />

    <Picker.Item
      label="Sableux"
      value="Sableux"
    />

    <Picker.Item
      label="Limoneux"
      value="Limoneux"
    />

    <Picker.Item
      label="Argilo-limoneux"
      value="Argilo-limoneux"
    />

    <Picker.Item
      label="Humifère"
      value="Humifère"
    />

    <Picker.Item
      label="Latéritique"
      value="Latéritique"
    />

    <Picker.Item
      label="Rocheux"
      value="Rocheux"
    />
  </Picker>
</View>
        
        <TouchableOpacity
  style={styles.gpsButton}
  onPress={handleGetLocation}
>
  <Text style={styles.gpsButtonText}>
     Utiliser ma position
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.delimiterButton}
  onPress={handleDelimiterParcelle}
>
  <Text style={styles.delimiterButtonText}>
    Délimiter la parcelle
  </Text>
</TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            createMutation.isPending &&
              styles.buttonDisabled,
          ]}
          onPress={handleCreate}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              ENREGISTRER
            </Text>
          )}
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
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 25,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 7,
    marginTop: 10,
  },

  inputDisabled: {
  backgroundColor: '#eeeeee',
  color: '#333',
},

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  textarea: {
    height: 90,
    paddingTop: 15,
    textAlignVertical: 'top',
  },

solContainer: {
  flexDirection: 'row',
  flexWrap: 'wrap',
  gap: 10,
  marginTop: 5,
},

pickerContainer: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  backgroundColor: '#fff',
  overflow: 'hidden',
},

solButton: {
  borderWidth: 1,
  borderColor: '#2e7d32',
  borderRadius: 8,
  paddingVertical: 12,
  paddingHorizontal: 14,
  backgroundColor: '#fff',
},

solButtonActive: {
  backgroundColor: '#2e7d32',
},

solText: {
  color: '#2e7d32',
  fontWeight: '600',
},

solTextActive: {
  color: '#fff',
},

  button: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  gpsButton: {
  height: 52,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#2e7d32',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15,
},

gpsButtonText: {
  color: '#2e7d32',
  fontWeight: 'bold',
  fontSize: 16,
},

delimiterButton: {
  height: 52,
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#1565c0',
  justifyContent: 'center',
  alignItems: 'center',
  marginTop: 15,
},

delimiterButtonText: {
  color: '#1565c0',
  fontWeight: 'bold',
  fontSize: 16,
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