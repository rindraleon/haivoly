/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { i18n } from '@/i18n/instance';
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import { styles } from './InterventionEditScreen.styles';

import {
  useIntervention,
  useUpdateIntervention,
} from '@/hooks';

import { VueModificationIntervention } from '@/components/InterventionComponent/VueModificationIntervention';
import { dateOnlyVersIso } from '@/utils/date';
export default function ModifierInterventionScreen() {
  const params = useLocalSearchParams<{
    parcelleId?: string;
    cultureId?: string;
    interventionId?: string;
    parcelleNom?: string;
    cultureNom?: string;
  }>();

  const parcelleId = params.parcelleId ?? '';
  const cultureId = params.cultureId ?? '';
  const interventionId = params.interventionId ?? '';

  const parcelleNom = params.parcelleNom ?? '';
  const cultureNom = params.cultureNom ?? '';

  const {
    data: intervention,
    isLoading,
    isError,
    error,
  } = useIntervention(interventionId);

  const updateMutation =
    useUpdateIntervention();

  const [type, setType] = useState('');
  const [description, setDescription] =
    useState('');
  const [date, setDate] = useState('');
  const [produit, setProduit] =
    useState('');
  const [quantite, setQuantite] =
    useState('');
  const [unite, setUnite] =
    useState('');
  const [cout, setCout] = useState('');

  const [initialise, setInitialise] =
    useState(false);

  useEffect(() => {
    if (!intervention || initialise) {
      return;
    }

    setType(intervention.type ?? '');

    setDescription(
      intervention.description ?? '',
    );

    setDate(
      intervention.date
        ? intervention.date.split('T')[0]
        : '',
    );

    setProduit(
      intervention.produit ?? '',
    );

    setQuantite(
      intervention.quantite !== null &&
      intervention.quantite !== undefined
        ? String(intervention.quantite)
        : '',
    );

    setUnite(
      intervention.unite ?? '',
    );

    setCout(
      intervention.cout !== null &&
      intervention.cout !== undefined
        ? String(intervention.cout)
        : '',
    );

    setInitialise(true);
  }, [intervention, initialise]);

  if (
    !parcelleId ||
    !cultureId ||
    !interventionId
  ) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Paramètres manquants
        </Text>

        <Text style={styles.errorText}>
          Impossible de modifier cette
          intervention.
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            ← Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Chargement de l'intervention...
        </Text>
      </View>
    );
  }

  if (isError || !intervention) {
    const errorMessage =
      (error as any)?.response?.data
        ?.message ||
      i18n.t('interventions.recupImpossible');

    return (
      <View style={styles.center}>
        <Text style={styles.errorTitle}>
          Erreur
        </Text>

        <Text style={styles.errorText}>
          {Array.isArray(errorMessage)
            ? errorMessage.join('\n')
            : String(errorMessage)}
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            ← Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleSubmit = async () => {
    const typeValue = type.trim();
    const dateValue = date.trim();

    if (!typeValue) {
      Alert.alert(
        i18n.t('domaine.champObligatoire'),
        i18n.t('interventions.veuillezSaisirTypeD'),
      );
      return;
    }

    if (!dateValue) {
      Alert.alert(
        i18n.t('domaine.champObligatoire'),
        i18n.t('interventions.veuillezSaisirDateL'),
      );
      return;
    }

    const dateObj = new Date(dateValue);

    if (
      Number.isNaN(dateObj.getTime())
    ) {
      Alert.alert(
        'Date invalide',
        i18n.t('domaine.veuillezSaisirDateValide'),
      );
      return;
    }

    let quantiteValue:
      | number
      | undefined;

    if (quantite.trim()) {
      const parsedQuantite =
        Number(
          quantite.replace(',', '.'),
        );

      if (
        Number.isNaN(parsedQuantite) ||
        parsedQuantite < 0
      ) {
        Alert.alert(
          i18n.t('domaine.quantiteInvalide'),
          i18n.t('interventions.quantiteInvalidePositive'),
        );
        return;
      }

      quantiteValue = parsedQuantite;
    }

    let coutValue:
      | number
      | undefined;

    if (cout.trim()) {
      const parsedCout =
        Number(
          cout.replace(',', '.'),
        );

      if (
        Number.isNaN(parsedCout) ||
        parsedCout < 0
      ) {
        Alert.alert(
          i18n.t('domaine.coutInvalide'),
          i18n.t('interventions.coutInvalidePositif'),
        );
        return;
      }

      coutValue = parsedCout;
    }

    try {
      await updateMutation.mutateAsync({
        id: interventionId,
        cultureId,
        body: {
          type: typeValue,
          description:
            description.trim() ||
            undefined,
          date: dateOnlyVersIso(dateValue) ?? undefined,
          produit:
            produit.trim() ||
            undefined,
          quantite: quantiteValue,
          unite:
            unite.trim() ||
            undefined,
          cout: coutValue,
        },
      });

      Alert.alert(
        i18n.t('domaine.succes'),
        i18n.t('interventions.modifieeSucces'),
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        i18n.t('interventions.impossibleModifierLIntervention');

      Alert.alert(
        i18n.t('domaine.erreur'),
        Array.isArray(message)
          ? message.join('\n')
          : String(message),
      );
    }
  };

  return (
    <VueModificationIntervention
      cout={cout}
      cultureNom={cultureNom}
      date={date}
      description={description}
      handleSubmit={handleSubmit}
      parcelleNom={parcelleNom}
      produit={produit}
      quantite={quantite}
      setCout={setCout}
      setDate={setDate}
      setDescription={setDescription}
      setProduit={setProduit}
      setQuantite={setQuantite}
      setType={setType}
      setUnite={setUnite}
      type={type}
      unite={unite}
      updateMutation={updateMutation}
    />
  );
}
