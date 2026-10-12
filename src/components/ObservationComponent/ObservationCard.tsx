import { Alert, Pressable } from 'react-native';
import { i18n } from '@/i18n/instance';



import * as ImagePicker from 'expo-image-picker';



import {
  useDeletePhotoObservation,
  usePhotosObservation,
  useUploadPhotoObservation,
} from '@/hooks/observation/usePhotosObservations';
import { useState } from 'react';
import { StatutCulture } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { messageErreur } from '@/utils/erreur';
import {
  LIBELLE_ETAPE_ENVOI,
  preparerFichierPhoto,
  type EtapeEnvoiPhoto,
} from '@/utils/photo';


import { ObservationCard1 } from '@/components/ObservationComponent/ObservationCard1';
import type {
  Observation,
  PhotoObservation,
} from '@/types';
import { logger } from '@/utils/logger';
export function ObservationCard({
  observation,
  parcelleId,
  cultureId,
  cultureNom,
  parcelleNom,
  statutCulture,
  modificationAutorisee,
  onModifier,
  onSupprimer,
}: {
  observation: Observation;
  parcelleId: string;
  cultureId: string;
  cultureNom: string;
  parcelleNom: string;
  statutCulture?: StatutCulture;
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

  const [
    photoEnCours,
    setPhotoEnCours,
  ] =
    useState(false);

  // Étape d'envoi : verrou anti double-envoi + libellé affiché à l'utilisateur.
  const [
    etapeEnvoi,
    setEtapeEnvoi,
  ] = useState<EtapeEnvoiPhoto>('inactif');

  const envoyerPhoto =
    async (
      uri: string,
    ) => {
      if (
        !modificationAutorisee ||
        etapeEnvoi !== 'inactif'
      ) {
        return;
      }

      setEtapeEnvoi('compression');

      try {
        const fichier =
          await preparerFichierPhoto(
            uri,
          );

        setEtapeEnvoi('envoi');

        await uploadPhoto.mutateAsync(
          fichier,
        );

        await photosQuery.refetch();

        Alert.alert(
          i18n.t('domaine.succes'),
          i18n.t('photos.ajoutee'),
        );
      } catch (error) {
        logger.warn(
          'ObservationCard',
          i18n.t('photos.erreur'),
        );

        Alert.alert(
          'Envoi impossible',
          messageErreur(
            error,
            i18n.t('photos.envoiEchoue'),
          ),
          [
            {
              text: 'Annuler',
              style: 'cancel',
            },
            {
              text: i18n.t('commun.actions.reessayer'),
              onPress: () =>
                void envoyerPhoto(uri),
            },
          ],
        );
      } finally {
        setEtapeEnvoi('inactif');
        setPhotoEnCours(false);
      }
    };

  const choisirGalerie =
    async () => {
      if (!modificationAutorisee) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            i18n.t('photos.permissionGalerie.titre'),
            i18n.t('photos.permissionGalerie.texte'),
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
      } catch {
        logger.warn('ObservationCard', 'Sélection dans la galerie impossible');

        Alert.alert(
          i18n.t('domaine.erreur'),
          i18n.t('photos.selectionImpossible'),
        );
      }
    };

  const prendrePhoto =
    async () => {
      if (!modificationAutorisee) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            i18n.t('photos.permissionGalerie.titre'),
            i18n.t('photos.permissionCamera.texte'),
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
      } catch {
        logger.warn('ObservationCard', 'Prise de photo impossible');

        Alert.alert(
          i18n.t('domaine.erreur'),
          i18n.t('photos.impossiblePrendrePhoto'),
        );
      }
    };

  const choisirPhoto =
    () => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        i18n.t('libelles.ajouterPhoto'),
        'Choisissez une source.',
        [
          {
            text: 'Galerie',
            onPress:
              choisirGalerie,
          },

          {
            text: i18n.t('photos.source.camera'),
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

  const confirmerSuppressionPhoto =
    (
      photo: PhotoObservation,
    ) => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        'Supprimer la photo',
        i18n.t('photos.voulezVraimentSupprimerPhoto'),
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },

          {
            text: i18n.t('libelles.supprimer'),
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await deletePhoto.mutateAsync(
                    photo.id,
                  );

                  await photosQuery.refetch();

                  Alert.alert(
                    i18n.t('domaine.succes'),
                    i18n.t('photos.supprimee'),
                  );
                } catch (
                  err: any
                ) {
                  logger.warn('ObservationCard', "Échec de la suppression d'une photo");

                  Alert.alert(
                    i18n.t('domaine.erreur'),
                    err?.response
                      ?.data
                      ?.message ||
                      i18n.t('photos.impossibleSupprimerPhoto'),
                  );
                }
              },
          },
        ],
      );
    };

  const photos =
    photosQuery.data ?? [];

  return (
    <Pressable
      onPress={() => {}}
      style={({ pressed }) => [
        pressed && {
          opacity: 0.97,
          transform: [
            {
              scale: 0.995,
            },
          ],
        },
      ]}
    >
      <ObservationCard1
        choisirPhoto={choisirPhoto}
        confirmerSuppressionPhoto={confirmerSuppressionPhoto}
        cultureNom={cultureNom}
        deletePhoto={deletePhoto}
        modificationAutorisee={modificationAutorisee}
        observation={observation}
        onModifier={onModifier}
        onSupprimer={onSupprimer}
        parcelleNom={parcelleNom}
        photoEnCours={photoEnCours}
        libelleEnvoi={LIBELLE_ETAPE_ENVOI[etapeEnvoi]}
        photos={photos}
        photosQuery={photosQuery}
        statutCulture={statutCulture}
      />
    </Pressable>
  );
}
