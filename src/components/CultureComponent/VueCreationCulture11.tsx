import { ButtonNext } from '@/components/CultureComponent/ButtonNext';
import { DateField } from '@/components/CultureComponent/DateField';
import { FormGroup } from '@/components/CultureComponent/FormGroup';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';
import { colors } from '@/theme';
import { CalendarDays, FileText, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

type Props = {
  datePicker: "plantation" | "recolte" | null;
  datePlantation: Date | null;
  datePrevueRecolte: Date | null;
  description: string;
  formaterDate: (date: Date | null) => string;
  goBackStep: () => void;
  goToStep3: () => void;
  hasDates: boolean;
  setDatePicker: Dispatch<SetStateAction<"plantation" | "recolte" | null>>;
  setDatePlantation: Dispatch<SetStateAction<Date | null>>;
  setDatePrevueRecolte: Dispatch<SetStateAction<Date | null>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setStade: Dispatch<SetStateAction<string>>;
  stade: string;
};

export function VueCreationCulture11({
  datePicker,
  datePlantation,
  datePrevueRecolte,
  description,
  formaterDate,
  goBackStep,
  goToStep3,
  hasDates,
  setDatePicker,
  setDatePlantation,
  setDatePrevueRecolte,
  setDescription,
  setStade,
  stade,
}: Props) {
  return (
<View
                  style={styles.stepContent}
                >
                  {/* INTRO */}

                  <View
                    style={styles.intro}
                  >
                    <View
                      style={[
                        styles.introIcon,
                        styles.introIconBlue,
                      ]}
                    >
                      <CalendarDays
                        size={23}
                        color="#3D6E9D"
                      />
                    </View>

                    <View
                      style={styles.introText}
                    >
                      <Text
                        style={styles.introTitle}
                      >
                        Planification de la culture
                      </Text>

                      <Text
                        style={
                          styles.introDescription
                        }
                      >
                        Définissez les principales
                        dates et informations de suivi
                        de votre culture.
                      </Text>
                    </View>
                  </View>

                  {/* DATE PLANTATION */}

                  <DateField
                    iconColor={
                      colors.primary[700]
                    }
                    label="Date de plantation"
                    value={
                      formaterDate(
                        datePlantation,
                      )
                    }
                    selected={
                      !!datePlantation
                    }
                    onPress={() =>
                      setDatePicker(
                        'plantation',
                      )
                    }
                  />

                  {/* DATE RÉCOLTE */}

                  <DateField
                    iconColor="#3D6E9D"
                    icon={
                      <CalendarDays
                        size={16}
                        color="#3D6E9D"
                      />
                    }
                    label="Date prévue de récolte"
                    value={
                      formaterDate(
                        datePrevueRecolte,
                      )
                    }
                    selected={
                      !!datePrevueRecolte
                    }
                    onPress={() =>
                      setDatePicker(
                        'recolte',
                      )
                    }
                  />

                  {/* DATE PICKER */}

                  {datePicker ? (
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
                  ) : null}

                  {/* STADE */}

                  <FormGroup
                    icon={
                      <Sprout
                        size={15}
                        color={
                          colors.primary[700]
                        }
                      />
                    }
                    label="Stade"
                    helper="Exemple : SEMIS, CROISSANCE, MATURATION..."
                  >
                    <TextInput
                      style={styles.input}
                      placeholder="Ex. : SEMIS"
                      placeholderTextColor="#A0AAA2"
                      value={stade}
                      onChangeText={setStade}
                      autoCapitalize="characters"
                    />
                  </FormGroup>

                  {/* DESCRIPTION */}

                  <FormGroup
                    icon={
                      <FileText
                        size={15}
                        color="#758178"
                      />
                    }
                    label="Description"
                    helper="Ajoutez toute information utile pour le suivi de la culture."
                  >
                    <TextInput
                      style={[
                        styles.input,
                        styles.textArea,
                      ]}
                      placeholder="Description de la culture"
                      placeholderTextColor="#A0AAA2"
                      value={description}
                      onChangeText={
                        setDescription
                      }
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                    />
                  </FormGroup>

                  {/* INFO DATES */}

                  <View
                    style={styles.calculatedCard}
                  >
                    <View
                      style={styles.calculatedIcon}
                    >
                      <CalendarDays
                        size={18}
                        color={
                          colors.primary[700]
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.calculatedContent
                      }
                    >
                      <Text
                        style={
                          styles.calculatedTitle
                        }
                      >
                        Planification
                      </Text>

                      <Text
                        style={
                          styles.calculatedValue
                        }
                      >
                        {hasDates
                          ? 'Dates renseignées'
                          : 'Dates non renseignées'}
                      </Text>

                      <Text
                        style={
                          styles.calculatedHint
                        }
                      >
                        Vous pourrez suivre plus
                        facilement le cycle de la culture.
                      </Text>
                    </View>
                  </View>

                  <View
                    style={styles.stepActionsRow}
                  >
                    <TouchableOpacity
                      activeOpacity={0.75}
                      onPress={goBackStep}
                      style={styles.secondaryStepButton}
                    >
                      <Text
                        style={
                          styles.secondaryStepButtonText
                        }
                      >
                        Retour
                      </Text>
                    </TouchableOpacity>

                    <View
                      style={
                        styles.stepActionFlex
                      }
                    >
                      <ButtonNext
                        label="Continuer"
                        onPress={goToStep3}
                      />
                    </View>
                  </View>
                </View>
  );
}
