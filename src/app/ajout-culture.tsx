import { useState } from 'react';
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

import {
  CreateCultureData,
  StatutCulture,
} from '@/api/cultures';

import { useCreateCulture } from '@/hooks/useCultures';

import DateTimePicker from '@react-native-community/datetimepicker';

export default function AjouterCultureScreen() {
  const { parcelleId, parcelleNom } =
    useLocalSearchParams<{
      parcelleId: string;
      parcelleNom?: string;
    }>();

  const createCulture = useCreateCulture();

  // =====================================================
  // INFORMATIONS CULTURE
  // =====================================================

  const [nom, setNom] = useState('');
  const [type, setType] = useState('');
  const [variete, setVariete] = useState('');

  const [datePlantation, setDatePlantation] =
    useState<Date | null>(null);

  const [datePrevueRecolte, setDatePrevueRecolte] =
    useState<Date | null>(null);

  const [datePicker, setDatePicker] = useState<
    'plantation' | 'recolte' | null
  >(null);

  const [stade, setStade] = useState('');
  const [description, setDescription] = useState('');

  // =====================================================
  // DÉLIMITATION
  // =====================================================

  const [demanderDelimitation, setDemanderDelimitation] =
    useState(false);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate = (date: Date | null) => {
    if (!date) {
      return 'Choisir une date';
    }

    return date.toLocaleDateString('fr-FR');
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
      return;
    }

    // Vérification des dates
    if (
      datePlantation &&
      datePrevueRecolte &&
      datePrevueRecolte < datePlantation
    ) {
      Alert.alert(
        'Erreur',
        'La date prévue de récolte doit être après la date de plantation.',
      );
      return;
    }

    const data: CreateCultureData = {
      nom: nom.trim(),

      type: type.trim() || undefined,

      variete: variete.trim() || undefined,

      datePlantation: datePlantation
        ? datePlantation.toISOString()
        : undefined,

      datePrevueRecolte: datePrevueRecolte
        ? datePrevueRecolte.toISOString()
        : undefined,

      stade: stade.trim() || undefined,

      description:
        description.trim() || undefined,

      statut:
        'PLANIFIEE' as StatutCulture,
    };

    // ===================================================
    // CRÉATION DE LA CULTURE
    // ===================================================

    createCulture.mutate(
      {
        parcelleId,
        data,
      },
      {
        onSuccess: (culture) => {
          console.log(
            'CULTURE CRÉÉE:',
            culture,
          );

          // =================================================
          // SI L'UTILISATEUR VEUT DÉLIMITER
          // =================================================

          if (demanderDelimitation) {
            router.replace({
              pathname: '/delimiter-culture',
              params: {
                parcelleId,
                parcelleNom:
                  parcelleNom || '',
                cultureId: culture.id,
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

        onError: (error: any) => {
          console.error(
            'ERREUR AJOUT CULTURE:',
            error?.response?.data ||
              error,
          );

          Alert.alert(
            'Erreur',
            error?.response?.data?.message ||
              "Impossible d'ajouter la culture.",
          );
        },
      },
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

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
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* ================================================= */}
        {/* TITRE */}
        {/* ================================================= */}

        <Text style={styles.title}>
          Ajouter une culture
        </Text>

        <Text style={styles.parcelle}>
          Parcelle :{' '}
          {parcelleNom || parcelleId}
        </Text>

        {/* ================================================= */}
        {/* NOM */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Nom *
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex : Riz"
          value={nom}
          onChangeText={setNom}
        />

        {/* ================================================= */}
        {/* TYPE */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Type
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex : Céréale"
          value={type}
          onChangeText={setType}
        />

        {/* ================================================= */}
        {/* VARIÉTÉ */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Variété
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex : Makalioka 34"
          value={variete}
          onChangeText={setVariete}
        />

        {/* ================================================= */}
        {/* DATE PLANTATION */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Date de plantation
        </Text>

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() =>
            setDatePicker('plantation')
          }
        >
          <Text style={styles.dateText}>
            {formaterDate(
              datePlantation,
            )}
          </Text>
        </TouchableOpacity>

        {/* ================================================= */}
        {/* DATE RÉCOLTE */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Date prévue de récolte
        </Text>

        <TouchableOpacity
          style={styles.dateInput}
          onPress={() =>
            setDatePicker('recolte')
          }
        >
          <Text style={styles.dateText}>
            {formaterDate(
              datePrevueRecolte,
            )}
          </Text>
        </TouchableOpacity>

        {/* ================================================= */}
        {/* DATE PICKER */}
        {/* ================================================= */}

        {datePicker && (
          <DateTimePicker
            value={
              datePicker ===
              'plantation'
                ? datePlantation ||
                  new Date()
                : datePrevueRecolte ||
                  new Date()
            }
            mode="date"
            display="calendar"
            onChange={(
              event,
              selectedDate,
            ) => {
              if (
                event.type ===
                'dismissed'
              ) {
                setDatePicker(null);
                return;
              }

              if (selectedDate) {
                if (
                  datePicker ===
                  'plantation'
                ) {
                  setDatePlantation(
                    selectedDate,
                  );
                } else {
                  setDatePrevueRecolte(
                    selectedDate,
                  );
                }
              }

              setDatePicker(null);
            }}
          />
        )}

        {/* ================================================= */}
        {/* STADE */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Stade
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Ex : SEMIS"
          value={stade}
          onChangeText={setStade}
        />

        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <Text style={styles.label}>
          Description
        </Text>

        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}
          placeholder="Description de la culture"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        {/* ================================================= */}
        {/* DÉLIMITATION */}
        {/* ================================================= */}

        <View style={styles.delimitationContainer}>
          <Text
            style={
              styles.delimitationTitle
            }
          >
            Délimitation de la culture
          </Text>

          <Text
            style={
              styles.delimitationDescription
            }
          >
            Voulez-vous tracer la zone de
            cette culture à l'intérieur de
            la parcelle ?
          </Text>

          <View style={styles.choiceRow}>
            {/* NON */}

            <TouchableOpacity
              style={[
                styles.choiceButton,
                !demanderDelimitation &&
                  styles.choiceButtonActive,
              ]}
              onPress={() =>
                setDemanderDelimitation(
                  false,
                )
              }
            >
              <Text
                style={[
                  styles.choiceText,
                  !demanderDelimitation &&
                    styles.choiceTextActive,
                ]}
              >
                NON
              </Text>
            </TouchableOpacity>

            {/* OUI */}

            <TouchableOpacity
              style={[
                styles.choiceButton,
                demanderDelimitation &&
                  styles.choiceButtonActive,
              ]}
              onPress={() =>
                setDemanderDelimitation(
                  true,
                )
              }
            >
              <Text
                style={[
                  styles.choiceText,
                  demanderDelimitation &&
                    styles.choiceTextActive,
                ]}
              >
                OUI
              </Text>
            </TouchableOpacity>
          </View>

          {demanderDelimitation && (
            <View
              style={
                styles.delimitationInfo
              }
            >
              <Text
                style={
                  styles.delimitationInfoText
                }
              >
                Après l'enregistrement,
                vous pourrez tracer la
                culture directement sur la
                carte de la parcelle.
              </Text>
            </View>
          )}
        </View>

        {/* ================================================= */}
        {/* STATUT */}
        {/* ================================================= */}

        <Text style={styles.status}>
          Statut initial : PLANIFIEE
        </Text>

        {/* ================================================= */}
        {/* ENREGISTRER */}
        {/* ================================================= */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            createCulture.isPending &&
              styles.disabledButton,
          ]}
          onPress={enregistrer}
          disabled={
            createCulture.isPending
          }
        >
          {createCulture.isPending ? (
            <ActivityIndicator
              color="#fff"
            />
          ) : (
            <Text style={styles.saveText}>
              Enregistrer
            </Text>
          )}
        </TouchableOpacity>

        {/* ================================================= */}
        {/* ANNULER */}
        {/* ================================================= */}

        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => router.back()}
          disabled={
            createCulture.isPending
          }
        >
          <Text style={styles.cancelText}>
            Annuler
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  parcelle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 7,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },

  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },

  dateInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },

  dateText: {
    fontSize: 16,
    color: '#333',
  },

  // =====================================================
  // DÉLIMITATION
  // =====================================================

  delimitationContainer: {
    marginTop: 25,
    padding: 16,
    backgroundColor: '#f1f8f2',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#c8e6c9',
  },

  delimitationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 8,
  },

  delimitationDescription: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },

  choiceRow: {
    flexDirection: 'row',
    gap: 10,
  },

  choiceButton: {
    flex: 1,
    height: 45,
    borderWidth: 1,
    borderColor: '#2e7d32',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },

  choiceButtonActive: {
    backgroundColor: '#2e7d32',
  },

  choiceText: {
    fontWeight: 'bold',
    color: '#2e7d32',
  },

  choiceTextActive: {
    color: '#fff',
  },

  delimitationInfo: {
    marginTop: 12,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },

  delimitationInfoText: {
    fontSize: 13,
    color: '#555',
    lineHeight: 19,
  },

  // =====================================================
  // STATUT
  // =====================================================

  status: {
    marginTop: 20,
    marginBottom: 15,
    color: '#666',
    fontSize: 14,
  },

  // =====================================================
  // BOUTONS
  // =====================================================

  saveButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: '#2e7d32',
    justifyContent: 'center',
    alignItems: 'center',
  },

  disabledButton: {
    opacity: 0.6,
  },

  saveText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  cancelButton: {
    height: 50,
    marginTop: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ddd',
  },

  cancelText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});