import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { i18n } from '@/i18n/instance';
import { useTranslation } from 'react-i18next';
import { Camera, Plus, X } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { useTheme } from '@/hooks/common/useTheme';
import { getMediaUrl } from '@/utils/mediaUrl';
import { getToken } from '@/storage/authStorage';
import {
  useDeletePhotoObservation,
  usePhotosObservation,
  useUploadPhotoObservation,
} from '@/hooks/observation/usePhotosObservations';
import { messageErreur } from '@/utils/erreur';
import { LIBELLE_ETAPE_ENVOI, preparerFichierPhoto, type EtapeEnvoiPhoto } from '@/utils/photo';
import { useStylesInterventions } from '@/screens/InterventionScreen/stylesInterventions';
import { logger } from '@/utils/logger';

/**
 * Photos d'une observation : affichage, ajout (caméra ou galerie) et
 * suppression en direct — mêmes règles et même présentation que les photos
 * d'intervention. Utilisé à la modification et sur les fiches d'observation.
 */
export function PhotosObservation({
  parcelleId,
  cultureId,
  observationId,
  modificationAutorisee,
}: {
  parcelleId: string;
  cultureId: string;
  observationId: string;
  modificationAutorisee: boolean;
}) {
  const { t } = useTranslation();
  const styles = useStylesInterventions();
  const { jetons } = useTheme();

  const photosQuery = usePhotosObservation(parcelleId, cultureId, observationId);
  const uploadPhoto = useUploadPhotoObservation(parcelleId, cultureId, observationId);
  const deletePhoto = useDeletePhotoObservation(parcelleId, cultureId, observationId);

  const [photoEnCours, setPhotoEnCours] = useState(false);
  // Étape d'envoi en cours : verrou anti double-envoi + libellé affiché.
  const [etapeEnvoi, setEtapeEnvoi] = useState<EtapeEnvoiPhoto>('inactif');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    let actif = true;
    const chargerToken = async () => {
      try {
        const valeur = await getToken();
        if (actif) setToken(valeur ?? null);
      } catch {
        logger.warn('PhotosObservation', "Jeton d'authentification illisible");
        if (actif) setToken(null);
      }
    };
    void chargerToken();
    return () => {
      actif = false;
    };
  }, []);

  const envoyerPhoto = async (uri: string) => {
    if (!modificationAutorisee || etapeEnvoi !== 'inactif') return;

    setEtapeEnvoi('compression');
    try {
      const fichier = await preparerFichierPhoto(uri);
      setEtapeEnvoi('envoi');
      await uploadPhoto.mutateAsync(fichier);
      await photosQuery.refetch();
      Alert.alert(t('photos.succes'), t('photos.ajoutee'));
    } catch (error) {
      logger.warn('PhotosObservation', "Échec de l'envoi d'une photo");
      Alert.alert('Envoi impossible', messageErreur(error, t('photos.envoiEchoue')), [
        { text: 'Annuler', style: 'cancel' },
        { text: t('commun.actions.reessayer'), onPress: () => void envoyerPhoto(uri) },
      ]);
    } finally {
      setEtapeEnvoi('inactif');
      setPhotoEnCours(false);
    }
  };

  const choisirGalerie = async () => {
    if (!modificationAutorisee) return;
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('photos.permissionGalerie.titre'), t('photos.permissionGalerie.texte'));
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        quality: 0.8,
      });
      if (result.canceled || !result.assets?.length) return;
      await envoyerPhoto(result.assets[0].uri);
    } catch {
      logger.warn('PhotosObservation', 'Sélection dans la galerie impossible');
      Alert.alert(t('photos.erreur'), t('photos.selectionImpossible'));
    }
  };

  const prendrePhoto = async () => {
    if (!modificationAutorisee) return;
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(t('photos.permissionCamera.titre'), t('photos.permissionCamera.texte'));
        return;
      }
      const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 });
      if (result.canceled || !result.assets?.length) return;
      await envoyerPhoto(result.assets[0].uri);
    } catch {
      logger.warn('PhotosObservation', 'Prise de photo impossible');
      Alert.alert(i18n.t('domaine.erreur'), t('photos.captureImpossible'));
    }
  };

  const choisirPhoto = () => {
    if (!modificationAutorisee) return;
    Alert.alert(
      t('photos.ajouterPhoto', { defaultValue: 'Ajouter une photo' }),
      t('photos.choisirSource', { defaultValue: 'Choisissez une source.' }),
      [
        { text: t('photos.source.galerie'), onPress: choisirGalerie },
        { text: t('photos.source.camera'), onPress: prendrePhoto },
        { text: 'Annuler', style: 'cancel' },
      ],
    );
  };

  const confirmerSuppressionPhoto = (photoId: string) => {
    if (!modificationAutorisee) return;
    Alert.alert('Supprimer la photo', i18n.t('photos.voulezVraimentSupprimerPhoto'), [
      { text: 'Annuler', style: 'cancel' },
      {
        text: i18n.t('libelles.supprimer'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deletePhoto.mutateAsync(photoId);
            await photosQuery.refetch();
            Alert.alert(t('photos.succes'), t('photos.supprimee'));
          } catch (error) {
            logger.warn('PhotosObservation', 'Échec de la suppression');
            Alert.alert('Suppression impossible', messageErreur(error, t('photos.suppressionEchouee')));
          }
        },
      },
    ]);
  };

  const photos = photosQuery.data ?? [];

  return (
    <View style={styles.photoSection}>
      <View style={styles.photoTitleRow}>
        <View style={styles.infoCardIcon}>
          <Camera size={15} color={jetons.primaire.base} strokeWidth={2} />
        </View>
        <Text style={styles.photoTitle}>{t('photos.titre')}</Text>
        <Text style={styles.photoCount}>{photos.length}</Text>
      </View>

      {photosQuery.isLoading ? (
        <View style={styles.photoLoading}>
          <ActivityIndicator size="small" color={jetons.primaire.base} />
          <Text style={styles.photoLoadingText}>Chargement des photos...</Text>
        </View>
      ) : (
        <>
          {photos.length === 0 ? <Text style={styles.noPhotoText}>Aucune photo.</Text> : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoList}>
            {photos.map((photo) => (
              <View key={photo.id} style={styles.photoContainer}>
                <Image
                  source={{
                    uri: (() => {
                      const mediaUrl = getMediaUrl(photo.url);
                      if (!mediaUrl) return '';
                      const separator = mediaUrl.includes('?') ? '&' : '?';
                      return `${mediaUrl}${separator}v=${encodeURIComponent(photo.id)}`;
                    })(),
                    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
                  }}
                  style={styles.photo}
                  resizeMode="cover"
                  onError={() => logger.warn('PhotosObservation', 'Photo non affichable')}
                />
                {modificationAutorisee ? (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={i18n.t('libelles.supprimerPhoto')}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.deletePhotoButton}
                    onPress={() => confirmerSuppressionPhoto(photo.id)}
                    disabled={deletePhoto.isPending}
                    activeOpacity={0.8}
                  >
                    <X size={15} color="#FFFFFF" strokeWidth={2.8} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            {modificationAutorisee ? (
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel={i18n.t('libelles.ajouterPhoto')}
                style={styles.photoAddTile}
                onPress={choisirPhoto}
                disabled={photoEnCours || etapeEnvoi !== 'inactif'}
                activeOpacity={0.8}
              >
                {photoEnCours || etapeEnvoi !== 'inactif' ? (
                  <ActivityIndicator size="small" color={jetons.primaire.base} />
                ) : (
                  <View style={styles.photoAddIcon}>
                    <Plus size={28} color={jetons.primaire.base} strokeWidth={2.2} />
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
          <ActivityIndicator size="small" color={jetons.primaire.base} />
          <Text style={styles.envoiPillText}>{LIBELLE_ETAPE_ENVOI[etapeEnvoi]}</Text>
        </View>
      ) : null}

      {modificationAutorisee ? (
        <Text style={styles.compressionNote}>
          Les photos sont compressées sur votre téléphone avant l’envoi : moins de
          données, même qualité à l’œil.
        </Text>
      ) : (
        <Text style={styles.readOnlyFooterText}>
          Les photos ne peuvent pas être modifiées pour cette culture.
        </Text>
      )}
    </View>
  );
}

export default PhotosObservation;
