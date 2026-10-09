/* eslint-disable react/no-unescaped-entities */

import { useMemo, useState } from 'react';

import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { FileText, Pencil } from 'lucide-react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useObservations,
  useUpdateObservation,
} from '@/hooks';

import { styles } from './ObservationEditScreen.styles';

import { StatutCulture } from '@/screens/ObservationScreen/ObservationEditScreen.helpers';
import { VueModificationObservation } from '@/components/ObservationComponent/VueModificationObservation';
import { logger } from '@/utils/logger';
export default function ModifierObservationScreen() {
  const params =
    useLocalSearchParams<{
      parcelleId?: string;
      cultureId?: string;
      observationId?: string;
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

  const observationId =
    typeof params.observationId === 'string'
      ? params.observationId
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

  const observationsQuery =
    useObservations(cultureId);

  const updateMutation =
    useUpdateObservation();


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


  const observationInitiale = observationsQuery.data?.find(
    (item) => item.id === observationId,
  );

  const [editionLocale, setEditionLocale] = useState<{
    description?: string;
    date?: string;
  }>({});

  const description =
    editionLocale.description ?? observationInitiale?.description ?? '';
  const date =
    editionLocale.date ?? observationInitiale?.date ?? new Date(0).toISOString();

  const setDescription = (valeur: string) =>
    setEditionLocale((precedent) => ({ ...precedent, description: valeur }));
  const setDate = (valeur: string) =>
    setEditionLocale((precedent) => ({ ...precedent, date: valeur }));

  

  const modificationAutorisee =
    statut !== 'SUPPRIMEE' &&
    statut !== 'RECOLTEE' &&
    statut !== 'ABANDONNEE';


  const enregistrer =
    async () => {
      if (!modificationAutorisee) {
        Alert.alert(
          'Action impossible',
          'Cette culture est en lecture seule.',
        );

        return;
      }

      if (
        !parcelleId ||
        !cultureId ||
        !observationId
      ) {
        Alert.alert(
          'Erreur',
          'Les informations de l’observation sont incomplètes.',
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
        await updateMutation.mutateAsync(
          {
            id: observationId,
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
          'Observation mise à jour',
          'Votre observation terrain a été modifiée avec succès.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error: any) {
        logger.warn('ObservationEditScreen', "Échec de la modification de l'observation");

        Alert.alert(
          'Erreur',
          error?.response?.data
            ?.message ||
            "Impossible de modifier l'observation.",
        );
      }
    };


  if (
    !parcelleId ||
    !cultureId ||
    !observationId
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <FileText
            size={24}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Observation introuvable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Les paramètres nécessaires à la
          modification sont manquants.
        </Text>

        <TouchableOpacity
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  if (observationsQuery.isLoading) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.loadingIcon
          }
        >
          <Pencil
            size={21}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <ActivityIndicator
          size="small"
          color="#166534"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement de l'observation...
        </Text>
      </View>
    );
  }


  if (
    observationsQuery.isError
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <FileText
            size={24}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Impossible de charger
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          L'observation n'a pas pu être chargée.
        </Text>

        <TouchableOpacity
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  const observation =
    observationsQuery.data?.find(
      item =>
        item.id ===
        observationId,
    );

  if (!observation) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <FileText
            size={24}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Observation introuvable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Cette observation n'existe plus
          ou n'est plus accessible.
        </Text>

        <TouchableOpacity
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }


  return (
    <VueModificationObservation
      cultureNom={cultureNom}
      date={date}
      description={description}
      enregistrer={enregistrer}
      modificationAutorisee={modificationAutorisee}
      observation={observation}
      parcelleNom={parcelleNom}
      setDate={setDate}
      setDescription={setDescription}
      statutLabel={statutLabel}
      updateMutation={updateMutation}
    />
  );
}


