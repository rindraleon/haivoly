import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import { useQueryClient } from '@tanstack/react-query';

import { api } from '@/api/client';

const TYPES_SOL = [
  'Argileux',
  'Sableux',
  'Limoneux',
  'Argilo-limoneux',
  'Humifère',
  'Latéritique',
  'Rocheux',
];

export default function ModifierParcelleScreen() {

  // =====================================================
  // RÉCUPÉRER L'ID ENVOYÉ PAR LA LISTE
  // =====================================================

  const { parcelleId } =
    useLocalSearchParams<{
      parcelleId: string;
    }>();

  const queryClient = useQueryClient();

  const [nom, setNom] = useState('');
  const [description, setDescription] = useState('');
  const [typeSol, setTypeSol] = useState('');

  const [showTypesSol, setShowTypesSol] =
    useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // =====================================================
  // CHARGER LA PARCELLE
  // =====================================================

  useEffect(() => {

    const chargerParcelle = async () => {

      console.log(
        'ID PARCELLE REÇU:',
        parcelleId,
      );

      if (!parcelleId) {

        Alert.alert(
          'Erreur',
          'Identifiant de la parcelle introuvable.',
        );

        router.back();

        return;
      }

      try {

        setLoading(true);

        const response = await api.get(
          `/parcelles/${parcelleId}`,
        );

        console.log(
          'PARCELLE RÉCUPÉRÉE:',
          response.data,
        );

        const parcelle = response.data;

        setNom(
          parcelle.nom ?? '',
        );

        setDescription(
          parcelle.description ?? '',
        );

        setTypeSol(
          parcelle.typeSol ?? '',
        );

      } catch (error: any) {

        console.log(
          'ERREUR CHARGEMENT PARCELLE:',
          error?.response?.data || error,
        );

        Alert.alert(
          'Erreur',
          'Impossible de récupérer les informations de la parcelle.',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ],
        );

      } finally {

        setLoading(false);

      }
    };

    chargerParcelle();

  }, [parcelleId]);

  // =====================================================
  // MODIFIER
  // =====================================================

  const handleModifier = async () => {

    if (!parcelleId) {

      Alert.alert(
        'Erreur',
        'Identifiant de la parcelle introuvable.',
      );

      return;
    }

    if (!nom.trim()) {

      Alert.alert(
        'Champ obligatoire',
        'Veuillez saisir le nom de la parcelle.',
      );

      return;
    }

    try {

      setSaving(true);

      console.log(
        'MODIFICATION PARCELLE:',
        parcelleId,
      );

      await api.patch(
        `/parcelles/${parcelleId}`,
        {
          nom: nom.trim(),

          description:
            description.trim() || undefined,

          typeSol:
            typeSol || undefined,
        },
      );

      await queryClient.invalidateQueries({
        queryKey: ['parcelles'],
      });

      Alert.alert(
        'Succès',
        'La parcelle a été modifiée.',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ],
      );

    } catch (error: any) {

      console.log(
        'ERREUR MODIFICATION:',
        error?.response?.data || error,
      );

      const message =
        error?.response?.data?.message ||
        'Impossible de modifier la parcelle.';

      Alert.alert(
        'Erreur',
        String(message),
      );

    } finally {

      setSaving(false);

    }
  };

  // =====================================================
  // CHARGEMENT
  // =====================================================

  if (loading) {

    return (
      <View style={styles.center}>

        <ActivityIndicator
          size="large"
        />

        <Text style={styles.loadingText}>
          Chargement de la parcelle...
        </Text>

      </View>
    );
  }

  // =====================================================
  // FORMULAIRE
  // =====================================================

  return (

    <View style={styles.container}>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >

        <Text style={styles.title}>
          Modifier la parcelle
        </Text>

        {/* NOM */}

        <Text style={styles.label}>
          Nom *
        </Text>

        <TextInput
          style={styles.input}
          value={nom}
          onChangeText={setNom}
          placeholder="Nom de la parcelle"
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
          placeholder="Description de la parcelle"
          multiline
        />

        {/* TYPE DE SOL */}

        <Text style={styles.label}>
          Type de sol
        </Text>

        <TouchableOpacity
          style={styles.select}
          onPress={() =>
            setShowTypesSol(
              !showTypesSol,
            )
          }
        >

          <Text
            style={
              typeSol
                ? styles.selectText
                : styles.placeholder
            }
          >
            {typeSol || 'Choix'}
          </Text>

          <Text style={styles.arrow}>
            {showTypesSol
              ? '▲'
              : '▼'}
          </Text>

        </TouchableOpacity>

        {showTypesSol && (

          <View
            style={styles.optionsContainer}
          >

            {TYPES_SOL.map((type) => (

              <TouchableOpacity
                key={type}
                style={styles.option}
                onPress={() => {

                  setTypeSol(type);

                  setShowTypesSol(false);

                }}
              >

                <Text
                  style={styles.optionText}
                >
                  {type}
                </Text>

              </TouchableOpacity>

            ))}

          </View>

        )}

        {/* ENREGISTRER */}

        <TouchableOpacity
          style={[
            styles.button,
            saving &&
              styles.buttonDisabled,
          ]}
          onPress={handleModifier}
          disabled={saving}
        >

          {saving ? (

            <ActivityIndicator
              color="#fff"
            />

          ) : (

            <Text style={styles.buttonText}>
              ENREGISTRER LES MODIFICATIONS
            </Text>

          )}

        </TouchableOpacity>

        {/* ANNULER */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() =>
            router.back()
          }
        >

          <Text style={styles.cancelText}>
            Annuler
          </Text>

        </TouchableOpacity>

      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 15,
    fontSize: 16,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 7,
  },

  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    fontSize: 16,
  },

  textarea: {
    height: 90,
    paddingTop: 15,
    textAlignVertical: 'top',
  },

  select: {
    height: 52,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectText: {
    fontSize: 16,
    color: '#222',
  },

  placeholder: {
    fontSize: 16,
    color: '#888',
  },

  arrow: {
    fontSize: 14,
    color: '#555',
  },

  optionsContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginTop: 5,
    overflow: 'hidden',
  },

  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  optionText: {
    fontSize: 16,
  },

  button: {
    height: 52,
    borderRadius: 8,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 30,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },

  cancelButton: {
    alignItems: 'center',
    marginTop: 20,
  },

  cancelText: {
    color: '#d32f2f',
    fontSize: 16,
  },

});