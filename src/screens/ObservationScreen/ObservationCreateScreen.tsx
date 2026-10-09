 

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

  const statutLabel = useMemo(() => {
    switch (statut) {
      case 'PLANIFIEE':
        return 'PLANIFIÉE';

      case 'EN_COURS':
        return 'EN COURS';

      case 'RECOLTEE':
        return 'RÉCOLTÉE';

      case 'ABANDONNEE':
        return 'ABANDONNÉE';

      case 'SUPPRIMEE':
        return 'SUPPRIMÉE';

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
          'Action impossible',
          'Cette culture est en lecture seule.',
        );

        return;
      }

      if (
        !parcelleId ||
        !cultureId
      ) {
        Alert.alert(
          'Erreur',
          'La parcelle ou la culture est introuvable.',
        );

        return;
      }

      if (!description.trim()) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir une description.',
        );

        return;
      }

      try {
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

        Alert.alert(
          'Observation enregistrée',
          'Votre observation terrain a été ajoutée avec succès.',
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
          'Erreur',
          error?.response?.data
            ?.message ||
            "Impossible d'enregistrer l'observation.",
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
      setDate={setDate}
      setDescription={setDescription}
      statutLabel={statutLabel}
    />
  );
}
