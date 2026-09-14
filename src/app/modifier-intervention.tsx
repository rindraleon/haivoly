import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  useIntervention,
  useUpdateIntervention,
} from '@/hooks/useInterventions';

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
  } = useIntervention(
    parcelleId,
    cultureId,
    interventionId,
  );

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
        parcelleId,
        cultureId,
        interventionId,
        data: {
          type: typeValue,
          description:
            description.trim() ||
            undefined,
          date: dateValue,
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>
          Modifier l’intervention
        </Text>

        <View style={styles.contextCard}>
          <Text style={styles.contextLabel}>
            Parcelle
          </Text>

          <Text style={styles.contextValue}>
            {parcelleNom || 'Parcelle'}
          </Text>

          <Text
            style={[
              styles.contextLabel,
              styles.cultureLabel,
            ]}
          >
            Culture
          </Text>

          <Text style={styles.contextValue}>
            {cultureNom || 'Culture'}
          </Text>
        </View>

        {/* TYPE */}
        <Text style={styles.label}>
          Type d’intervention *
        </Text>

        <TextInput
          style={styles.input}
          value={type}
          onChangeText={setType}
          placeholder="Ex : FERTILISATION"
          placeholderTextColor="#999"
          editable={
            !updateMutation.isPending
          }
        />

        {/* DATE */}
        <Text style={styles.label}>
          Date *
        </Text>

        <TextInput
          style={styles.input}
          value={date}
          onChangeText={setDate}
          placeholder="AAAA-MM-JJ"
          placeholderTextColor="#999"
          keyboardType="numbers-and-punctuation"
          editable={
            !updateMutation.isPending
          }
        />

        {/* DESCRIPTION */}
        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textarea,
          ]}
          value={description}
          onChangeText={setDescription}
          placeholder="Description de l’intervention"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={
            !updateMutation.isPending
          }
        />

        {/* PRODUIT */}
        <Text style={styles.label}>
          Produit
        </Text>

        <TextInput
          style={styles.input}
          value={produit}
          onChangeText={setProduit}
          placeholder="Ex : NPK 15-15-15"
          placeholderTextColor="#999"
          editable={
            !updateMutation.isPending
          }
        />

        {/* QUANTITE */}
        <Text style={styles.label}>
          Quantité
        </Text>

        <TextInput
          style={styles.input}
          value={quantite}
          onChangeText={setQuantite}
          placeholder="Ex : 30"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
          editable={
            !updateMutation.isPending
          }
        />

        {/* UNITE */}
        <Text style={styles.label}>
          Unité
        </Text>

        <TextInput
          style={styles.input}
          value={unite}
          onChangeText={setUnite}
          placeholder="Ex : kg, L, sacs..."
          placeholderTextColor="#999"
          editable={
            !updateMutation.isPending
          }
        />

        {/* COUT */}
        <Text style={styles.label}>
          Coût
        </Text>

        <TextInput
          style={styles.input}
          value={cout}
          onChangeText={setCout}
          placeholder="Ex : 180000"
          placeholderTextColor="#999"
          keyboardType="decimal-pad"
          editable={
            !updateMutation.isPending
          }
        />

        {/* BOUTON ENREGISTRER */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            updateMutation.isPending &&
              styles.disabledButton,
          ]}
          onPress={handleSubmit}
          disabled={
            updateMutation.isPending
          }
        >
          {updateMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={styles.saveButtonText}
            >
              💾 Enregistrer les modifications
            </Text>
          )}
        </TouchableOpacity>

        {/* BOUTON ANNULER */}
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={
            updateMutation.isPending
          }
        >
          <Text
            style={styles.cancelButtonText}
          >
            ← Annuler
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7f2',
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f7f2',
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#2e5d2e',
    marginBottom: 20,
    textAlign: 'center',
  },

  contextCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },

  contextLabel: {
    fontSize: 13,
    color: '#558b2f',
    fontWeight: '600',
    marginBottom: 3,
  },

  cultureLabel: {
    marginTop: 12,
  },

  contextValue: {
    fontSize: 16,
    color: '#263238',
    fontWeight: '600',
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#37474f',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cfd8dc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#263238',
  },

  textarea: {
    minHeight: 110,
    paddingTop: 12,
  },

  saveButton: {
    minHeight: 52,
    borderRadius: 10,
    backgroundColor: '#558b2f',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
    paddingHorizontal: 15,
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },

  cancelButton: {
    minHeight: 50,
    borderRadius: 10,
    backgroundColor: '#eceff1',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },

  cancelButtonText: {
    color: '#455a64',
    fontSize: 16,
    fontWeight: '600',
  },

  loadingText: {
    marginTop: 12,
    color: '#546e7a',
    fontSize: 15,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#c62828',
    marginBottom: 8,
  },

  errorText: {
    color: '#546e7a',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },

  backButton: {
    backgroundColor: '#558b2f',
    paddingHorizontal: 25,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});