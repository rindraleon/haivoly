import { useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import { useCreateRecolte } from '@/hooks/useRecoltes';
import { useUploadPhotoRecolte } from '@/hooks/usePhotosRecoltes';

export default function AjoutRecolteScreen() {
  const router = useRouter();

  const { cultureId } =
    useLocalSearchParams<{
      cultureId: string;
    }>();

  const createRecolteMutation =
    useCreateRecolte();

  // ============================================================
  // ÉTATS DU FORMULAIRE
  // ============================================================

  const [dateRecolte, setDateRecolte] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    );

  const [quantite, setQuantite] =
    useState('');

  const [unite, setUnite] =
    useState('kg');

  const [description, setDescription] =
    useState('');

  const [prixVente, setPrixVente] =
    useState('');

  const [coutRecolte, setCoutRecolte] =
    useState('');

  const [photosUri, setPhotosUri] = useState<string[]>([]);

const uploadPhotoMutation =
  useUploadPhotoRecolte();

// ============================================================
// PRENDRE UNE PHOTO
// ============================================================

async function prendrePhoto() {
  try {
    const permission =
      await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission refusée',
        'L’accès à la caméra est nécessaire pour prendre une photo.',
      );

      return;
    }

    const result =
      await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

    if (result.canceled) {
      return;
    }

    const uri =
      result.assets[0]?.uri;

    if (!uri) {
      return;
    }

    // Ajouter la photo à la liste 
    setPhotosUri((photos) => [ 
      ...photos, 
      uri,
     ]); 
    } catch (error: any) {
    console.error(
      'Erreur caméra :',
      error,
    );

    Alert.alert(
      'Erreur',
      'Impossible de prendre la photo.',
    );
  }
}

// ============================================================
// CHOISIR PLUSIEURS PHOTOS DANS LA GALERIE
// ============================================================

async function choisirPhotos() {
  try {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission refusée',
        'L’accès à la galerie est nécessaire pour choisir une photo.',
      );

      return;
    }

    const result =
      await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], 
        allowsMultipleSelection: true, 
        allowsEditing: false, 
        quality: 0.8,
      });

    if (result.canceled) {
      return;
    }

    const nouvellesPhotos =
      result.assets
        .map((asset) => asset.uri) 
        .filter(Boolean);
if (nouvellesPhotos.length === 0) { 
  return; 
}
    // Ajouter les nouvelles photos aux photos existantes 
    setPhotosUri((photos) => [ 
      ...photos, 
      ...nouvellesPhotos, 
    ]);
  } catch (error: any) {
    console.error(
      'Erreur galerie :',
      error,
    );

    Alert.alert(
      'Erreur',
      'Impossible de sélectionner les photos.',
    );
  }
}

// ============================================================
// AJOUTER UNE PHOTO
// ============================================================

function ajouterPhoto() {
  Alert.alert(
    'Ajouter une photo',
    'Choisissez une méthode',
    [
      {
        text: 'Prendre une photo',
        onPress: prendrePhoto,
      },
      {
        text: 'Choisir dans la galerie',
        onPress: choisirPhotos,
      },
      {
        text: 'Annuler',
        style: 'cancel',
      },
    ],
  );
}

// ============================================================
// SUPPRIMER LA PHOTO
// ============================================================

