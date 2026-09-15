 
import {
  useCallback,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as ImagePicker from 'expo-image-picker';
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCreateObservation,
  useDeleteObservation,
  useObservations,
  useUpdateObservation,
} from '@/hooks/useObservations';

import {
  useDeletePhotoObservation,
  usePhotosObservation,
  useUploadPhotoObservation,
} from '@/hooks/usePhotosObservations';

import type {
  Observation,
  PhotoObservation,
} from '@/api/observations';

// ======================================================
// TYPES
// ======================================================

type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

// ======================================================
// ECRAN
// ======================================================

export default function ObservationsScreen() {
  const params =
    useLocalSearchParams<{
      parcelleId?: string;
      cultureId?: string;
      parcelleNom?: string;
      cultureNom?: string;
      statut?: string;
    }>();

  const parcelleId =
    typeof params.parcelleId === 'string'
      ? params.parcelleId
      : '';

  const cultureId =
    typeof params.cultureId === 'string'
      ? params.cultureId
      : '';

  const parcelleNom =
    typeof params.parcelleNom === 'string'
      ? params.parcelleNom
      : '';

  const cultureNom =
    typeof params.cultureNom === 'string'
      ? params.cultureNom
      : '';

  const statut =
    typeof params.statut === 'string'
      ? (params.statut as StatutCulture)
      : undefined;

  // ====================================================
  // REGLES SELON LE STATUT
  // ====================================================

  const cultureSupprimee =
    statut === 'SUPPRIMEE';

  const lectureSeule =
    statut === 'RECOLTEE' ||
    statut === 'ABANDONNEE';

  const modificationAutorisee =
    !cultureSupprimee &&
    !lectureSeule;

  // ====================================================
  // FORMULAIRE
  // ====================================================

  const [formOuvert, setFormOuvert] =
    useState(false);

  const [observationEnModification, setObservationEnModification] =
    useState<Observation | null>(null);

  const [description, setDescription] =
    useState('');

  const [date, setDate] =
    useState('');

  // ====================================================
  // REFRESH
  // ====================================================

  const [refreshing, setRefreshing] =
    useState(false);

  // ====================================================
  // REACT QUERY
  // ====================================================

  const observationsQuery =
    useObservations(
      parcelleId,
      cultureId,
    );

  const createMutation =
    useCreateObservation();

  const updateMutation =
    useUpdateObservation();

  const deleteMutation =
    useDeleteObservation();

  // ====================================================
  // CHARGEMENT
  // ====================================================

  const chargerObservations =
    useCallback(async () => {
      await observationsQuery.refetch();
    }, [observationsQuery]);

  useFocusEffect(
    useCallback(() => {
      chargerObservations();
    }, [chargerObservations]),
  );

  // ====================================================
  // REFRESH
  // ====================================================

  const actualiser =
    useCallback(async () => {
      setRefreshing(true);

      try {
        await observationsQuery.refetch();
      } finally {
        setRefreshing(false);
      }
    }, [observationsQuery]);

  // ====================================================
  // OUVRIR AJOUT
  // ====================================================

  const ouvrirAjout = () => {
    setObservationEnModification(null);

    setDescription('');

    setDate(
      new Date().toISOString(),
    );

    setFormOuvert(true);
  };

  // ====================================================
  // OUVRIR MODIFICATION
  // ====================================================

  const ouvrirModification = (
    observation: Observation,
  ) => {
    if (!modificationAutorisee) {
      return;
    }

    setObservationEnModification(
      observation,
    );

    setDescription(
      observation.description,
    );

    setDate(
      observation.date
        ? observation.date
        : new Date().toISOString(),
    );

    setFormOuvert(true);
  };

  // ====================================================
  // FERMER FORMULAIRE
  // ====================================================

  const fermerFormulaire = () => {
    setFormOuvert(false);

    setObservationEnModification(null);

    setDescription('');
    setDate('');
  };

  // ====================================================
  // ENREGISTRER
  // ====================================================

  const enregistrerObservation =
    async () => {
      if (!description.trim()) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir une description.',
        );

        return;
      }

      try {
        if (observationEnModification) {
          await updateMutation.mutateAsync({
            parcelleId,
            cultureId,
            observationId:
              observationEnModification.id,
            data: {
              description:
                description.trim(),
              date:
                date.trim() ||
                undefined,
            },
          });

          Alert.alert(
            'Succès',
            'Observation modifiée avec succès.',
          );
        } else {
          await createMutation.mutateAsync({
            parcelleId,
            cultureId,
            data: {
              description:
                description.trim(),
              date:
                date.trim() ||
                undefined,
            },
          });

          Alert.alert(
            'Succès',
            'Observation ajoutée avec succès.',
          );
        }

        fermerFormulaire();

        await observationsQuery.refetch();
      } catch (error: any) {
        console.error(
          'ERREUR OBSERVATION:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          error?.response?.data?.message ||
            "Impossible d'enregistrer l'observation.",
        );
      }
    };

  // ====================================================
  // SUPPRIMER
  // ====================================================

  const confirmerSuppression =
    (observation: Observation) => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        'Supprimer',
        'Voulez-vous vraiment supprimer cette observation ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await deleteMutation.mutateAsync({
                  parcelleId,
                  cultureId,
                  observationId:
                    observation.id,
                });

                Alert.alert(
                  'Succès',
                  'Observation supprimée avec succès.',
                );

                await observationsQuery.refetch();
              } catch (error: any) {
                console.error(
                  'ERREUR SUPPRESSION OBSERVATION:',
                  error?.response?.data ||
                    error,
                );

                Alert.alert(
                  'Erreur',
                  error?.response?.data?.message ||
                    "Impossible de supprimer l'observation.",
                );
              }
            },
          },
        ],
      );
    };

  // ====================================================
  // PARAMETRES MANQUANTS
  // ====================================================

  if (
    !parcelleId ||
    !cultureId
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Informations introuvables.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // CULTURE SUPPRIMEE
  // ====================================================

  if (cultureSupprimee) {
    return (
      <View style={styles.center}>
        <Text style={styles.blockedIcon}>
          🚫
        </Text>

        <Text style={styles.blockedTitle}>
          Culture supprimée
        </Text>

        <Text style={styles.blockedText}>
          Les observations de cette culture
          ne sont plus accessibles.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // CHARGEMENT
  // ====================================================

  if (
    observationsQuery.isLoading
  ) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Chargement des observations...
        </Text>
      </View>
    );
  }

  // ====================================================
  // ERREUR
  // ====================================================

  if (
    observationsQuery.isError
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>
          Impossible de charger les
          observations.
        </Text>

        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            observationsQuery.refetch()
          }
        >
          <Text style={styles.retryText}>
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const observations =
    observationsQuery.data ?? [];

  // ====================================================
  // RENDU
  // ====================================================

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={actualiser}
          />
        }
      >
        {/* ============================================ */}
        {/* EN-TETE */}
        {/* ============================================ */}

        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.headerBack}
          >
            <Text style={styles.headerBackText}>
              ←
            </Text>
          </TouchableOpacity>

          <View style={styles.headerContent}>
            <Text style={styles.title}>
              Observations
            </Text>

            <Text style={styles.subtitle}>
              {cultureNom || 'Culture'}
            </Text>

            {parcelleNom ? (
              <Text style={styles.parcelleText}>
                Parcelle : {parcelleNom}
              </Text>
            ) : null}
          </View>
        </View>

        {/* ============================================ */}
        {/* STATUT */}
        {/* ============================================ */}

        <View
          style={[
            styles.statusBox,
            lectureSeule
              ? styles.statusReadOnly
              : styles.statusEditable,
          ]}
        >
          <Text style={styles.statusText}>
            Statut : {statut || 'INCONNU'}
          </Text>

          {lectureSeule ? (
            <Text style={styles.statusDescription}>
              Consultation uniquement.
              Les observations et leurs
              photos peuvent être consultées.
            </Text>
          ) : (
            <Text style={styles.statusDescription}>
              Les observations peuvent être
              ajoutées, modifiées et supprimées.
            </Text>
          )}
        </View>

        {/* ============================================ */}
        {/* BOUTON AJOUT */}
        {/* ============================================ */}

        {modificationAutorisee &&
        !formOuvert ? (
          <TouchableOpacity
            style={styles.addButton}
            onPress={ouvrirAjout}
          >
            <Text style={styles.addButtonText}>
              ＋ Ajouter une observation
            </Text>
          </TouchableOpacity>
        ) : null}

        {/* ============================================ */}
        {/* FORMULAIRE */}
        {/* ============================================ */}

        {formOuvert &&
        modificationAutorisee ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {observationEnModification
                ? 'Modifier l’observation'
                : 'Nouvelle observation'}
            </Text>

            <Text style={styles.label}>
              Description *
            </Text>

            <TextInput
              style={[
                styles.input,
                styles.textarea,
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Décrire l'observation..."
              multiline
              numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={styles.label}>
              Date
            </Text>

            <TextInput
              style={styles.input}
              value={date}
              onChangeText={setDate}
              placeholder="2026-09-04T10:00:00.000Z"
              autoCapitalize="none"
            />

            <Text style={styles.dateHelp}>
              Exemple : 2026-09-04T10:00:00.000Z
            </Text>

            <View style={styles.formButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={
                  fermerFormulaire
                }
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                <Text style={styles.cancelButtonText}>
                  Annuler
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveButton}
                onPress={
                  enregistrerObservation
                }
                disabled={
                  createMutation.isPending ||
                  updateMutation.isPending
                }
              >
                {createMutation.isPending ||
                updateMutation.isPending ? (
                  <ActivityIndicator
                    color="#fff"
                  />
                ) : (
                  <Text style={styles.saveButtonText}>
                    Enregistrer
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* ============================================ */}
        {/* LISTE */}
        {/* ============================================ */}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Historique
          </Text>

          <Text style={styles.countText}>
            {observations.length} observation
            {observations.length > 1
              ? 's'
              : ''}
          </Text>
        </View>

        {observations.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              📝
            </Text>

            <Text style={styles.emptyTitle}>
              Aucune observation
            </Text>

            <Text style={styles.emptyText}>
              Aucune observation n’a encore
              été enregistrée pour cette
              culture.
            </Text>
          </View>
        ) : (
          observations.map(
            (observation) => (
              <ObservationCard
                key={observation.id}
                observation={observation}
                parcelleId={parcelleId}
                cultureId={cultureId}
                modificationAutorisee={
                  modificationAutorisee
                }
                onModifier={
                  ouvrirModification
                }
                onSupprimer={
                  confirmerSuppression
                }
              />
            ),
          )
        )}
      </ScrollView>
    </View>
  );
}

// ======================================================
// CARTE OBSERVATION
// ======================================================

function ObservationCard({
  observation,
  parcelleId,
  cultureId,
  modificationAutorisee,
  onModifier,
  onSupprimer,
}: {
  observation: Observation;
  parcelleId: string;
  cultureId: string;
  modificationAutorisee: boolean;
  onModifier: (
    observation: Observation,
  ) => void;
  onSupprimer: (
    observation: Observation,
  ) => void;
}) {
  const photosQuery =
    usePhotosObservation(
      parcelleId,
      cultureId,
      observation.id,
    );

  const uploadPhoto =
    useUploadPhotoObservation(
      parcelleId,
      cultureId,
      observation.id,
    );

  const deletePhoto =
    useDeletePhotoObservation(
      parcelleId,
      cultureId,
      observation.id,
    );

  const [photoEnCours, setPhotoEnCours] =
    useState(false);

  // ====================================================
  // GALERIE
  // ====================================================

  const choisirGalerie =
    async () => {
      if (!modificationAutorisee) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (
          !permission.granted
        ) {
          Alert.alert(
            'Permission refusée',
            'L’accès à la galerie est nécessaire pour sélectionner une photo.',
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        await envoyerPhoto(
          result.assets[0].uri,
        );
      } catch (error: any) {
        console.error(
          'ERREUR GALERIE OBSERVATION:',
          error,
        );

        Alert.alert(
          'Erreur',
          "Impossible de sélectionner l'image.",
        );
      }
    };

  // ====================================================
  // CAMERA
  // ====================================================

  const prendrePhoto =
    async () => {
      if (!modificationAutorisee) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (
          !permission.granted
        ) {
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

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        await envoyerPhoto(
          result.assets[0].uri,
        );
      } catch (error: any) {
        console.error(
          'ERREUR CAMERA OBSERVATION:',
          error,
        );

        Alert.alert(
          'Erreur',
          "Impossible de prendre la photo.",
        );
      }
    };

  // ====================================================
  // ENVOYER PHOTO
  // ====================================================

  const envoyerPhoto =
    async (uri: string) => {
      if (!modificationAutorisee) {
        return;
      }

      setPhotoEnCours(true);

      try {
        await uploadPhoto.mutateAsync(
          uri,
        );

        await photosQuery.refetch();

        Alert.alert(
          'Succès',
          'Photo ajoutée avec succès.',
        );
      } catch (error: any) {
        console.error(
          'ERREUR UPLOAD PHOTO OBSERVATION:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          error?.response?.data?.message ||
            "Impossible d'envoyer la photo.",
        );
      } finally {
        setPhotoEnCours(false);
      }
    };

  // ====================================================
  // CHOIX PHOTO
  // ====================================================

  const choisirPhoto =
    () => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        'Ajouter une photo',
        'Choisissez une source.',
        [
          {
            text: 'Galerie',
            onPress:
              choisirGalerie,
          },
          {
            text: 'Caméra',
            onPress:
              prendrePhoto,
          },
          {
            text: 'Annuler',
            style: 'cancel',
          },
        ],
      );
    };

  // ====================================================
  // SUPPRIMER PHOTO
  // ====================================================

  const confirmerSuppressionPhoto =
    (photo: PhotoObservation) => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        'Supprimer la photo',
        'Voulez-vous vraiment supprimer cette photo ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                // @ts-ignore -- parcelleId/cultureId injected via closure in original hook
                await deletePhoto.mutateAsync({ parcelleId, cultureId, observationId: observation.id, photoId: photo.id } as any);
                Alert.alert('Succès', 'Photo supprimée.');
              } catch (err: any) {
                Alert.alert('Erreur', err?.response?.data?.message || 'Impossible de supprimer la photo.');
              }
            },
          },
        ],
      );
    };

  // ====================================================
  // PHOTOS
  // ====================================================

  const photos =
    photosQuery.data ?? [];

  return (
    <View style={styles.observationCard}>
      {/* ============================================ */}
      {/* DATE */}
      {/* ============================================ */}

      <View style={styles.observationHeader}>
        <View style={styles.dateContainer}>
          <Text style={styles.dateIcon}>
            📅
          </Text>

          <Text style={styles.dateText}>
            {formaterDate(
              observation.date,
            )}
          </Text>
        </View>
      </View>

      {/* ============================================ */}
      {/* DESCRIPTION */}
      {/* ============================================ */}

      <Text style={styles.observationDescription}>
        {observation.description}
      </Text>

      {/* ============================================ */}
      {/* PHOTOS */}
      {/* ============================================ */}

      <View style={styles.photoHeader}>
        <Text style={styles.photoTitle}>
          📷 Photos
        </Text>

        <Text style={styles.photoCount}>
          {photos.length}
        </Text>
      </View>

      {photosQuery.isLoading ? (
        <ActivityIndicator
          size="small"
        />
      ) : photos.length === 0 ? (
        <Text style={styles.noPhotoText}>
          Aucune photo.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.photoList
          }
        >
          {photos.map((photo) => (
            <View
              key={photo.id}
              style={styles.photoContainer}
            >
              <Image
                source={{
                  uri: photo.url,
                }}
                style={styles.photo}
                resizeMode="cover"
              />

              {modificationAutorisee ? (
                <TouchableOpacity
                  style={
                    styles.deletePhotoButton
                  }
                  onPress={() =>
                    confirmerSuppressionPhoto(
                      photo,
                    )
                  }
                  disabled={
                    deletePhoto.isPending
                  }
                >
                  <Text
                    style={
                      styles.deletePhotoText
                    }
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ))}
        </ScrollView>
      )}

      {/* ============================================ */}
      {/* AJOUT PHOTO */}
      {/* ============================================ */}

      {modificationAutorisee ? (
        <TouchableOpacity
          style={styles.photoButton}
          onPress={choisirPhoto}
          disabled={photoEnCours}
        >
          {photoEnCours ? (
            <ActivityIndicator
              size="small"
            />
          ) : (
            <Text
              style={styles.photoButtonText}
            >
              📷 Ajouter une photo
            </Text>
          )}
        </TouchableOpacity>
      ) : null}

      {/* ============================================ */}
      {/* ACTIONS */}
      {/* ============================================ */}

      {modificationAutorisee ? (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() =>
              onModifier(observation)
            }
          >
            <Text
              style={styles.editButtonText}
            >
              ✏️ Modifier
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() =>
              onSupprimer(observation)
            }
          >
            <Text
              style={
                styles.deleteButtonText
              }
            >
              🗑️ Supprimer
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
}

// ======================================================
// FORMATER DATE
// ======================================================

function formaterDate(
  date: string,
): string {
  if (!date) {
    return 'Date inconnue';
  }

  const valeur =
    new Date(date);

  if (
    Number.isNaN(
      valeur.getTime(),
    )
  ) {
    return date;
  }

  return valeur.toLocaleString(
    'fr-FR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f5',
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f5f7f5',
  },

  loadingText: {
    marginTop: 12,
    color: '#555',
    fontSize: 15,
  },

  errorText: {
    color: '#b91c1c',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },

  retryButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryText: {
    color: '#fff',
    fontWeight: '600',
  },

  backButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '600',
  },

  blockedIcon: {
    fontSize: 48,
    marginBottom: 12,
  },

  blockedTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#991b1b',
    marginBottom: 8,
  },

  blockedText: {
    fontSize: 15,
    color: '#555',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },

  // ================================================
  // HEADER
  // ================================================

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  headerBack: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  headerBackText: {
    fontSize: 26,
    color: '#333',
  },

  headerContent: {
    flex: 1,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1f2937',
  },

  subtitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#166534',
    marginTop: 2,
  },

  parcelleText: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },

  // ================================================
  // STATUT
  // ================================================

  statusBox: {
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
  },

  statusEditable: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },

  statusReadOnly: {
    backgroundColor: '#fff7ed',
    borderColor: '#fed7aa',
  },

  statusText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },

  statusDescription: {
    marginTop: 5,
    color: '#6b7280',
    fontSize: 13,
    lineHeight: 19,
  },

  // ================================================
  // AJOUT
  // ================================================

  addButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 18,
  },

  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },

  // ================================================
  // FORMULAIRE
  // ================================================

  formCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  formTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 16,
  },

  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 7,
  },

  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#fff',
    marginBottom: 12,
  },

  textarea: {
    minHeight: 110,
  },

  dateHelp: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: -5,
    marginBottom: 14,
  },

  formButtons: {
    flexDirection: 'row',
    gap: 10,
  },

  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
  },

  saveButton: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  saveButtonText: {
    color: '#fff',
    fontWeight: '700',
  },

  // ================================================
  // SECTION
  // ================================================

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },

  countText: {
    fontSize: 13,
    color: '#6b7280',
  },

  // ================================================
  // VIDE
  // ================================================

  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  emptyIcon: {
    fontSize: 42,
    marginBottom: 10,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },

  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },

  // ================================================
  // OBSERVATION
  // ================================================

  observationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  observationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  dateIcon: {
    fontSize: 17,
    marginRight: 7,
  },

  dateText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '600',
  },

  observationDescription: {
    fontSize: 16,
    lineHeight: 23,
    color: '#1f2937',
    marginBottom: 16,
  },

  // ================================================
  // PHOTOS
  // ================================================

  photoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  photoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#374151',
  },

  photoCount: {
    marginLeft: 7,
    minWidth: 22,
    textAlign: 'center',
    backgroundColor: '#e5e7eb',
    borderRadius: 11,
    paddingVertical: 2,
    paddingHorizontal: 6,
    fontSize: 12,
    color: '#374151',
  },

  photoList: {
    gap: 10,
    paddingBottom: 8,
  },

  photoContainer: {
    width: 110,
    height: 110,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  deletePhotoButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#dc2626',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deletePhotoText: {
    color: '#fff',
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '700',
  },

  noPhotoText: {
    color: '#9ca3af',
    fontSize: 13,
    marginBottom: 10,
  },

  photoButton: {
    borderWidth: 1,
    borderColor: '#16a34a',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },

  photoButtonText: {
    color: '#15803d',
    fontSize: 14,
    fontWeight: '600',
  },

  // ================================================
  // ACTIONS
  // ================================================

  actionButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  editButton: {
    flex: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  editButtonText: {
    color: '#1d4ed8',
    fontWeight: '600',
    fontSize: 13,
  },

  deleteButton: {
    flex: 1,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#dc2626',
    fontWeight: '600',
    fontSize: 13,
  },
});