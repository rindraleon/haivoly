import { ButtonNext } from '@/components/CultureComponent/ButtonNext';
import { i18n } from '@/i18n/instance';


import { FormGroup } from '@/components/CultureComponent/FormGroup';

import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';
import type { CulturePayload, Culture } from '@/types';
import { colors } from '@/theme';
import type { UseMutationResult } from '@tanstack/react-query';
import { Check, CircleCheck, FileText, Layers, MapPinned, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';


import { VueCreationCulture11 } from '@/components/CultureComponent/VueCreationCulture11';
import { VueCreationCulture12 } from '@/components/CultureComponent/VueCreationCulture12';
type Props = {
  createCulture: UseMutationResult<Culture, Error, { parcelleId: string; body: CulturePayload; }, unknown>;
  currentStep: number;
  datePicker: "plantation" | "recolte" | null;
  datePlantation: Date | null;
  datePrevueRecolte: Date | null;
  demanderDelimitation: boolean;
  description: string;
  enregistrer: () => void;
  formaterDate: (date: Date | null) => string;
  goBackStep: () => void;
  goToStep2: () => void;
  goToStep3: () => void;
  hasDates: boolean;
  nom: string;
  parcelleId: string;
  parcelleNom: string | undefined;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setDatePicker: Dispatch<SetStateAction<"plantation" | "recolte" | null>>;
  setDatePlantation: Dispatch<SetStateAction<Date | null>>;
  setDatePrevueRecolte: Dispatch<SetStateAction<Date | null>>;
  setDemanderDelimitation: Dispatch<SetStateAction<boolean>>;
  setDescription: Dispatch<SetStateAction<string>>;
  setNom: Dispatch<SetStateAction<string>>;
  setStade: Dispatch<SetStateAction<string>>;
  setType: Dispatch<SetStateAction<string>>;
  setVariete: Dispatch<SetStateAction<string>>;
  stade: string;
  stepLabels: string[];
  type: string;
  variete: string;
};

export function VueCreationCulture1({
  createCulture,
  currentStep,
  datePicker,
  datePlantation,
  datePrevueRecolte,
  demanderDelimitation,
  description,
  enregistrer,
  formaterDate,
  goBackStep,
  goToStep2,
  goToStep3,
  hasDates,
  nom,
  parcelleId,
  parcelleNom,
  setCurrentStep,
  setDatePicker,
  setDatePlantation,
  setDatePrevueRecolte,
  setDemanderDelimitation,
  setDescription,
  setNom,
  setStade,
  setType,
  setVariete,
  stade,
  stepLabels,
  type,
  variete,
}: Props) {
  return (
<ScrollView
            contentContainerStyle={
              styles.content
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={
              false
            }
          >
            {}

            <View
              style={styles.stepperCard}
            >
              <View
                style={styles.stepperLine}
              />

              <View
                style={styles.stepper}
              >
                {stepLabels.map(
                  (
                    label,
                    index,
                  ) => {
                    const step =
                      index + 1;

                    const completed =
                      currentStep > step;

                    const active =
                      currentStep === step;

                    return (
                      <View
                        key={label}
                        style={styles.step}
                      >
                        <View
                          style={[
                            styles.stepCircle,
                            active &&
                              styles.stepCircleActive,
                            completed &&
                              styles.stepCircleCompleted,
                          ]}
                        >
                          {completed ? (
                            <Check
                              size={14}
                              color="#FFFFFF"
                              strokeWidth={3}
                            />
                          ) : (
                            <Text
                              style={[
                                styles.stepNumber,
                                active &&
                                  styles.stepNumberActive,
                              ]}
                            >
                              {step}
                            </Text>
                          )}
                        </View>

                        <Text
                          style={[
                            styles.stepLabel,
                            active &&
                              styles.stepLabelActive,
                            completed &&
                              styles.stepLabelCompleted,
                          ]}
                        >
                          {label}
                        </Text>
                      </View>
                    );
                  },
                )}
              </View>
            </View>

            {}

            {currentStep === 1 ? (
              <View
                style={styles.stepContent}
              >
                {/* INTRO */}

                <View
                  style={styles.intro}
                >
                  <View
                    style={styles.introIcon}
                  >
                    <Sprout
                      size={23}
                      color={
                        colors.primary[700]
                      }
                    />
                  </View>

                  <View
                    style={styles.introText}
                  >
                    <Text
                      style={styles.introTitle}
                    >
                      Informations de la culture
                    </Text>

                    <Text
                      style={
                        styles.introDescription
                      }
                    >
                      Commencez par renseigner
                      les informations principales
                      de votre culture.
                    </Text>
                  </View>
                </View>

                {/* PARCELLE */}

                <View
                  style={styles.contextCard}
                >
                  <View
                    style={styles.contextIcon}
                  >
                    <MapPinned
                      size={18}
                      color={
                        colors.primary[700]
                      }
                    />
                  </View>

                  <View
                    style={styles.contextContent}
                  >
                    <Text
                      style={styles.contextLabel}
                    >
                      Parcelle associée
                    </Text>

                    <Text
                      style={styles.contextValue}
                      numberOfLines={2}
                    >
                      {parcelleNom ||
                        parcelleId ||
                        i18n.t('domaine.parcelleNonRenseignee')}
                    </Text>
                  </View>

                  <CircleCheck
                    size={19}
                    color={
                      colors.primary[600]
                    }
                  />
                </View>

                {/* NOM */}

                <FormGroup
                  icon={
                    <FileText
                      size={15}
                      color={
                        colors.primary[700]
                      }
                    />
                  }
                  label={i18n.t('libelles.nomCulture')}
                  required
                  helper={i18n.t('cultures.nomHint')}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. : Riz"
                    placeholderTextColor="#A0AAA2"
                    value={nom}
                    onChangeText={setNom}
                    autoCapitalize="sentences"
                  />
                </FormGroup>

                {/* TYPE */}

                <FormGroup
                  icon={
                    <Layers
                      size={15}
                      color={
                        colors.primary[700]
                      }
                    />
                  }
                  label="Type"
                  helper={i18n.t('cultures.typeExemple')}
                >
                  <TextInput
                    style={styles.input}
                    placeholder={i18n.t('cultures.typePlaceholder')}
                    placeholderTextColor="#A0AAA2"
                    value={type}
                    onChangeText={setType}
                    autoCapitalize="sentences"
                  />
                </FormGroup>

                {/* VARIÉTÉ */}

                <FormGroup
                  icon={
                    <Sprout
                      size={15}
                      color="#758178"
                    />
                  }
                  label={i18n.t('domaine.variete')}
                  helper={i18n.t('cultures.varieteHint')}
                >
                  <TextInput
                    style={styles.input}
                    placeholder="Ex. : Makalioka 34"
                    placeholderTextColor="#A0AAA2"
                    value={variete}
                    onChangeText={setVariete}
                    autoCapitalize="sentences"
                  />
                </FormGroup>

                <ButtonNext
                  label="Continuer"
                  onPress={goToStep2}
                />
              </View>
            ) : null}

            {}

            {currentStep === 2 ? (
              <VueCreationCulture11
                datePicker={datePicker}
                datePlantation={datePlantation}
                datePrevueRecolte={datePrevueRecolte}
                description={description}
                formaterDate={formaterDate}
                goBackStep={goBackStep}
                goToStep3={goToStep3}
                hasDates={hasDates}
                setDatePicker={setDatePicker}
                setDatePlantation={setDatePlantation}
                setDatePrevueRecolte={setDatePrevueRecolte}
                setDescription={setDescription}
                setStade={setStade}
                stade={stade}
              />
            ) : null}

            {}

            {currentStep === 3 ? (
              <VueCreationCulture12
                createCulture={createCulture}
                datePlantation={datePlantation}
                datePrevueRecolte={datePrevueRecolte}
                demanderDelimitation={demanderDelimitation}
                description={description}
                enregistrer={enregistrer}
                formaterDate={formaterDate}
                nom={nom}
                parcelleId={parcelleId}
                parcelleNom={parcelleNom}
                setCurrentStep={setCurrentStep}
                setDemanderDelimitation={setDemanderDelimitation}
                stade={stade}
                type={type}
                variete={variete}
              />
            ) : null}

            {}

            {/* Le DateTimePicker est affiché dans l'étape 2
                au moment de la sélection. */}

            {}

            <View
              style={styles.footer}
            >
              <View
                style={styles.footerIcon}
              >
                <Sprout
                  size={14}
                  color={
                    colors.primary[700]
                  }
                />
              </View>

              <Text
                style={styles.footerText}
              >
                HaiVoly · Gestion agricole
              </Text>
            </View>
          </ScrollView>
  );
}
