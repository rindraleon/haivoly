/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { i18n } from '@/i18n/instance';
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


  const {
    parcelleId,
    cultureId,
    parcelleNom,
  } = useLocalSearchParams<{
    parcelleId: string;
    cultureId: string;
    parcelleNom?: string;
  }>();


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


  const formaterDate = (
    date: Date | null,
  ) => {

    if (!date) {
      return i18n.t('domaine.choisirDate');
    }

    return formatDate(date);
  };


  const enregistrer = () => {


    if (!nom.trim()) {

      Alert.alert(
        i18n.t('domaine.erreur'),
        i18n.t('cultures.nomCultureObligatoire'),
      );

      return;
    }


    if (
      datePlantation &&
      datePrevueRecolte &&
      datePrevueRecolte <
        datePlantation
    ) {

      Alert.alert(
        i18n.t('domaine.erreur'),
        i18n.t('domaine.dateRecolteApresPlantation'),
      );

      return;
    }


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

        onSuccess: () => {

          Alert.alert(
            i18n.t('domaine.succes'),
            i18n.t('cultures.modifiee'),
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


        onError: (
          error: any,
        ) => {

          logger.warn('CultureEditScreen', 'Échec de la modification de la culture');

          Alert.alert(
            i18n.t('domaine.erreur'),

            error?.response?.data
              ?.message ||

              i18n.t('cultures.impossibleModifierCulture'),
          );

        },
      },
    );

  };


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

