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

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useState,
} from 'react';

import {
  useCreateIntervention,
} from '@/hooks/useInterventions';

// =====================================================
// ÉCRAN
// =====================================================

export default function AjoutInterventionScreen() {
  // ===================================================
  // PARAMÈTRES
  // ===================================================

  const {
    parcelleId,
    cultureId,
    parcelleNom,
    cultureNom,
  } = useLocalSearchParams<{
    parcelleId?: string;
    cultureId?: string;
    parcelleNom?: string;
    cultureNom?: string;
  }>();

  // ===================================================
  // ÉTATS
  // ===================================================

  const [type, setType] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .split('T')[0],
    );

  const [produit, setProduit] =
    useState('');

  const [quantite, setQuantite] =
    useState('');

  const [unite, setUnite] =
    useState('');

  const [cout, setCout] =
    useState('');

  // ===================================================
  // MUTATION
  // ===================================================

  const createMutation =
    useCreateIntervention();

  // ===================================================
  // ENREGISTRER
  // ===================================================

  const enregistrerIntervention =
    async () => {
      // ===============================================
      // VÉRIFICATION PARAMÈTRES
      // ===============================================

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

      // ===============================================
      // VALIDATION TYPE
      // ===============================================

      if (!type.trim()) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir le type d’intervention.',
        );

        return;
      }

      // ===============================================
      // VALIDATION DATE
      // ===============================================

      if (!date.trim()) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir la date de l’intervention.',
        );

        return;
      }

      const dateTest =
        new Date(date);

      if (
        Number.isNaN(
          dateTest.getTime(),
        )
      ) {
        Alert.alert(
          'Date invalide',
          'Veuillez saisir une date valide au format AAAA-MM-JJ.',
        );

        return;
      }

      // ===============================================
      // VALIDATION QUANTITÉ
      // ===============================================

      let quantiteValue:
        number | undefined;

      if (quantite.trim()) {
        quantiteValue =
          Number(
            quantite.replace(
              ',',
              '.',
            ),
          );

        if (
          Number.isNaN(
            quantiteValue,
          ) ||
          quantiteValue < 0
        ) {
          Alert.alert(
            'Quantité invalide',
            'Veuillez saisir une quantité numérique valide.',
          );

          return;
        }
      }

      // ===============================================
      // VALIDATION COÛT
      // ===============================================

      let coutValue:
        number | undefined;

      if (cout.trim()) {
        coutValue =
          Number(
            cout.replace(
              /\s/g,
              '',
            ).replace(
              ',',
              '.',
            ),
          );

        if (
          Number.isNaN(
            coutValue,
          ) ||
          coutValue < 0
        ) {
          Alert.alert(
            'Coût invalide',
            'Veuillez saisir un coût numérique valide.',
          );

          return;
        }
      }

      // ===============================================
      // DONNÉES
      // ===============================================

      try {
        await createMutation.mutateAsync({
          parcelleId,
          cultureId,

          data: {
            type:
              type.trim(),

            description:
              description.trim() ||
              undefined,

            date:
              date.trim(),

            produit:
              produit.trim() ||
              undefined,

            quantite:
              quantiteValue,

            unite:
              unite.trim() ||
              undefined,

            cout:
              coutValue,
          },
        });

        Alert.alert(
          'Succès',
          'L’intervention a été enregistrée.',
          [
            {
              text: 'OK',
              onPress: () => {
                router.back();
              },
            },
          ],
        );
      } catch (
        err: any
      ) {
        console.error(
          '❌ ERREUR AJOUT INTERVENTION:',
          err?.response?.data ||
            err,
        );

        Alert.alert(
          'Erreur',
          err?.response?.data
            ?.message ||
            'Impossible d’enregistrer l’intervention.',
        );
      }
    };

  // ===================================================
  // CHARGEMENT
  // ===================================================

  const isSubmitting =
    createMutation.isPending;

  // ===================================================
  // AFFICHAGE
  // ===================================================

  return (
    <KeyboardAvoidingView
      style={
        styles.container
      }
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

        {/* =========================================== */}
        {/* TITRE */}
        {/* =========================================== */}

        <Text
          style={
            styles.title
          }
        >
          Ajouter une intervention
        </Text>

        {/* =========================================== */}
        {/* CULTURE */}
        {/* =========================================== */}

        <View
          style={
            styles.headerCard
          }
        >
          <Text
            style={
              styles.cultureName
            }
          >
            🌱 {cultureNom ||
              'Culture'}
          </Text>

          <Text
            style={
              styles.parcelleName
            }
          >
            Parcelle :{' '}
            {parcelleNom ||
              parcelleId ||
              'Non renseignée'}
          </Text>
        </View>

        {/* =========================================== */}
        {/* FORMULAIRE */}
        {/* =========================================== */}

        <View
          style={
            styles.card
          }
        >
          <Text
            style={
              styles.cardTitle
            }
          >
            Informations de l’intervention
          </Text>

          {/* TYPE */}

          <Text
            style={
              styles.label
            }
          >
            Type d’intervention *
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : FERTILISATION"
            value={type}
            onChangeText={
              setType
            }
            editable={
              !isSubmitting
            }
            autoCapitalize="characters"
          />

          {/* DESCRIPTION */}

          <Text
            style={
              styles.label
            }
          >
            Description
          </Text>

          <TextInput
            style={
              styles.textArea
            }
            placeholder="Ex : Fertilisation complémentaire après plantation"
            value={description}
            onChangeText={
              setDescription
            }
            editable={
              !isSubmitting
            }
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />

          {/* DATE */}

          <Text
            style={
              styles.label
            }
          >
            Date *
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="AAAA-MM-JJ"
            value={date}
            onChangeText={
              setDate
            }
            editable={
              !isSubmitting
            }
            keyboardType="numbers-and-punctuation"
          />

          <Text
            style={
              styles.helpText
            }
          >
            Format : AAAA-MM-JJ
          </Text>

          {/* PRODUIT */}

          <Text
            style={
              styles.label
            }
          >
            Produit
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : NPK 15-15-15"
            value={produit}
            onChangeText={
              setProduit
            }
            editable={
              !isSubmitting
            }
          />

          {/* QUANTITÉ */}

          <Text
            style={
              styles.label
            }
          >
            Quantité
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : 25"
            value={quantite}
            onChangeText={
              setQuantite
            }
            editable={
              !isSubmitting
            }
            keyboardType="decimal-pad"
          />

          {/* UNITÉ */}

          <Text
            style={
              styles.label
            }
          >
            Unité
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : kg, L, sacs..."
            value={unite}
            onChangeText={
              setUnite
            }
            editable={
              !isSubmitting
            }
          />

          {/* COÛT */}

          <Text
            style={
              styles.label
            }
          >
            Coût
          </Text>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : 150000"
            value={cout}
            onChangeText={
              setCout
            }
            editable={
              !isSubmitting
            }
            keyboardType="decimal-pad"
          />

          <Text
            style={
              styles.helpText
            }
          >
            Montant en Ariary (Ar)
          </Text>
        </View>

        {/* =========================================== */}
        {/* ENREGISTRER */}
        {/* =========================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSubmitting &&
              styles.disabledButton,
          ]}
          onPress={
            enregistrerIntervention
          }
          disabled={
            isSubmitting
          }
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator
                size="small"
              />

              <Text
                style={
                  styles.buttonText
                }
              >
                Enregistrement...
              </Text>
            </>
          ) : (
            <Text
              style={
                styles.buttonText
              }
            >
              Enregistrer l’intervention
            </Text>
          )}
        </TouchableOpacity>

        {/* =========================================== */}
        {/* ANNULER */}
        {/* =========================================== */}

        <TouchableOpacity
          style={
            styles.cancelButton
          }
          onPress={() =>
            router.back()
          }
          disabled={
            isSubmitting
          }
        >
          <Text
            style={
              styles.cancelButtonText
            }
          >
            Annuler
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    container: {
      flex: 1,
      backgroundColor:
        '#f5f5f5',
    },

    content: {
      padding: 20,
      paddingBottom: 40,
    },

    // ================================================
    // TITRE
    // ================================================

    title: {
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 15,
    },

    // ================================================
    // HEADER
    // ================================================

    headerCard: {
      backgroundColor:
        '#e8f5e9',
      borderRadius: 10,
      padding: 18,
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        '#c8e6c9',
    },

    cultureName: {
      fontSize: 23,
      fontWeight: 'bold',
      color: '#2e7d32',
    },

    parcelleName: {
      fontSize: 15,
      color: '#555',
      marginTop: 6,
    },

    // ================================================
    // CARD
    // ================================================

    card: {
      backgroundColor:
        '#fff',
      borderRadius: 10,
      padding: 16,
      marginBottom: 15,
      borderWidth: 1,
      borderColor:
        '#ddd',
    },

    cardTitle: {
      fontSize: 19,
      fontWeight: 'bold',
      marginBottom: 18,
    },

    // ================================================
    // FORMULAIRE
    // ================================================

    label: {
      fontSize: 15,
      fontWeight: 'bold',
      color: '#555',
      marginBottom: 8,
      marginTop: 10,
    },

    input: {
      minHeight: 50,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      backgroundColor: '#fff',
      paddingHorizontal: 14,
      fontSize: 15,
    },

    textArea: {
      minHeight: 110,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      backgroundColor: '#fff',
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
    },

    helpText: {
      fontSize: 13,
      color: '#777',
      marginTop: 5,
    },

    // ================================================
    // BOUTONS
    // ================================================

    saveButton: {
      minHeight: 52,
      borderRadius: 10,
      backgroundColor:
        '#2e7d32',
      justifyContent:
        'center',
      alignItems: 'center',
      marginBottom: 10,
      paddingHorizontal: 12,
      flexDirection: 'row',
      gap: 10,
    },

    disabledButton: {
      opacity: 0.6,
    },

    buttonText: {
      color: '#fff',
      fontSize: 16,
      fontWeight: 'bold',
    },

    cancelButton: {
      minHeight: 50,
      borderRadius: 10,
      backgroundColor:
        '#e0e0e0',
      justifyContent:
        'center',
      alignItems: 'center',
      paddingHorizontal: 12,
    },

    cancelButtonText: {
      color: '#333',
      fontSize: 16,
      fontWeight: 'bold',
    },

  });