import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import * as ImagePicker from 'expo-image-picker';

import { useCallback } from 'react';

import {
  useDeleteIntervention,
  useInterventions,
} from '@/hooks/useInterventions';

import {
  useDeletePhotoIntervention,
  usePhotosIntervention,
  useUploadPhotoIntervention,
} from '@/hooks/usePhotosInterventions';

// =====================================================
// COMPOSANT PHOTOS D'UNE INTERVENTION
// =====================================================

interface PhotosInterventionSectionProps {
  parcelleId: string;
  cultureId: string;
  interventionId: string;
  lectureSeule: boolean;
}

// =====================================================
// SECTION PHOTOS
// =====================================================

function PhotosInterventionSection({
  parcelleId,
  cultureId,
  interventionId,
  lectureSeule,
}: PhotosInterventionSectionProps) {
  // ===================================================
  // PHOTOS
  // ===================================================

  const {
    data: photos = [],
    isLoading,
    isError,
  } = usePhotosIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  // ===================================================
  // UPLOAD
  // ===================================================

  const uploadMutation =
    useUploadPhotoIntervention(
      parcelleId,
      cultureId,
      interventionId,
    );

  // ===================================================
  // SUPPRESSION
  // ===================================================

  const deleteMutation =
    useDeletePhotoIntervention(
      parcelleId,
      cultureId,
      interventionId,
    );

  // ===================================================
  // PRENDRE UNE PHOTO
  // ===================================================

  const prendrePhoto = async () => {
    if (lectureSeule) {
      Alert.alert(
        'Lecture seule',
        'Cette culture ne permet plus d’ajouter des photos.',
      );
      return;
    }

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

      const uri = result.assets[0]?.uri;

      if (!uri) {
        return;
      }

      await uploadMutation.mutateAsync(uri);

      Alert.alert(
        'Succès',
        'La photo a été ajoutée avec succès.',
      );
    } catch (error: any) {
      console.error(
        'Erreur upload caméra :',
        error,
      );

      Alert.alert(
        'Erreur',
        error?.response?.data?.message ||
          error?.message ||
          'Impossible d’ajouter la photo.',
      );
    }
  };

  // ===================================================
  // CHOISIR UNE PHOTO
  // ===================================================

  const choisirPhoto = async () => {
    if (lectureSeule) {
      Alert.alert(
        'Lecture seule',
        'Cette culture ne permet plus d’ajouter des photos.',
      );
      return;
    }

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
          allowsEditing: true,
          quality: 0.8,
        });

      if (result.canceled) {
        return;
      }

      const uri = result.assets[0]?.uri;

      if (!uri) {
        return;
      }

      await uploadMutation.mutateAsync(uri);

      Alert.alert(
        'Succès',
        'La photo a été ajoutée avec succès.',
      );
    } catch (error: any) {
      console.error(
        'Erreur upload galerie :',
        error,
      );

      Alert.alert(
        'Erreur',
        error?.response?.data?.message ||
          error?.message ||
          'Impossible d’ajouter la photo.',
      );
    }
  };

  // ===================================================
  // MENU AJOUT PHOTO
  // ===================================================

  const ajouterPhoto = () => {
    if (lectureSeule) {
      Alert.alert(
        'Lecture seule',
        'Les photos de cette culture peuvent uniquement être consultées.',
      );
      return;
    }

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
          onPress: choisirPhoto,
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ],
    );
  };

  // ===================================================
  // SUPPRIMER PHOTO
  // ===================================================

  const supprimerPhoto = (
    photoId: string,
  ) => {
    if (lectureSeule) {
      Alert.alert(
        'Lecture seule',
        'Les photos de cette culture ne peuvent plus être supprimées.',
      );
      return;
    }

    Alert.alert(
      'Supprimer la photo',
      'Voulez-vous vraiment supprimer cette photo ?',
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
              await deleteMutation.mutateAsync(
                photoId,
              );

              Alert.alert(
                'Succès',
                'La photo a été supprimée.',
              );
            } catch (error: any) {
              console.error(
                'Erreur suppression photo :',
                error,
              );

              Alert.alert(
                'Erreur',
                error?.response?.data?.message ||
                  error?.message ||
                  'Impossible de supprimer la photo.',
              );
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // AFFICHAGE
  // ===================================================

  return (
    <View style={styles.photosSection}>
      {/* TITRE */}
      <View style={styles.photosHeader}>
        <Text style={styles.photosTitle}>
          📷 Photos
        </Text>

        <Text style={styles.photosCount}>
          {photos.length} photo
          {photos.length > 1 ? 's' : ''}
        </Text>
      </View>

      {/* CHARGEMENT */}
      {isLoading && (
        <View style={styles.photosLoading}>
          <ActivityIndicator size="small" />

          <Text style={styles.photosLoadingText}>
            Chargement des photos...
          </Text>
        </View>
      )}

      {/* ERREUR */}
      {isError && (
        <Text style={styles.photosError}>
          Impossible de récupérer les photos.
        </Text>
      )}

      {/* AUCUNE PHOTO */}
      {!isLoading &&
        !isError &&
        photos.length === 0 && (
          <Text style={styles.noPhotoText}>
            Aucune photo enregistrée pour cette
            intervention.
          </Text>
        )}

      {/* LISTE DES PHOTOS */}
      {photos.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.photosList
          }
        >
          {photos.map(photo => (
            <View
              key={photo.id}
              style={styles.photoCard}
            >
              <Image
                source={{
                  uri: photo.url,
                }}
                style={styles.photo}
                resizeMode="cover"
              />

              {!lectureSeule && (
                <TouchableOpacity
                  style={styles.deletePhotoButton}
                  onPress={() =>
                    supprimerPhoto(photo.id)
                  }
                  disabled={
                    deleteMutation.isPending
                  }
                >
                  {deleteMutation.isPending ? (
                    <ActivityIndicator
                      size="small"
                      color="#fff"
                    />
                  ) : (
                    <Text
                      style={
                        styles.deletePhotoText
                      }
                    >
                      🗑️
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          ))}
        </ScrollView>
      )}

      {/* AJOUT PHOTO */}
      {!lectureSeule && (
        <TouchableOpacity
          style={[
            styles.addPhotoButton,
            uploadMutation.isPending &&
              styles.disabledButton,
          ]}
          onPress={ajouterPhoto}
          disabled={uploadMutation.isPending}
        >
          {uploadMutation.isPending ? (
            <>
              <ActivityIndicator
                size="small"
                color="#fff"
              />

              <Text
                style={styles.buttonText}
              >
                Upload en cours...
              </Text>
            </>
          ) : (
            <Text
              style={styles.buttonText}
            >
              📷 Ajouter une photo
            </Text>
          )}
        </TouchableOpacity>
      )}

      {/* MESSAGE LECTURE SEULE */}
      {lectureSeule && (
        <Text
          style={styles.photoReadOnlyText}
        >
          👁️ Photos en consultation uniquement
        </Text>
      )}
    </View>
  );
}

// =====================================================
// ÉCRAN
// =====================================================

export default function InterventionsCultureScreen() {
  // ===================================================
  // PARAMÈTRES
  // ===================================================

  const {
    parcelleId,
    cultureId,
    parcelleNom,
    cultureNom,
    statut,
  } = useLocalSearchParams<{
    parcelleId?: string;
    cultureId?: string;
    parcelleNom?: string;
    cultureNom?: string;
    statut?: string;
  }>();

  // ===================================================
  // DROITS SELON LE STATUT
  // ===================================================

  /**
   * Une culture récoltée ou abandonnée
   * reste consultable mais ne peut plus
   * recevoir de modifications.
   */
  const lectureSeule =
    statut === 'RECOLTEE' ||
    statut === 'ABANDONNEE';

  /**
   * Une culture supprimée ne doit plus
   * permettre la gestion des interventions.
   */
  const cultureSupprimee =
    statut === 'SUPPRIMEE';

  // ===================================================
  // INTERVENTIONS
  // ===================================================

  const {
    data: interventions = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useInterventions(
    parcelleId ?? '',
    cultureId ?? '',
  );

  // ===================================================
  // SUPPRESSION
  // ===================================================

  const deleteMutation =
    useDeleteIntervention();

  // ===================================================
  // ACTUALISATION AU RETOUR
  // ===================================================

  useFocusEffect(
    useCallback(() => {
      if (
        parcelleId &&
        cultureId
      ) {
        refetch();
      }
    }, [
      parcelleId,
      cultureId,
      refetch,
    ]),
  );

  // ===================================================
  // SUPPRIMER INTERVENTION
  // ===================================================

  const supprimerIntervention = (
    interventionId: string,
  ) => {
    // Sécurité supplémentaire côté écran
    if (
      lectureSeule ||
      cultureSupprimee
    ) {
      Alert.alert(
        'Action impossible',
        'Cette culture ne permet plus de modifier ou supprimer ses interventions.',
      );
      return;
    }

    if (
      !parcelleId ||
      !cultureId
    ) {
      return;
    }

    Alert.alert(
      'Supprimer l’intervention',
      'Voulez-vous vraiment supprimer cette intervention ?',
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
                interventionId,
              });

              Alert.alert(
                'Succès',
                'L’intervention a été supprimée.',
              );
            } catch (err: any) {
              Alert.alert(
                'Erreur',
                err?.response?.data
                  ?.message ||
                  'Impossible de supprimer l’intervention.',
              );
            }
          },
        },
      ],
    );
  };

  // ===================================================
  // VÉRIFICATION PARAMÈTRES
  // ===================================================

  if (
    !parcelleId ||
    !cultureId
  ) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Informations introuvables
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          La parcelle ou la culture
          est introuvable.
        </Text>

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================================================
  // CULTURE SUPPRIMÉE
  // ===================================================

  if (cultureSupprimee) {
    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Culture supprimée
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Les interventions d’une
          culture supprimée ne sont
          plus accessibles.
        </Text>

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Retour à la culture
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================================================
  // CHARGEMENT
  // ===================================================

  if (isLoading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement des interventions...
        </Text>
      </View>
    );
  }

  // ===================================================
  // ERREUR
  // ===================================================

  if (isError) {
    const message =
      (error as any)?.response
        ?.data?.message ||
      'Impossible de récupérer les interventions.';

    return (
      <View
        style={
          styles.errorContainer
        }
      >
        <Text
          style={
            styles.errorTitle
          }
        >
          Erreur
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          {Array.isArray(message)
            ? message.join('\n')
            : String(message)}
        </Text>

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            refetch()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===================================================
  // AFFICHAGE
  // ===================================================

  return (
    <View
      style={
        styles.container
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
      >
        {/* TITRE */}
        <Text style={styles.title}>
          Interventions agricoles
        </Text>

        {/* CULTURE */}
        <View style={styles.headerCard}>
          <Text style={styles.cultureName}>
            🌱 {cultureNom || 'Culture'}
          </Text>

          <Text style={styles.parcelleName}>
            Parcelle :{' '}
            {parcelleNom || parcelleId}
          </Text>

          {statut && (
            <Text style={styles.statutText}>
              Statut : {statut}
            </Text>
          )}
        </View>

        {/* MESSAGE LECTURE SEULE */}
        {lectureSeule && (
          <View
            style={
              styles.readOnlyCard
            }
          >
            <Text
              style={
                styles.readOnlyTitle
              }
            >
              👁️ Historique
            </Text>

            <Text
              style={
                styles.readOnlyText
              }
            >
              Cette culture est{' '}
              {statut === 'RECOLTEE'
                ? 'récoltée'
                : 'abandonnée'}
              . Les interventions et
              leurs photos sont conservées
              pour l’historique et peuvent
              uniquement être consultées.
            </Text>
          </View>
        )}

        {/* BOUTON AJOUT INTERVENTION */}
        {!lectureSeule && (
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              router.push({
                pathname:
                  '/ajout-intervention',
                params: {
                  parcelleId,
                  cultureId,
                  parcelleNom:
                    parcelleNom || '',
                  cultureNom:
                    cultureNom || '',
                },
              })
            }
          >
            <Text
              style={styles.buttonText}
            >
              ➕ Ajouter une intervention
            </Text>
          </TouchableOpacity>
        )}

        {/* LISTE */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Historique des interventions
          </Text>

          {interventions.length === 0 ? (
            <Text
              style={styles.emptyText}
            >
              Aucune intervention enregistrée
              pour cette culture.
            </Text>
          ) : (
            interventions.map(
              intervention => (
                <View
                  key={intervention.id}
                  style={
                    styles.interventionCard
                  }
                >
                  {/* TYPE */}
                  <Text
                    style={
                      styles.interventionType
                    }
                  >
                    {intervention.type}
                  </Text>

                  {/* DATE */}
                  <Text
                    style={
                      styles.infoText
                    }
                  >
                    📅{' '}
                    {new Date(
                      intervention.date,
                    ).toLocaleDateString(
                      'fr-FR',
                    )}
                  </Text>

                  {/* DESCRIPTION */}
                  {intervention.description && (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      📝{' '}
                      {
                        intervention.description
                      }
                    </Text>
                  )}

                  {/* PRODUIT */}
                  {intervention.produit && (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      🧪 Produit :{' '}
                      {intervention.produit}
                    </Text>
                  )}

                  {/* QUANTITÉ */}
                  {intervention.quantite !=
                    null && (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      ⚖️ Quantité :{' '}
                      {intervention.quantite}{' '}
                      {intervention.unite ||
                        ''}
                    </Text>
                  )}

                  {/* COÛT */}
                  {intervention.cout !=
                    null && (
                    <Text
                      style={
                        styles.infoText
                      }
                    >
                      💰 Coût :{' '}
                      {Number(
                        intervention.cout,
                      ).toLocaleString(
                        'fr-FR',
                      )}{' '}
                      Ar
                    </Text>
                  )}

                  {/* ===================== */}
                  {/* PHOTOS */}
                  {/* ===================== */}

                  <PhotosInterventionSection
                    parcelleId={
                      parcelleId
                    }
                    cultureId={
                      cultureId
                    }
                    interventionId={
                      intervention.id
                    }
                    lectureSeule={
                      lectureSeule
                    }
                  />

                  {/* ===================== */}
                  {/* ACTIONS */}
                  {/* ===================== */}

                  {!lectureSeule && (
                    <View
                      style={
                        styles.actions
                      }
                    >
                      {/* MODIFIER */}
                      <TouchableOpacity
                        style={
                          styles.editButton
                        }
                        onPress={() =>
                          router.push({
                            pathname:
                              '/modifier-intervention',
                            params: {
                              parcelleId,
                              cultureId,
                              interventionId:
                                intervention.id,
                              parcelleNom:
                                parcelleNom ||
                                '',
                              cultureNom:
                                cultureNom ||
                                '',
                            },
                          })
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Modifier
                        </Text>
                      </TouchableOpacity>

                      {/* SUPPRIMER */}
                      <TouchableOpacity
                        style={
                          styles.deleteButton
                        }
                        onPress={() =>
                          supprimerIntervention(
                            intervention.id,
                          )
                        }
                        disabled={
                          deleteMutation.isPending
                        }
                      >
                        <Text
                          style={
                            styles.buttonText
                          }
                        >
                          Supprimer
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ),
            )
          )}
        </View>

        {/* RETOUR */}
        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.buttonText
            }
          >
            Retour à la culture
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  // ===================================================
  // ÉCRAN
  // ===================================================

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

  // ===================================================
  // HEADER CULTURE
  // ===================================================

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

  parcelleName: {
    fontSize: 15,
    color: '#555',
    marginTop: 6,
  },

  statutText: {
    fontSize: 14,
    color: '#2e7d32',
    fontWeight: '600',
    marginTop: 8,
  },

  // ===================================================
  // LECTURE SEULE
  // ===================================================

  readOnlyCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ffe082',
  },

  readOnlyTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#f57f17',
    marginBottom: 6,
  },

  readOnlyText: {
    fontSize: 14,
    color: '#6d4c41',
    lineHeight: 21,
  },

  // ===================================================
  // AJOUT INTERVENTION
  // ===================================================

  addButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 12,
  },

  // ===================================================
  // CARD
  // ===================================================

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
    marginBottom: 14,
  },

  // ===================================================
  // INTERVENTION
  // ===================================================

  interventionCard: {
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },

  interventionType: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 10,
  },

  infoText: {
    fontSize: 15,
    color: '#444',
    marginBottom: 6,
    lineHeight: 21,
  },

  // ===================================================
  // ACTIONS INTERVENTION
  // ===================================================

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },

  editButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 8,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deleteButton: {
    flex: 1,
    minHeight: 45,
    borderRadius: 8,
    backgroundColor: '#c62828',
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ===================================================
  // PHOTOS
  // ===================================================

  photosSection: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  photosHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  photosTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
  },

  photosCount: {
    fontSize: 13,
    color: '#777',
  },

  photosList: {
    paddingVertical: 4,
    paddingRight: 10,
  },

  photoCard: {
    width: 130,
    height: 130,
    borderRadius: 10,
    overflow: 'hidden',
    marginRight: 10,
    backgroundColor: '#ddd',
    position: 'relative',
  },

  photo: {
    width: '100%',
    height: '100%',
  },

  deletePhotoButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#c62828',
    justifyContent: 'center',
    alignItems: 'center',
  },

  deletePhotoText: {
    fontSize: 16,
  },

  addPhotoButton: {
    minHeight: 45,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginTop: 10,
    flexDirection: 'row',
    gap: 8,
  },

  disabledButton: {
    opacity: 0.6,
  },

  noPhotoText: {
    fontSize: 14,
    color: '#777',
    lineHeight: 20,
  },

  photosLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },

  photosLoadingText: {
    fontSize: 14,
    color: '#777',
  },

  photosError: {
    fontSize: 14,
    color: '#c62828',
    marginBottom: 8,
  },

  photoReadOnlyText: {
    fontSize: 13,
    color: '#777',
    marginTop: 10,
    fontStyle: 'italic',
  },

  // ===================================================
  // VIDE
  // ===================================================

  emptyText: {
    fontSize: 15,
    color: '#777',
    lineHeight: 22,
  },

  // ===================================================
  // CHARGEMENT
  // ===================================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 15,
  },

  loadingText: {
    fontSize: 16,
    color: '#555',
  },

  // ===================================================
  // ERREUR
  // ===================================================

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  // ===================================================
  // RETOUR
  // ===================================================

  backButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#1565c0',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },

  // ===================================================
  // TEXTE BOUTONS
  // ===================================================

  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
});