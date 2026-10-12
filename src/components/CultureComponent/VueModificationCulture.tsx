import { styles } from '@/screens/CultureScreen/CultureEditScreen.styles';
import { i18n } from '@/i18n/instance';

import type { Culture, UpdateCulturePayload ,
  StatutCulture,
} from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  datePicker: "plantation" | "recolte" | null;
  datePlantation: Date | null;
  datePrevueRecolte: Date | null;
  description: string;
  enregistrer: () => void;
  formaterDate: (date: Date | null) => string;
  nom: string;
  parcelleId: string;
  parcelleNom: string | undefined;
  setDatePicker: Dispatch<SetStateAction<"plantation" | "recolte" | null>>;
  setDatePlantation: Dispatch<SetStateAction<Date | null>>;
  setDatePrevueRecolte: Dispatch<SetStateAction<Date | null>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setNom: Dispatch<SetStateAction<string>>;
  setStade: Dispatch<SetStateAction<string>>;
  setStatut: Dispatch<SetStateAction<StatutCulture>>;
  setType: Dispatch<SetStateAction<string>>;
  setVariete: Dispatch<SetStateAction<string>>;
  stade: string;
  statut: StatutCulture;
  type: string;
  updateCulture: UseMutationResult<Culture, Error, { parcelleId: string; cultureId: string; body: UpdateCulturePayload; }, unknown>;
  variete: string;
};

export function VueModificationCulture({
  datePicker,
  datePlantation,
  datePrevueRecolte,
  description,
  enregistrer,
  formaterDate,
  nom,
  parcelleId,
  parcelleNom,
  setDatePicker,
  setDatePlantation,
  setDatePrevueRecolte,
  setDescription,
  setNom,
  setStade,
  setStatut,
  setType,
  setVariete,
  stade,
  statut,
  type,
  updateCulture,
  variete,
}: Props) {
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

            placeholder={i18n.t('cultures.varietePlaceholder')}

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

            placeholder={i18n.t('libelles.descriptionCulture')}

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
