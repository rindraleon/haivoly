 
import { i18n } from '@/i18n/instance';

import { useState } from 'react';

import { Alert } from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';



import type { CulturePayload } from '@/types';

import { useCreateCulture } from '@/hooks';












import { VueCreationCulture } from '@/components/CultureComponent/VueCreationCulture';
import { toApiError } from '@/services/http';
import { formatDate, toDateOnly } from '@/utils/date';
import { messageErreur } from '@/utils/erreur';
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


  const [
    demanderDelimitation,
    setDemanderDelimitation,
  ] = useState(false);


  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);


  const formaterDate =
    (date: Date | null) => {
      if (!date) {
        return i18n.t('domaine.choisirDate');
      }

      return formatDate(date);
    };


  const enregistrer = () => {
    // Anti double-soumission : un second appui pendant la requête ne
    // déclenche jamais une création en double.
    if (createCulture.isPending) {
      return;
    }

    if (!parcelleId) {
      Alert.alert(
        i18n.t('domaine.erreur'),
        i18n.t('parcelles.identifiantParcelleIntrouvable'),
      );
      return;
    }

    if (!nom.trim()) {
      Alert.alert(
        i18n.t('domaine.erreur'),
        i18n.t('cultures.nomCultureObligatoire'),
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
        i18n.t('domaine.erreur'),
        i18n.t('domaine.dateRecolteApresPlantation'),
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


    createCulture.mutate(
      {
        parcelleId,
        body: data,
      },
      {
        onSuccess: (culture) => {

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


          Alert.alert(
            i18n.t('domaine.succes'),
            i18n.t('cultures.ajoutee'),
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
          error: unknown,
        ) => {
          // Journal de diagnostic SANS données sensibles : statut HTTP, code
          // d'erreur stable, noms des champs invalides, champs envoyés.
          // (Les valeurs saisies et le jeton de session ne sont jamais loggés.)
          const apiErreur = toApiError(error);
          logger.warn('CultureCreateScreen', 'Échec de la création de la culture', {
            statut: apiErreur.status,
            code: apiErreur.code,
            parcelleConnue: Boolean(parcelleId),
            champsInvalides: apiErreur.fields.map((champ) => champ.field),
            clesEnvoyees: Object.keys(data),
          });

          Alert.alert(
            i18n.t('domaine.erreur'),
            messageErreur(error, i18n.t('cultures.impossibleDAjouterCulture')),
          );
        },
      },
    );
  };


  const goToStep2 = () => {
    if (!nom.trim()) {
      Alert.alert(
        'Nom obligatoire',
        i18n.t('cultures.veuillezSaisirNomCulture'),
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
        i18n.t('domaine.dateRecolteApresPlantation'),
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


  const hasDates =
    !!datePlantation ||
    !!datePrevueRecolte;

  const stepLabels = [
    i18n.t('libelles.informations'),
    'Planification',
    i18n.t('cultures.verification'),
  ];


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


