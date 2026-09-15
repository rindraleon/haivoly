/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
import { useEffect, useState } from 'react';

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

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  StatutCulture,
} from '@/api/cultures';

import {
  useCulture,
  useUpdateCulture,
} from '@/hooks/useCultures';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

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

      setDatePlantation(
        new Date(
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
        new Date(
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

    return date.toLocaleDateString(
      'fr-FR',
    );
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

        data: {

          nom:
            nom.trim(),

          type:
            type.trim() ||
            undefined,

          variete:
            variete.trim() ||
            undefined,

          datePlantation:
            datePlantation
              ? datePlantation.toISOString()
              : undefined,

          datePrevueRecolte:
            datePrevueRecolte
              ? datePrevueRecolte.toISOString()
              : undefined,

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

          console.error(
            'ERREUR MODIFICATION CULTURE:',
            error?.response?.data ||
              error,
          );

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

        {/* ================================================= */}
        {/* TITRE */}
        {/* ================================================= */}

        <Text
          style={
            styles.title
          }
        >
          Modifier la culture
        </Text>


        <Text
          style={
            styles.parcelle
          }
        >
          Parcelle :{' '}
          {parcelleNom ||
            parcelleId}
        </Text>


        {/* ================================================= */}
        {/* NOM */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Nom *
        </Text>


        <TextInput
          style={
            styles.input
          }

          placeholder="Ex : Riz"

          value={
            nom
          }

          onChangeText={
            setNom
          }
        />


        {/* ================================================= */}
        {/* TYPE */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Type
        </Text>


        <TextInput
          style={
            styles.input
          }

          placeholder="Ex : Céréale"

          value={
            type
          }

          onChangeText={
            setType
          }
        />


        {/* ================================================= */}
        {/* VARIÉTÉ */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Variété
        </Text>


        <TextInput
          style={
            styles.input
          }

          placeholder="Ex : Makalioka"

          value={
            variete
          }

          onChangeText={
            setVariete
          }
        />


        {/* ================================================= */}
        {/* DATE PLANTATION */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Date de plantation
        </Text>


        <TouchableOpacity
          style={
            styles.dateInput
          }

          onPress={() =>
            setDatePicker(
              'plantation',
            )
          }
        >

          <Text
            style={
              styles.dateText
            }
          >
            {formaterDate(
              datePlantation,
            )}
          </Text>

        </TouchableOpacity>


        {/* ================================================= */}
        {/* DATE RÉCOLTE */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Date prévue de récolte
        </Text>


        <TouchableOpacity
          style={
            styles.dateInput
          }

          onPress={() =>
            setDatePicker(
              'recolte',
            )
          }
        >

          <Text
            style={
              styles.dateText
            }
          >
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

                setDatePicker(
                  null,
                );

                return;

              }


              if (
                selectedDate
              ) {

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


              setDatePicker(
                null,
              );

            }}

          />

        )}


        {/* ================================================= */}
        {/* STADE */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Stade
        </Text>


        <TextInput
          style={
            styles.input
          }

          placeholder="Ex : SEMIS"

          value={
            stade
          }

          onChangeText={
            setStade
          }
        />


        {/* ================================================= */}
        {/* DESCRIPTION */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Description
        </Text>


        <TextInput
          style={[
            styles.input,
            styles.textArea,
          ]}

          placeholder="Description de la culture"

          value={
            description
          }

          onChangeText={
            setDescription
          }

          multiline

          numberOfLines={
            4
          }

        />


        {/* ================================================= */}
        {/* STATUT */}
        {/* ================================================= */}

        <Text
          style={
            styles.label
          }
        >
          Statut
        </Text>


        <View
          style={
            styles.statusContainer
          }
        >

          {(
            [
              'PLANIFIEE',
              'EN_COURS',
              'RECOLTEE',
              'ABANDONNEE',
            ] as StatutCulture[]
          ).map(
            (item) => (

              <TouchableOpacity
                key={
                  item
                }

                style={[
                  styles.statusButton,

                  statut ===
                    item &&
                    styles.statusButtonSelected,
                ]}

                onPress={() =>
                  setStatut(
                    item,
                  )
                }
              >

                <Text
                  style={[
                    styles.statusButtonText,

                    statut ===
                      item &&
                      styles.statusButtonTextSelected,
                  ]}
                >
                  {item}
                </Text>

              </TouchableOpacity>

            ),
          )}

        </View>


        {/* ================================================= */}
        {/* INFORMATION SUPPRESSION */}
        {/* ================================================= */}

        {statut ===
          'SUPPRIMEE' && (

          <View
            style={
              styles.warningBox
            }
          >

            <Text
              style={
                styles.warningText
              }
            >
              Cette culture est supprimée
              et ne peut pas être modifiée
              depuis cet écran.
            </Text>

          </View>

        )}


        {/* ================================================= */}
        {/* ENREGISTRER */}
        {/* ================================================= */}

        <TouchableOpacity

          style={[
            styles.saveButton,

            updateCulture.isPending &&
              styles.disabledButton,

            statut ===
              'SUPPRIMEE' &&
              styles.disabledButton,
          ]}

          onPress={
            enregistrer
          }

          disabled={
            updateCulture.isPending ||
            statut ===
              'SUPPRIMEE'
          }
        >

          {updateCulture.isPending ? (

            <ActivityIndicator
              color="#fff"
            />

          ) : (

            <Text
              style={
                styles.saveText
              }
            >
              Enregistrer les modifications
            </Text>

          )}

        </TouchableOpacity>


        {/* ================================================= */}
        {/* ANNULER */}
        {/* ================================================= */}

        <TouchableOpacity

          style={
            styles.cancelButton
          }

          onPress={() =>
            router.back()
          }

          disabled={
            updateCulture.isPending
          }
        >

          <Text
            style={
              styles.cancelText
            }
          >
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

    center: {
      flex: 1,
      justifyContent:
        'center',
      alignItems: 'center',
      padding: 20,
    },

    loadingText: {
      marginTop: 12,
      fontSize: 16,
    },

    errorTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 10,
    },

    errorText: {
      textAlign: 'center',
      color: '#666',
      marginBottom: 20,
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
      textAlignVertical:
        'top',
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

    statusContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 15,
    },

    statusButton: {
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 20,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: '#fff',
    },

    statusButtonSelected: {
      backgroundColor:
        '#2e7d32',
      borderColor:
        '#2e7d32',
    },

    statusButtonText: {
      fontSize: 13,
      fontWeight: '500',
      color: '#555',
    },

    statusButtonTextSelected: {
      color: '#fff',
      fontWeight: 'bold',
    },

    warningBox: {
      backgroundColor:
        '#ffebee',
      borderWidth: 1,
      borderColor:
        '#ef9a9a',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
    },

    warningText: {
      color: '#c62828',
      fontSize: 14,
      lineHeight: 20,
    },

    saveButton: {
      height: 50,
      borderRadius: 10,
      backgroundColor:
        '#2e7d32',
      justifyContent:
        'center',
      alignItems: 'center',
      marginTop: 10,
    },

    disabledButton: {
      opacity: 0.6,
    },

    saveText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 16,
      textAlign: 'center',
    },

    cancelButton: {
      height: 50,
      marginTop: 10,
      borderRadius: 10,
      justifyContent:
        'center',
      alignItems: 'center',
      backgroundColor:
        '#ddd',
    },

    cancelText: {
      fontWeight: 'bold',
      fontSize: 16,
    },

    backButton: {
      paddingHorizontal: 25,
      paddingVertical: 12,
      borderRadius: 10,
      backgroundColor:
        '#2e7d32',
    },

    backText: {
      color: '#fff',
      fontWeight: 'bold',
    },

  });