function supprimerPhoto(index: number) {
  setPhotosUri((photos) =>
    photos.filter( 
      (_, photoIndex) => 
        photoIndex !== index, 
    ), 
  );
}

  // ============================================================
  // ENREGISTRER LA RÉCOLTE
  // ============================================================

  function enregistrerRecolte() {
    // ----------------------------------------------------------
    // Vérification culture
    // ----------------------------------------------------------

    if (!cultureId) {
      Alert.alert(
        'Erreur',
        'Identifiant de culture introuvable',
      );

      return;
    }

    // ----------------------------------------------------------
    // Vérification date
    // ----------------------------------------------------------

    if (!dateRecolte.trim()) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir la date de récolte',
      );

      return;
    }

    // ----------------------------------------------------------
    // Vérification quantité
    // ----------------------------------------------------------

    const quantiteNumerique =
      Number(
        quantite.replace(',', '.'),
      );

    if (
      !quantite.trim() ||
      Number.isNaN(quantiteNumerique) ||
      quantiteNumerique <= 0
    ) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir une quantité supérieure à zéro',
      );

      return;
    }

    // ----------------------------------------------------------
    // Vérification unité
    // ----------------------------------------------------------

    if (!unite.trim()) {
      Alert.alert(
        'Erreur',
        'Veuillez saisir une unité',
      );

      return;
    }

    // ----------------------------------------------------------
    // Prix de vente
    // ----------------------------------------------------------

    const prixVenteNumerique =
      prixVente.trim()
        ? Number(
            prixVente.replace(',', '.'),
          )
        : undefined;

    if (
      prixVenteNumerique !== undefined &&
      (
        Number.isNaN(
          prixVenteNumerique,
        ) ||
        prixVenteNumerique < 0
      )
    ) {
      Alert.alert(
        'Erreur',
        'Le prix de vente est invalide',
      );

      return;
    }

    // ----------------------------------------------------------
    // Coût de récolte
    // ----------------------------------------------------------

    const coutRecolteNumerique =
      coutRecolte.trim()
        ? Number(
            coutRecolte.replace(',', '.'),
          )
        : undefined;

    if (
      coutRecolteNumerique !== undefined &&
      (
        Number.isNaN(
          coutRecolteNumerique,
        ) ||
        coutRecolteNumerique < 0
      )
    ) {
      Alert.alert(
        'Erreur',
        'Le coût de récolte est invalide',
      );

      return;
    }

    // ----------------------------------------------------------
    // Envoi au backend
    // ----------------------------------------------------------

    createRecolteMutation.mutate(
  {
    cultureId,

    data: {
      dateRecolte,

      quantite:
        quantiteNumerique,

      unite:
        unite.trim(),

      description:
        description.trim() ||
        undefined,

      prixVente:
        prixVenteNumerique,

      coutRecolte:
        coutRecolteNumerique,
    },
  },

  {
    // --------------------------------------------------------
    // SUCCÈS
    // --------------------------------------------------------

    onSuccess: async (recolte) => {
      try {
        // ----------------------------------------------------
        // UPLOAD DE TOUTES LES PHOTOS
        // ----------------------------------------------------

        if ( 
          photosUri.length > 0 
        ) {
           for ( 
            const uri of photosUri 
          ) { 
            await uploadPhotoMutation.mutateAsync( 
              { 
                recolteId: 
                  recolte.id, 
                uri, 
              }, 
            );
           } 
          } 
    // ---------------------------------------------------- // 
    // MESSAGE DE SUCCÈS 
    // ---------------------------------------------------- 
    let message = 
      'La récolte a été enregistrée avec succès.'; 
      if ( 
        photosUri.length === 1 
      ) { 
        message = 
        'La récolte et la photo ont été enregistrées avec succès.'; 
      } 
      else if ( 
        photosUri.length > 1 
      ) { 
        message = 
        `La récolte et ${photosUri.length} photos ont été enregistrées avec succès.`; 
      } 
      Alert.alert( 'Récolte enregistrée', 
        message, 
        [ 
          { 
            text: 'OK', 
            onPress: () => 
              router.back(), 
          }, 
        ], 
      ); 
    } catch (error: any) {
  console.error(
    '========== ERREUR UPLOAD PHOTO =========='
  );

  console.error(
    'Erreur complète :',
    error,
  );

  console.error(
    'Response :',
    error?.response,
  );

  console.error(
    'Status :',
    error?.response?.status,
  );

  console.error(
    'Data :',
    error?.response?.data,
  );

  console.error(
    'Message :',
    error?.message,
  );

  console.error(
    '========================================='
  );

  Alert.alert(
    'Erreur upload photo',
    error?.response?.data?.message ||
      error?.message ||
      'Impossible d’envoyer la photo.',
  );
} 
  },

    // --------------------------------------------------------
    // ERREUR
    // --------------------------------------------------------

   onError: (error: any) => { 
    const message = 
    error?.response?.data?.message || 
    'Impossible d’enregistrer la récolte'; 
    Alert.alert( 
      'Erreur', 
      message, 
    ); 
  }, 
}, 
); 
}

  // ============================================================
  // INTERFACE
  // ============================================================

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
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* =====================================================
            TITRE
        ====================================================== */}

        <Text style={styles.title}>
          Ajouter une récolte
        </Text>

        {/* =====================================================
            HEADER
        ====================================================== */}

        <View style={styles.headerCard}>
          <Text style={styles.cultureName}>
            🌾 Récolte de la culture
          </Text>

          <Text style={styles.cultureId}>
            Culture :{' '}
            {cultureId ||
              'Non renseignée'}
          </Text>
        </View>

        {/* =====================================================
            FORMULAIRE
        ====================================================== */}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Informations de la récolte
          </Text>

          {/* ===================================================
              DATE
          ==================================================== */}

          <Text style={styles.label}>
            Date de récolte *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="AAAA-MM-JJ"
            placeholderTextColor="#999"
            value={dateRecolte}
            onChangeText={
              setDateRecolte
            }
            editable={
              !createRecolteMutation.isPending
            }
            keyboardType="numbers-and-punctuation"
          />

          <Text style={styles.helpText}>
            Format : AAAA-MM-JJ
          </Text>

          {/* ===================================================
              QUANTITÉ
          ==================================================== */}

          <Text style={styles.label}>
            Quantité récoltée *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : 250"
            placeholderTextColor="#999"
            value={quantite}
            onChangeText={setQuantite}
            editable={
              !createRecolteMutation.isPending
            }
            keyboardType="decimal-pad"
          />

          {/* ===================================================
              UNITÉ
          ==================================================== */}

          <Text style={styles.label}>
            Unité *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : kg, tonne, sacs..."
            placeholderTextColor="#999"
            value={unite}
            onChangeText={setUnite}
            editable={
              !createRecolteMutation.isPending
            }
          />

          {/* ===================================================
              PRIX DE VENTE
          ==================================================== */}

          <Text style={styles.label}>
            Prix de vente
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : 150000"
            placeholderTextColor="#999"
            value={prixVente}
            onChangeText={setPrixVente}
            editable={
              !createRecolteMutation.isPending
            }
            keyboardType="decimal-pad"
          />

          <Text style={styles.helpText}>
            Montant en Ariary (Ar)
          </Text>

          {/* ===================================================
              COÛT DE RÉCOLTE
          ==================================================== */}

          <Text style={styles.label}>
            Coût de récolte
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ex : 50000"
            placeholderTextColor="#999"
            value={coutRecolte}
            onChangeText={
              setCoutRecolte
            }
            editable={
              !createRecolteMutation.isPending
            }
            keyboardType="decimal-pad"
          />

          <Text style={styles.helpText}>
            Montant en Ariary (Ar)
          </Text>

          {/* ===================================================
              DESCRIPTION
          ==================================================== */}

          <Text style={styles.label}>
            Description / remarque
          </Text>

          <TextInput
            style={styles.textArea}
            placeholder="Ex : Récolte effectuée manuellement..."
            placeholderTextColor="#999"
            value={description}
            onChangeText={
              setDescription
            }
            editable={
              !createRecolteMutation.isPending
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* ===================================================
              PHOTO
          ==================================================== */}
