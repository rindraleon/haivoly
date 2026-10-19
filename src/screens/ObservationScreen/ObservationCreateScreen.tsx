 
import { i18n } from '@/i18n/instance';

import {
  useMemo,
  useState,
} from 'react';

import { Alert } from 'react-native';



import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCreateObservation,
} from '@/hooks';


import { VueCreationObservation } from '@/components/ObservationComponent/VueCreationObservation';
import { logger } from '@/utils/logger';
import { observationPhotosApi } from '@/services';
import { envoyerPhotosEnAttente } from '@/utils/envoiPhotos';
import type { PhotoBrouillon } from '@/components/CommonComponent/PhotosSelection';
type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export default function AjoutObservationScreen() {
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
      : 'EN_COURS';

  const createMutation =
    useCreateObservation();

  const [description, setDescription] =
    useState('');

  const [date, setDate] =
    useState(
      new Date().toISOString(),
    );

  // Photos mises en attente : envoyées après création de l'observation.
  const [photosBrouillon, setPhotosBrouillon] =
    useState<PhotoBrouillon[]>([]);
  const [envoiPhotos, setEnvoiPhotos] =
    useState(false);

  const statutLabel = useMemo(() => {
    switch (statut) {
      case 'PLANIFIEE':
        return i18n.t('statuts.PLANIFIEE');

      case 'EN_COURS':
        return i18n.t('statuts.EN_COURS');

      case 'RECOLTEE':
        return i18n.t('statuts.RECOLTEE');

      case 'ABANDONNEE':
        return i18n.t('statuts.ABANDONNEE');

      case 'SUPPRIMEE':
        return i18n.t('statuts.SUPPRIMEE');

      default:
        return statut;
    }
  }, [statut]);

  const enregistrer =
    async () => {
      if (
        statut === 'SUPPRIMEE' ||
        statut === 'RECOLTEE' ||
        statut === 'ABANDONNEE'
      ) {
        Alert.alert(
          i18n.t('divers.actionImpossible'),
          i18n.t('cultures.cultureLectureSeule'),
        );

        return;
      }

      if (
        !parcelleId ||
        !cultureId
      ) {
        Alert.alert(
          i18n.t('domaine.erreur'),
          i18n.t('parcelles.parcelleOuCultureIntrouvable'),
        );

        return;
      }

      if (!description.trim()) {
        Alert.alert(
          i18n.t('domaine.champObligatoire'),
          i18n.t('divers.veuillezSaisirDescription'),
        );

        return;
      }

      try {
        const creee =
          await createMutation.mutateAsync(
            {
              cultureId,
              body: {
                description:
                  description.trim(),
                date:
                  date.trim() ||
                  undefined,
              },
            },
          );

        // Photos jointes : envoyées une fois l'observation créée (hors-ligne
        // — observation locale sans identifiant serveur — elles resteront à
        // ajouter depuis la fiche de l'observation).
        if (
          photosBrouillon.length > 0 &&
          creee?.id &&
          !creee._localOnly &&
          parcelleId
        ) {
          setEnvoiPhotos(true);
          try {
            const bilan =
              await envoyerPhotosEnAttente(
                photosBrouillon,
                (fichier) =>
                  observationPhotosApi.upload(
                    parcelleId,
                    cultureId,
                    creee.id,
                    fichier,
                  ),
              );

            if (bilan.echouees > 0) {
              Alert.alert(
                i18n.t('observations.enregistree'),
                i18n.t(
                  'photos.photosJointesPartiel',
                  {
                    envoyees:
                      bilan.envoyees,
                    echouees:
                      bilan.echouees,
                  },
                ),
                [
                  {
                    text: 'OK',
                    onPress: () =>
                      router.back(),
                  },
                ],
              );
              return;
            }
          } finally {
            setEnvoiPhotos(false);
          }
        }

        Alert.alert(
          i18n.t('observations.enregistree'),
          i18n.t('observations.ajouteeSucces'),
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error: any) {
        logger.warn('ObservationCreateScreen', "Échec de la création de l'observation");

        Alert.alert(
          i18n.t('domaine.erreur'),
          error?.response?.data
            ?.message ||
            i18n.t('observations.impossibleDEnregistrerL'),
        );
      }
    };

  return (
    <VueCreationObservation
      createMutation={createMutation}
      cultureNom={cultureNom}
      date={date}
      description={description}
      enregistrer={enregistrer}
      parcelleNom={parcelleNom}
      photos={photosBrouillon}
      onChangePhotos={setPhotosBrouillon}
      envoiPhotosEnCours={envoiPhotos}
      setDate={setDate}
      setDescription={setDescription}
      statutLabel={statutLabel}
    />
  );
}
