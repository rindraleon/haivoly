/**
 * Sous-composant `ObservationCard` extrait de `ObservationListScreen`.
 *
 * Regroupe la présentation d'un élément de liste et ses interactions
 * locales, ce qui allège nettement le composant principal.
 */
import { Alert, Pressable } from 'react-native';



import * as ImagePicker from 'expo-image-picker';



import {
  useDeletePhotoObservation,
  usePhotosObservation,
  useUploadPhotoObservation,
} from '@/hooks/observation/usePhotosObservations';
import { useState } from 'react';
import { StatutCulture } from '@/screens/ObservationScreen/ObservationListScreen.helpers';


import { ObservationCard1 } from '@/components/ObservationComponent/ObservationCard1';
import type {
  Observation,
  PhotoObservation,
} from '@/types';
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

  const envoyerPhoto =
    async (
      uri: string,
    ) => {
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
      } catch (
        error: any
      ) {
        console.error(
          'ERREUR UPLOAD PHOTO OBSERVATION:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          error?.response?.data
            ?.message ||
            "Impossible d'envoyer la photo.",
        );
      } finally {
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
      } catch (
        error
      ) {
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
      } catch (
        error
      ) {
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

  const confirmerSuppressionPhoto =
    (
      photo: PhotoObservation,
    ) => {
      if (!modificationAutorisee) {
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

            onPress:
              async () => {
                try {
                  await deletePhoto.mutateAsync(
                    photo.id,
                  );

                  await photosQuery.refetch();

                  Alert.alert(
                    'Succès',
                    'Photo supprimée.',
                  );
                } catch (
                  err: any
                ) {
                  console.error(
                    'ERREUR SUPPRESSION PHOTO OBSERVATION:',
                    err,
                  );

                  Alert.alert(
                    'Erreur',
                    err?.response
                      ?.data
                      ?.message ||
                      'Impossible de supprimer la photo.',
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
        photos={photos}
        photosQuery={photosQuery}
        statutCulture={statutCulture}
      />
    </Pressable>
  );
}