<Text style={styles.label}>
  Photo de la récolte
</Text>

<TouchableOpacity
  style={styles.photoButton}
  onPress={ajouterPhoto}
  disabled={
    createRecolteMutation.isPending ||
    uploadPhotoMutation.isPending
  }
  activeOpacity={0.8}
>
  <Text style={styles.photoButtonText}>
    📷 Ajouter une photo
  </Text>
</TouchableOpacity>

{/* ===================================================
 NOMBRE DE PHOTOS
  ==================================================== */} 
  {photosUri.length > 0 && ( 
    <Text 
    style={styles.photoCount} 
    > 
    {photosUri.length}{' '} 
    {photosUri.length === 1 
    ? 'photo sélectionnée' 
    : 'photos sélectionnées'} 
    </Text> 
  )}

{/* =================================================== 
APERÇU DES PHOTOS 
==================================================== */} 
{photosUri.length > 0 && ( 
  <View style={styles.photosGrid} 
  > 
  {photosUri.map( 
    (uri, index) => ( 
    <View key={`${uri}-${index}`} 
    style={ 
      styles.photoItem 
      } 
      > 
      <Image 
      source={{ 
        uri, 
        }} 
        style={ 
          styles.photoPreview 
          }
           resizeMode="cover" 
           /> 
           <View 
           style={ 
            styles.photoNumber 
            } 
            > 
            <Text 
            style={ 
              styles.photoNumberText 
              } 
              > 
              {index + 1} 
              </Text> 
              </View> 
              <TouchableOpacity 
              style={ 
                styles.removePhotoButton 
                } 
                onPress={() => 
                  supprimerPhoto( 
                    index, 
                    ) 
                    } 
                    disabled={ 
                      createRecolteMutation.isPending || 
                      uploadPhotoMutation.isPending 
                      } 
                      > 
                      <Text 
                      style={ 
                        styles.removePhotoText 
                        } 
                        > 
                        ✕ 
                        </Text> 
                        </TouchableOpacity> 
                        </View> 
                      ), 
                      )} 
                      </View> 
                    )} 
                    <Text 
                    style={styles.helpText} >
                       Vous pouvez prendre plusieurs 
                       photos ou sélectionner plusieurs 
                       images depuis la galerie. 
                       </Text> 
                       </View>
        {/* =====================================================
            BOUTON ENREGISTRER
        ====================================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,

            (createRecolteMutation.isPending ||
    uploadPhotoMutation.isPending) &&
              styles.disabledButton,
          ]}
          onPress={
            enregistrerRecolte
          }
          disabled={
            createRecolteMutation.isPending 
          }
          activeOpacity={0.8}
        >
          {createRecolteMutation.isPending ||
uploadPhotoMutation.isPending ? (
            <>
              <ActivityIndicator
                size="small"
                color="#fff"
              />

              <Text
                style={styles.buttonText}
              >
                {uploadPhotoMutation.isPending
        ? 'Envoi de la photo...'
        : 'Enregistrement...'}
              </Text>
            </>
          ) : (
            <Text
              style={styles.buttonText}
            >
              🌾 Enregistrer la récolte
            </Text>
          )}
        </TouchableOpacity>

        {/* =====================================================
            BOUTON ANNULER
        ====================================================== */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.back()
          }
          disabled={
            createRecolteMutation.isPending
          }
          activeOpacity={0.8}
        >
          <Text
            style={
              styles.cancelButtonText
            }
          >
            Annuler
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  // ==========================================================
  // TITRE
  // ==========================================================

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#222',
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  headerCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 10,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },

  cultureName: {
    fontSize: 23,
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  cultureId: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
  },

  // ==========================================================
  // CARD
  // ==========================================================

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },

  cardTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 18,
    color: '#222',
  },

  // ==========================================================
  // FORMULAIRE
  // ==========================================================

  label: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 8,
    marginTop: 10,
  },

  input: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#222',
  },

  textArea: {
    minHeight: 110,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#222',
  },

  helpText: {
    fontSize: 13,
    color: '#777',
    marginTop: 5,
  },

  // ==========================================================
  // BOUTON ENREGISTRER
  // ==========================================================

  saveButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    gap: 10,
  },

  disabledButton: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // ==========================================================
  // BOUTON ANNULER
  // ==========================================================

  cancelButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },

  photoButton: {
  minHeight: 50,
  borderWidth: 1,
  borderColor: '#2e7d32',
  borderRadius: 10,
  backgroundColor: '#f1f8f2',
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 14,
},

