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
import { normaliserErreur } from '@/screens/InterventionScreen/InterventionListScreen.helpers';
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
      } catch (error) {
        console.error(
          'ERREUR LECTURE TOKEN POUR PHOTO INTERVENTION:',
          error,
        );

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

  const envoyerPhoto = async (uri: string) => {
    if (!modificationAutorisee) {
      return;
    }

    setPhotoEnCours(true);

    try {
      await uploadPhoto.mutateAsync(uri);
      await photosQuery.refetch();
      Alert.alert('Succès', 'Photo ajoutée avec succès.');
    } catch (error: any) {
      console.error(
        'ERREUR UPLOAD PHOTO INTERVENTION:',
        error?.response?.data || error,
      );

      Alert.alert('Erreur', normaliserErreur(error));
    } finally {
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
    } catch (error) {
      console.error('ERREUR GALERIE INTERVENTION:', error);
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
    } catch (error) {
      console.error('ERREUR CAMERA INTERVENTION:', error);
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
            } catch (error: any) {
              console.error(
                'ERREUR SUPPRESSION PHOTO INTERVENTION:',
                error,
              );
              Alert.alert('Erreur', normaliserErreur(error));
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
                    console.error(
                      'ERREUR AFFICHAGE PHOTO INTERVENTION:',
                      {
                        photoId: photo.id,
                        originalUrl: photo.url,
                        mediaUrl: getMediaUrl(photo.url),
                        error: event.nativeEvent.error,
                      },
                    );
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
                disabled={photoEnCours}
                activeOpacity={0.8}
              >
                {photoEnCours ? (
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

      {!modificationAutorisee ? (
        <Text style={styles.readOnlyFooterText}>
          Les photos ne peuvent pas être modifiées pour cette culture.
        </Text>
      ) : null}
    </View>
  );
}
