/**
 * InterventionEditScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
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

  /**
   * Préremplit le formulaire lorsque
   * l'intervention est récupérée.
   */
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

  /**
   * Vérification des paramètres.
   */
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

  /**
   * Chargement.
   */
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

  /**
   * Erreur de récupération.
   */
  if (isError || !intervention) {
    const errorMessage =
      (error as any)?.response?.data
        ?.message ||
      'Impossible de récupérer cette intervention.';

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

  /**
   * Enregistrement des modifications.
   */
  const handleSubmit = async () => {
    const typeValue = type.trim();
    const dateValue = date.trim();

    if (!typeValue) {
      Alert.alert(
        'Champ obligatoire',
        'Veuillez saisir le type d’intervention.',
      );
      return;
    }

    if (!dateValue) {
      Alert.alert(
        'Champ obligatoire',
        'Veuillez saisir la date de l’intervention.',
      );
      return;
    }

    const dateObj = new Date(dateValue);

    if (
      Number.isNaN(dateObj.getTime())
    ) {
      Alert.alert(
        'Date invalide',
        'Veuillez saisir une date valide au format AAAA-MM-JJ.',
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
          'Quantité invalide',
          'La quantité doit être un nombre positif ou égal à zéro.',
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
          'Coût invalide',
          'Le coût doit être un nombre positif ou égal à zéro.',
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
        'Succès',
        'L’intervention a été modifiée avec succès.',
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
        'Impossible de modifier l’intervention.';

      Alert.alert(
        'Erreur',
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