photoButtonText: {
  color: '#2e7d32',
  fontSize: 15,
  fontWeight: 'bold',
},

photoPreviewContainer: {
  marginTop: 12,
  borderRadius: 10,
  overflow: 'hidden',
  borderWidth: 1,
  borderColor: '#ddd',
  backgroundColor: '#fff',
},

photoPreview: {
  width: '100%',
  height: 220,
},

removePhotoButton: {
  minHeight: 45,
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: '#ffebee',
},

removePhotoText: {
  color: '#c62828',
  fontSize: 14,
  fontWeight: 'bold',
},

photoCount: { 
  marginTop: 12, 
  fontSize: 14, 
  fontWeight: 'bold', 
  color: '#2e7d32', 
}, 
photosGrid: { 
  flexDirection: 'row', 
  flexWrap: 'wrap', 
  gap: 10, 
  marginTop: 12, 
}, 
photoItem: { 
  width: '47%', 
  height: 150, 
  borderRadius: 10, 
  overflow: 'hidden', 
  borderWidth: 1, 
  borderColor: '#ddd', 
  backgroundColor: '#f5f5f5', 
  position: 'relative', 
}, 
photoNumber: { 
  position: 'absolute', 
  top: 7, 
  left: 7, 
  width: 28, 
  height: 28, 
  borderRadius: 14, 
  backgroundColor: 'rgba(0,0,0,0.65)', 
  justifyContent: 'center', 
  alignItems: 'center', 
}, 
photoNumberText: { 
  color: '#fff', 
  fontSize: 13, 
  fontWeight: 'bold', 
}, 
});