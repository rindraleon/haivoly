/**
 * CultureEditScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { useEffect, useState } from 'react';

import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';



import { styles } from './CultureEditScreen.styles';



import {
  useCulture,
  useUpdateCulture,
} from '@/hooks';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { VueModificationCulture } from '@/components/CultureComponent/VueModificationCulture';
import { formatDate , dateOnlyVersDateLocale, toDateOnly } from '@/utils/date';
import type {
  StatutCulture,
} from '@/types';
import { logger } from '@/utils/logger';
export default function ModifierCultureScreen() {

  // =====================================================
  // PARAMÈTRES
  // =====================================================

  const {
    parcelleId,
    cultureId,
    parcelleNom,
  } = useLocalSearchParams<{
    parcelleId: string;
    cultureId: string;
    parcelleNom?: string;
  }>();

  // =====================================================
  // CULTURE
  // =====================================================

  const {
    data: culture,
    isLoading,
    isError,
  } = useCulture(
    parcelleId,
    cultureId,
  );

  const updateCulture =
    useUpdateCulture();

  // =====================================================
  // ÉTATS
  // =====================================================

  const [nom, setNom] =
    useState('');

  const [type, setType] =
    useState('');

  const [variete, setVariete] =
    useState('');

  const [datePlantation, setDatePlantation] =
    useState<Date | null>(null);

  const [datePrevueRecolte, setDatePrevueRecolte] =
    useState<Date | null>(null);

  const [datePicker, setDatePicker] =
    useState<
      'plantation' | 'recolte' | null
    >(null);

  const [stade, setStade] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [statut, setStatut] =
    useState<StatutCulture>(
      'PLANIFIEE',
    );

  // =====================================================
  // CHARGER LES DONNÉES DE LA CULTURE
  // =====================================================

  useEffect(() => {

    if (!culture) {
      return;
    }

    setNom(
      culture.nom ?? '',
    );

    setType(
      culture.type ?? '',
    );

    setVariete(
      culture.variete ?? '',
    );

    setStade(
      culture.stade ?? '',
    );

    setDescription(
      culture.description ?? '',
    );

    setStatut(
      culture.statut,
    );

    // ---------------------------------------------------
    // DATE PLANTATION
    // ---------------------------------------------------

    if (
      culture.datePlantation
    ) {

      // Minuit **local** : évite le décalage d'un jour à l'affichage.
      setDatePlantation(
        dateOnlyVersDateLocale(
          culture.datePlantation,
        ),
      );

    } else {

      setDatePlantation(null);

    }

    // ---------------------------------------------------
    // DATE RÉCOLTE
    // ---------------------------------------------------

    if (
      culture.datePrevueRecolte
    ) {

      setDatePrevueRecolte(
        dateOnlyVersDateLocale(
          culture.datePrevueRecolte,
        ),
      );

    } else {

      setDatePrevueRecolte(null);

    }

  }, [culture]);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate = (
    date: Date | null,
  ) => {

    if (!date) {
      return 'Choisir une date';
    }

    return formatDate(date);
  };

  // =====================================================
  // ENREGISTRER
  // =====================================================

  const enregistrer = () => {

    // ---------------------------------------------------
    // NOM
    // ---------------------------------------------------

    if (!nom.trim()) {

      Alert.alert(
        'Erreur',
        'Le nom de la culture est obligatoire.',
      );

      return;
    }

    // ---------------------------------------------------
    // DATES
    // ---------------------------------------------------

    if (
      datePlantation &&
      datePrevueRecolte &&
      datePrevueRecolte <
        datePlantation
    ) {

      Alert.alert(
        'Erreur',
        'La date prévue de récolte doit être après la date de plantation.',
      );

      return;
    }

    // ---------------------------------------------------
    // MODIFICATION
    // ---------------------------------------------------

    updateCulture.mutate(
      {
        parcelleId,
        cultureId,

        body: {

          nom:
            nom.trim(),

          type:
            type.trim() ||
            undefined,

          variete:
            variete.trim() ||
            undefined,

          datePlantation:
            toDateOnly(
              datePlantation,
            ) ?? undefined,

          datePrevueRecolte:
            toDateOnly(
              datePrevueRecolte,
            ) ?? undefined,

          stade:
            stade.trim() ||
            undefined,

          description:
            description.trim() ||
            undefined,

          statut,
        },
      },

      {
        // ------------------------------------------------
        // SUCCÈS
        // ------------------------------------------------

        onSuccess: () => {

          Alert.alert(
            'Succès',
            'La culture a été modifiée avec succès.',
            [
              {
                text: 'OK',

                onPress: () => {
                  router.back();
                },
              },
            ],
          );

        },

        // ------------------------------------------------
        // ERREUR
        // ------------------------------------------------

        onError: (
          error: any,
        ) => {

          logger.warn('CultureEditScreen', 'Échec de la modification de la culture');

          Alert.alert(
            'Erreur',

            error?.response?.data
              ?.message ||

              'Impossible de modifier la culture.',
          );

        },
      },
    );

  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (isLoading) {

    return (

      <View
        style={
          styles.center
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
          Chargement de la culture...
        </Text>

      </View>

    );

  }

  // =====================================================
  // ERREUR
  // =====================================================

  if (
    isError ||
    !culture
  ) {

    return (

      <View
        style={
          styles.center
        }
      >

        <Text
          style={
            styles.errorTitle
          }
        >
          Impossible de charger la culture
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          La culture demandée
          n'a pas pu être récupérée.
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
              styles.backText
            }
          >
            Retour
          </Text>

        </TouchableOpacity>

      </View>

    );

  }

  // =====================================================
  // AFFICHAGE
  // =====================================================

  return (

    <VueModificationCulture
      datePicker={datePicker}
      datePlantation={datePlantation}
      datePrevueRecolte={datePrevueRecolte}
      description={description}
      enregistrer={enregistrer}
      formaterDate={formaterDate}
      nom={nom}
      parcelleId={parcelleId}
      parcelleNom={parcelleNom}
      setDatePicker={setDatePicker}
      setDatePlantation={setDatePlantation}
      setDatePrevueRecolte={setDatePrevueRecolte}
      setDescription={setDescription}
      setNom={setNom}
      setStade={setStade}
      setStatut={setStatut}
      setType={setType}
      setVariete={setVariete}
      stade={stade}
      statut={statut}
      type={type}
      updateCulture={updateCulture}
      variete={variete}
    />

  );
}

// =======================================================
// STYLES
// =======================================================
