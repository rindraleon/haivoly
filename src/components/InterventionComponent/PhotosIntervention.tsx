/**
 * Sous-composant `PhotosIntervention` extrait de `InterventionListScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Camera, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors } from '@/theme';
import { getMediaUrl } from '@/utils/mediaUrl';
import { getToken } from '@/storage/authStorage';
import {
  useDeletePhotoIntervention,
  usePhotosIntervention,
  useUploadPhotoIntervention,
} from '@/hooks/intervention/usePhotosInterventions';
import { useEffect, useState } from 'react';
import { messageErreur } from '@/utils/erreur';
import {
  LIBELLE_ETAPE_ENVOI,
  preparerFichierPhoto,
  type EtapeEnvoiPhoto,
} from '@/utils/photo';
import { styles } from '@/screens/InterventionScreen/InterventionListScreen.styles';
import { logger } from '@/utils/logger';

export function PhotosIntervention({
  parcelleId,
  cultureId,
  interventionId,
  modificationAutorisee,
}: {
  parcelleId: string;
  cultureId: string;
  interventionId: string;
  modificationAutorisee: boolean;
}) {
  const photosQuery = usePhotosIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  const uploadPhoto = useUploadPhotoIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  const deletePhoto = useDeletePhotoIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

  const [photoEnCours, setPhotoEnCours] =
    useState(false);

  // Étape d'envoi en cours : sert de verrou anti double-envoi et pilote le
  // libellé affiché (« Compression… », « Envoi… »).
  const [etapeEnvoi, setEtapeEnvoi] = useState<EtapeEnvoiPhoto>('inactif');

  // Les photos sont chargées directement par React Native <Image>.
  // Contrairement à Axios, <Image> ne récupère pas automatiquement
  // le JWT ajouté par l'interceptor Axios. On lui transmet donc le
  // token lorsque le backend protège également l'accès aux fichiers.
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;

    const chargerToken = async () => {
      try {
        const valeur = await getToken();

        if (actif) {
          setToken(valeur ?? null);
        }
      } catch {
        logger.warn('PhotosIntervention', "Jeton d'authentification illisible");

        if (actif) {
          setToken(null);
        }
      }
    };

    void chargerToken();

    return () => {
      actif = false;
    };
  }, []);

  /**
   * Envoi d'une photo, en deux étapes visibles par l'utilisateur :
   * compression locale, puis téléversement. L'état sert aussi de verrou :
   * un second appui pendant l'envoi n'ajoute pas de photo en double.
   */
  const envoyerPhoto = async (uri: string) => {
    if (!modificationAutorisee || etapeEnvoi !== 'inactif') {
      return;
    }

    setEtapeEnvoi('compression');

    try {
      const fichier = await preparerFichierPhoto(uri);

      setEtapeEnvoi('envoi');
      await uploadPhoto.mutateAsync(fichier);
      await photosQuery.refetch();

      Alert.alert('Succès', 'Photo ajoutée avec succès.');
    } catch (error) {
      logger.warn('PhotosIntervention', "Échec de l'envoi d'une photo");
      Alert.alert(
        'Envoi impossible',
        messageErreur(
          error,
          "La photo n'a pas pu être envoyée. Vérifiez votre connexion.",
        ),
        [
          { text: 'Annuler', style: 'cancel' },
          // Reprise immédiate, sans avoir à repasser par la galerie.
          { text: 'Réessayer', onPress: () => void envoyerPhoto(uri) },
        ],
      );
    } finally {
      setEtapeEnvoi('inactif');
      setPhotoEnCours(false);
    }
  };

  const choisirGalerie = async () => {
    if (!modificationAutorisee) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          "L'accès à la galerie est nécessaire pour sélectionner une photo.",
        );
        return;
      }

      const result =
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          quality: 0.8,
        });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await envoyerPhoto(result.assets[0].uri);
    } catch {
      logger.warn('PhotosIntervention', 'Sélection dans la galerie impossible');
      Alert.alert('Erreur', "Impossible de sélectionner l'image.");
    }
  };

  const prendrePhoto = async () => {
    if (!modificationAutorisee) {
      return;
    }

    try {
      const permission =
        await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Permission refusée',
          "L'accès à la caméra est nécessaire pour prendre une photo.",
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.length) {
        return;
      }

      await envoyerPhoto(result.assets[0].uri);
    } catch {
      logger.warn('PhotosIntervention', 'Prise de photo impossible');
      Alert.alert('Erreur', 'Impossible de prendre la photo.');
    }
  };

  const choisirPhoto = () => {
    if (!modificationAutorisee) {
      return;
    }

    Alert.alert('Ajouter une photo', 'Choisissez une source.', [
      { text: 'Galerie', onPress: choisirGalerie },
      { text: 'Caméra', onPress: prendrePhoto },
      { text: 'Annuler', style: 'cancel' },
    ]);
  };

  const confirmerSuppressionPhoto = (photoId: string) => {
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
              await deletePhoto.mutateAsync(photoId);
              await photosQuery.refetch();
              Alert.alert('Succès', 'Photo supprimée.');
            } catch (error) {
              logger.warn('PhotosIntervention', 'Échec de la suppression');
              Alert.alert(
                'Suppression impossible',
                messageErreur(
                  error,
                  'La photo n’a pas pu être supprimée. Réessayez.',
                ),
              );
            }
          },
        },
      ],
    );
  };

  const photos = photosQuery.data ?? [];

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoTitleRow}>
        <View style={styles.infoCardIcon}>
          <Camera
            size={15}
            color={colors.primary[600]}
            strokeWidth={2}
          />
        </View>

        <Text style={styles.photoTitle}>PHOTOS</Text>
        <Text style={styles.photoCount}>{photos.length}</Text>
      </View>

      {photosQuery.isLoading ? (
        <View style={styles.photoLoading}>
          <ActivityIndicator
            size="small"
            color={colors.primary[600]}
          />
          <Text style={styles.photoLoadingText}>
            Chargement des photos...
          </Text>
        </View>
      ) : (
        <>
          {photos.length === 0 ? (
            <Text style={styles.noPhotoText}>
              Aucune photo.
            </Text>
          ) : null}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.photoList}
          >
            {photos.map(photo => (
              <View key={photo.id} style={styles.photoContainer}>
                <Image
                  source={{
                    uri: (() => {
                      const mediaUrl = getMediaUrl(photo.url);

                      if (!mediaUrl) {
                        return '';
                      }

                      const separator = mediaUrl.includes('?')
                        ? '&'
                        : '?';

                      // Évite qu'une ancienne image mise en cache soit
                      // conservée lorsque le même enregistrement est actualisé.
                      return `${mediaUrl}${separator}v=${encodeURIComponent(photo.id)}`;
                    })(),
                    headers: token
                      ? {
                          Authorization: `Bearer ${token}`,
                        }
                      : undefined,
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                  onLoad={() => {
                    logger.debug('PhotosIntervention', 'PHOTO INTERVENTION AFFICHÉE:', {
                      photoId: photo.id,
                      originalUrl: photo.url,
                      mediaUrl: getMediaUrl(photo.url),
                    });
                  }}
                  onError={event => {
                    logger.warn('PhotosIntervention', 'Photo non affichable');
                  }}
                />

                {modificationAutorisee ? (
                  <TouchableOpacity
                    style={styles.deletePhotoButton}
                    onPress={() =>
                      confirmerSuppressionPhoto(photo.id)
                    }
                    disabled={deletePhoto.isPending}
                    activeOpacity={0.8}
                  >
                    <X
                      size={15}
                      color="#FFFFFF"
                      strokeWidth={2.8}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            {modificationAutorisee ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Ajouter une photo"
                style={styles.photoAddTile}
                onPress={choisirPhoto}
                disabled={photoEnCours || etapeEnvoi !== 'inactif'}
                activeOpacity={0.8}
              >
                {photoEnCours || etapeEnvoi !== 'inactif' ? (
                  <ActivityIndicator
                    size="small"
                    color={colors.primary[600]}
                  />
                ) : (
                  <View style={styles.photoAddIcon}>
                    <Plus
                      size={28}
                      color={colors.primary[600]}
                      strokeWidth={2.2}
                    />
                  </View>
                )}
              </TouchableOpacity>
            ) : null}
          </ScrollView>
        </>
      )}

      {etapeEnvoi !== 'inactif' ? (
        <View
          style={styles.envoiPill}
          accessibilityRole="progressbar"
          accessibilityLabel={LIBELLE_ETAPE_ENVOI[etapeEnvoi]}
        >
          <ActivityIndicator size="small" color={colors.primary[700]} />
          <Text style={styles.envoiPillText}>
            {LIBELLE_ETAPE_ENVOI[etapeEnvoi]}
          </Text>
        </View>
      ) : null}

      {modificationAutorisee ? (
        <Text style={styles.compressionNote}>
          Les photos sont compressées sur votre téléphone avant l’envoi :
          moins de données, même qualité à l’œil.
        </Text>
      ) : (
        <Text style={styles.readOnlyFooterText}>
          Les photos ne peuvent pas être modifiées pour cette culture.
        </Text>
      )}
    </View>
  );
}
