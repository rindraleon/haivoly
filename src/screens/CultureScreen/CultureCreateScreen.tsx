/**
 * CultureCreateScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
 

import { useState } from 'react';

import { Alert } from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';



import type { CulturePayload } from '@/types';

import { useCreateCulture } from '@/hooks';












import { VueCreationCulture } from '@/components/CultureComponent/VueCreationCulture';
import { formatDate, toDateOnly } from '@/utils/date';
import { logger } from '@/utils/logger';
export default function AjouterCultureScreen() {
  const {
    parcelleId,
    parcelleNom,
  } = useLocalSearchParams<{
    parcelleId: string;
    parcelleNom?: string;
  }>();

  const createCulture =
    useCreateCulture();

  // =====================================================
  // INFORMATIONS CULTURE
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

  // =====================================================
  // DÉLIMITATION
  // =====================================================

  const [
    demanderDelimitation,
    setDemanderDelimitation,
  ] = useState(false);

  // =====================================================
  // NAVIGATION UX
  // =====================================================

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate =
    (date: Date | null) => {
      if (!date) {
        return 'Choisir une date';
      }

      return formatDate(date);
    };

  // =====================================================
  // ENREGISTRER
  // =====================================================

  const enregistrer = () => {
    if (!parcelleId) {
      Alert.alert(
        'Erreur',
        'Identifiant de la parcelle introuvable.',
      );
      return;
    }

    if (!nom.trim()) {
      Alert.alert(
        'Erreur',
        'Le nom de la culture est obligatoire.',
      );

      setCurrentStep(1);

      return;
    }

    // Vérification des dates
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

      setCurrentStep(2);

      return;
    }

    const data: CulturePayload = {
      nom: nom.trim(),

      type:
        type.trim() ||
        undefined,

      variete:
        variete.trim() ||
        undefined,

      // Dates calendaires : `YYYY-MM-DD`, jamais un instant ISO (le serveur
      // stocke des colonnes `date`).
      datePlantation:
        toDateOnly(datePlantation) ?? undefined,

      datePrevueRecolte:
        toDateOnly(datePrevueRecolte) ?? undefined,

      stade:
        stade.trim() ||
        undefined,

      description:
        description.trim() ||
        undefined,

      // Aucun statut envoyé : le serveur décide (PLANIFIEE si la plantation est
      // à venir, EN_COURS sinon) — le mobile ne fait qu'afficher ce qu'il reçoit.
    };

    // ===================================================
    // CRÉATION DE LA CULTURE
    // ===================================================

    createCulture.mutate(
      {
        parcelleId,
        body: data,
      },
      {
        onSuccess: (culture) => {
          // =================================================
          // SI L'UTILISATEUR VEUT DÉLIMITER
          // =================================================

          if (
            demanderDelimitation
          ) {
            router.replace({
              pathname:
                '/delimiter-culture',
              params: {
                parcelleId,
                parcelleNom:
                  parcelleNom || '',
                cultureId:
                  culture.id,
                cultureNom:
                  culture.nom,
              },
            });

            return;
          }

          // =================================================
          // SINON RETOUR AUX CULTURES
          // =================================================

          Alert.alert(
            'Succès',
            'La culture a été ajoutée.',
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
          logger.warn('CultureCreateScreen', 'Échec de la création de la culture');

          Alert.alert(
            'Erreur',
            error?.response?.data
              ?.message ||
              "Impossible d'ajouter la culture.",
          );
        },
      },
    );
  };

  // =====================================================
  // NAVIGATION ENTRE ÉTAPES
  // =====================================================

  const goToStep2 = () => {
    if (!nom.trim()) {
      Alert.alert(
        'Nom obligatoire',
        'Veuillez saisir le nom de la culture.',
      );
      return;
    }

    setCurrentStep(2);
  };

  const goToStep3 = () => {
    if (
      datePlantation &&
      datePrevueRecolte &&
      datePrevueRecolte <
        datePlantation
    ) {
      Alert.alert(
        'Dates invalides',
        'La date prévue de récolte doit être après la date de plantation.',
      );
      return;
    }

    setCurrentStep(3);
  };

  const goBackStep = () => {
    if (currentStep === 1) {
      router.back();
      return;
    }

    setCurrentStep(
      currentStep - 1,
    );
  };

  // =====================================================
  // ÉTATS POUR LE REVIEW
  // =====================================================

  const hasDates =
    !!datePlantation ||
    !!datePrevueRecolte;

  const stepLabels = [
    'Informations',
    'Planification',
    'Vérification',
  ];

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <VueCreationCulture
      createCulture={createCulture}
      currentStep={currentStep}
      datePicker={datePicker}
      datePlantation={datePlantation}
      datePrevueRecolte={datePrevueRecolte}
      demanderDelimitation={demanderDelimitation}
      description={description}
      enregistrer={enregistrer}
      formaterDate={formaterDate}
      goBackStep={goBackStep}
      goToStep2={goToStep2}
      goToStep3={goToStep3}
      hasDates={hasDates}
      nom={nom}
      parcelleId={parcelleId}
      parcelleNom={parcelleNom}
      setCurrentStep={setCurrentStep}
      setDatePicker={setDatePicker}
      setDatePlantation={setDatePlantation}
      setDatePrevueRecolte={setDatePrevueRecolte}
      setDemanderDelimitation={setDemanderDelimitation}
      setDescription={setDescription}
      setNom={setNom}
      setStade={setStade}
      setType={setType}
      setVariete={setVariete}
      stade={stade}
      stepLabels={stepLabels}
      type={type}
      variete={variete}
    />
  );
}

// =======================================================
// COMPOSANTS UX RÉUTILISABLES
// =======================================================

// =======================================================
// STYLES
// =======================================================
