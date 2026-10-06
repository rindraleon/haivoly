/* eslint-disable react/no-unescaped-entities */

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

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  CalendarDays,
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Layers,
  MapPinned,
  Sprout,
} from 'lucide-react-native';

import {
  CreateCultureData,
  StatutCulture,
} from '@/api/cultures';

import { useCreateCulture } from '@/hooks/useCultures';

import DateTimePicker from '@react-native-community/datetimepicker';

import { colors } from '@/design/tokens';

export default function AjouterCultureScreen() {
  const {
    parcelleId,
    parcelleNom,
  } = useLocalSearchParams<{
    parcelleId: string;
    parcelleNom?: string;
  }>();

  const createCulture =
    useCreateCulture();

  // =====================================================
  // INFORMATIONS CULTURE
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

  // =====================================================
  // DÉLIMITATION
  // =====================================================

  const [
    demanderDelimitation,
    setDemanderDelimitation,
  ] = useState(false);

  // =====================================================
  // NAVIGATION UX
  // =====================================================

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formaterDate =
    (date: Date | null) => {
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

      setCurrentStep(1);

      return;
    }

    // Vérification des dates
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

      setCurrentStep(2);

      return;
    }

    const data: CreateCultureData = {
      nom: nom.trim(),

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

          if (
            demanderDelimitation
          ) {
            router.replace({
              pathname:
                '/delimiter-culture',
              params: {
                parcelleId,
                parcelleNom:
                  parcelleNom || '',
                cultureId:
                  culture.id,
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

        onError: (
          error: any,
        ) => {
          console.error(
            'ERREUR AJOUT CULTURE:',
            error?.response?.data ||
              error,
          );

          Alert.alert(
            'Erreur',
            error?.response?.data
              ?.message ||
              "Impossible d'ajouter la culture.",
          );
        },
      },
    );
  };

  // =====================================================
  // NAVIGATION ENTRE ÉTAPES
  // =====================================================

  const goToStep2 = () => {
    if (!nom.trim()) {
      Alert.alert(
        'Nom obligatoire',
        'Veuillez saisir le nom de la culture.',
      );
      return;
    }

    setCurrentStep(2);
  };

  const goToStep3 = () => {
    if (
      datePlantation &&
      datePrevueRecolte &&
      datePrevueRecolte <
        datePlantation
    ) {
      Alert.alert(
        'Dates invalides',
        'La date prévue de récolte doit être après la date de plantation.',
      );
      return;
    }

    setCurrentStep(3);
  };

  const goBackStep = () => {
    if (currentStep === 1) {
      router.back();
      return;
    }

    setCurrentStep(
      currentStep - 1,
    );
  };

  // =====================================================
  // ÉTATS POUR LE REVIEW
  // =====================================================

  const hasDates =
    !!datePlantation ||
    !!datePrevueRecolte;

  const stepLabels = [
    'Informations',
    'Planification',
    'Vérification',
  ];

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
      {/* ==================================================
          HEADER
      ================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={goBackStep}
          style={styles.headerButton}
        >
          <Text style={styles.backArrow}>
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={styles.headerContent}
        >
          <Text
            style={styles.headerTitle}
          >
            Nouvelle culture
          </Text>

          <Text
            style={styles.headerSubtitle}
          >
            Étape {currentStep} sur 3
          </Text>
        </View>

        <View
          style={styles.headerLeaf}
        >
          <Sprout
            size={18}
            color={
              colors.primary[700]
            }
          />
        </View>
      </View>

      <ScrollView
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={
          false
        }
      >
        {/* ==================================================
            STEPPER
        ================================================== */}

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

        {/* ==================================================
            ÉTAPE 1
        ================================================== */}

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
                    'Parcelle non renseignée'}
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
              label="Nom de la culture"
              required
              helper="Donnez un nom facile à reconnaître."
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
              helper="Exemple : céréale, légumineuse, tubercule..."
            >
              <TextInput
                style={styles.input}
                placeholder="Ex. : Céréale"
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
              label="Variété"
              helper="Précisez la variété cultivée si elle est connue."
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

        {/* ==================================================
            ÉTAPE 2
        ================================================== */}

        {currentStep === 2 ? (
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
        ) : null}

        {/* ==================================================
            ÉTAPE 3
        ================================================== */}

        {currentStep === 3 ? (
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
                  styles.introIconSuccess,
                ]}
              >
                <CircleCheck
                  size={24}
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
                  Vérifier la culture
                </Text>

                <Text
                  style={
                    styles.introDescription
                  }
                >
                  Vérifiez les informations
                  avant d'enregistrer votre
                  culture.
                </Text>
              </View>
            </View>

            {/* PREVIEW */}

            <View
              style={styles.reviewCard}
            >
              <View
                style={styles.reviewHeader}
              >
                <View
                  style={
                    styles.reviewHeaderIcon
                  }
                >
                  <Sprout
                    size={20}
                    color={
                      colors.primary[700]
                    }
                  />
                </View>

                <View
                  style={
                    styles.reviewHeaderText
                  }
                >
                  <Text
                    style={styles.reviewTitle}
                    numberOfLines={2}
                  >
                    {nom.trim() ||
                      'Nouvelle culture'}
                  </Text>

                  <Text
                    style={
                      styles.reviewSubtitle
                    }
                  >
                    Aperçu avant enregistrement
                  </Text>
                </View>
              </View>

              <ReviewRow
                icon={
                  <MapPinned
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Parcelle"
                value={
                  parcelleNom ||
                  parcelleId ||
                  '—'
                }
              />

              <ReviewRow
                icon={
                  <FileText
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Nom"
                value={
                  nom.trim() ||
                  '—'
                }
              />

              <ReviewRow
                icon={
                  <Layers
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Type"
                value={
                  type.trim() ||
                  'Non renseigné'
                }
              />

              <ReviewRow
                icon={
                  <Sprout
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Variété"
                value={
                  variete.trim() ||
                  'Non renseignée'
                }
              />

              <ReviewRow
                icon={
                  <CalendarDays
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Plantation"
                value={formaterDate(
                  datePlantation,
                )}
                valueStyle={
                  datePlantation
                    ? styles.reviewSuccessValue
                    : undefined
                }
              />

              <ReviewRow
                icon={
                  <CalendarDays
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Récolte prévue"
                value={formaterDate(
                  datePrevueRecolte,
                )}
                valueStyle={
                  datePrevueRecolte
                    ? styles.reviewSuccessValue
                    : undefined
                }
              />

              <ReviewRow
                icon={
                  <Sprout
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Stade"
                value={
                  stade.trim() ||
                  'Non renseigné'
                }
              />

              <ReviewRow
                icon={
                  <MapPinned
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Délimitation"
                value={
                  demanderDelimitation
                    ? 'À tracer après création'
                    : 'Non demandée'
                }
                valueStyle={
                  demanderDelimitation
                    ? styles.reviewSuccessValue
                    : undefined
                }
              />

              <ReviewRow
                icon={
                  <CircleCheck
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Statut initial"
                value="PLANIFIEE"
                valueStyle={
                  styles.reviewSuccessValue
                }
              />
            </View>

            {/* DESCRIPTION */}

            {description.trim() ? (
              <View
                style={
                  styles.reviewDescriptionCard
                }
              >
                <Text
                  style={
                    styles.reviewDescriptionLabel
                  }
                >
                  Description
                </Text>

                <Text
                  style={
                    styles.reviewDescriptionText
                  }
                >
                  {description.trim()}
                </Text>
              </View>
            ) : null}

            {/* DÉLIMITATION */}

            <View
              style={
                styles.delimitationCard
              }
            >
              <View
                style={
                  styles.delimitationHeader
                }
              >
                <View
                  style={
                    styles.delimitationHeaderLeft
                  }
                >
                  <View
                    style={
                      styles.delimitationIcon
                    }
                  >
                    <MapPinned
                      size={18}
                      color={
                        demanderDelimitation
                          ? colors.primary[700]
                          : '#64756A'
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.delimitationTitle
                      }
                    >
                      Délimitation de la culture
                    </Text>

                    <Text
                      style={
                        styles.delimitationSubtitle
                      }
                    >
                      {demanderDelimitation
                        ? 'La zone sera tracée après l’enregistrement'
                        : 'Délimitation facultative'}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.pointsBadge,
                    demanderDelimitation &&
                      styles.pointsBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.pointsBadgeText,
                      demanderDelimitation &&
                        styles.pointsBadgeTextCompleted,
                    ]}
                  >
                    {demanderDelimitation
                      ? 'OUI'
                      : 'NON'}
                  </Text>
                </View>
              </View>

              <Text
                style={
                  styles.delimitationDescription
                }
              >
                Voulez-vous tracer la zone de
                cette culture à l'intérieur de
                la parcelle ?
              </Text>

              <View
                style={styles.choiceRow}
              >
                <TouchableOpacity
                  activeOpacity={0.78}
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

                <TouchableOpacity
                  activeOpacity={0.78}
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

              {demanderDelimitation ? (
                <View
                  style={
                    styles.infoCard
                  }
                >
                  <View
                    style={styles.infoIcon}
                  >
                    <MapPinned
                      size={16}
                      color="#3D6E9D"
                    />
                  </View>

                  <Text
                    style={styles.infoText}
                  >
                    Après l'enregistrement,
                    vous pourrez tracer la
                    culture directement sur la
                    carte de la parcelle.
                  </Text>
                </View>
              ) : null}
            </View>

            {/* CHECKLIST */}

            <View
              style={
                styles.checklistCard
              }
            >
              <Text
                style={
                  styles.checklistTitle
                }
              >
                Vérification
              </Text>

              <CheckItem
                label="Nom de la culture renseigné"
                checked={!!nom.trim()}
              />

              <CheckItem
                label="Parcelle associée"
                checked={!!parcelleId}
              />

              <CheckItem
                label="Dates cohérentes"
                checked={
                  !(
                    datePlantation &&
                    datePrevueRecolte &&
                    datePrevueRecolte <
                      datePlantation
                  )
                }
              />

              <CheckItem
                label="Délimitation configurée"
                checked={true}
                last
              />
            </View>

            {/* STATUT */}

            <View
              style={styles.statusCard}
            >
              <View
                style={styles.statusIcon}
              >
                <CircleCheck
                  size={17}
                  color={
                    colors.primary[700]
                  }
                />
              </View>

              <View
                style={styles.statusContent}
              >
                <Text
                  style={styles.statusLabel}
                >
                  Statut initial
                </Text>

                <Text
                  style={styles.statusValue}
                >
                  PLANIFIEE
                </Text>

                <Text
                  style={styles.statusHint}
                >
                  La culture sera créée avec
                  le statut planifiée.
                </Text>
              </View>
            </View>

            {/* ENREGISTRER */}

            <TouchableOpacity
              activeOpacity={0.8}
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
                  color="#FFFFFF"
                />
              ) : (
                <>
                  <CircleCheck
                    size={20}
                    color="#FFFFFF"
                  />

                  <Text
                    style={
                      styles.saveText
                    }
                  >
                    Enregistrer la culture
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* MODIFIER */}

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() =>
                setCurrentStep(1)
              }
              style={
                styles.editBeforeSave
              }
              disabled={
                createCulture.isPending
              }
            >
              <Text
                style={
                  styles.editBeforeSaveText
                }
              >
                Modifier les informations
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* ==================================================
            DATE PICKER
        ================================================== */}

        {/* Le DateTimePicker est affiché dans l'étape 2
            au moment de la sélection. */}

        {/* ==================================================
            FOOTER
        ================================================== */}

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
    </KeyboardAvoidingView>
  );
}

// =======================================================
// COMPOSANTS UX RÉUTILISABLES
// =======================================================

function ButtonNext({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.nextButton}
      onPress={onPress}
    >
      <Text
        style={
          styles.nextButtonText
        }
      >
        {label}
      </Text>

      <View
        style={
          styles.nextButtonIcon
        }
      >
        <ChevronRight
          size={18}
          color="#FFFFFF"
        />
      </View>
    </TouchableOpacity>
  );
}

function FormGroup({
  icon,
  label,
  required = false,
  helper,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <View
      style={styles.formGroup}
    >
      <View
        style={styles.labelRow}
      >
        {icon}

        <Text
          style={styles.label}
        >
          {label}
        </Text>

        {required ? (
          <Text
            style={styles.required}
          >
            *
          </Text>
        ) : null}
      </View>

      {children}

      {helper ? (
        <Text
          style={styles.helperText}
        >
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

function DateField({
  label,
  value,
  selected,
  onPress,
  icon,
  iconColor,
}: {
  label: string;
  value: string;
  selected: boolean;
  onPress: () => void;
  icon?: React.ReactNode;
  iconColor: string;
}) {
  return (
    <View
      style={styles.formGroup}
    >
      <View
        style={styles.labelRow}
      >
        {icon || (
          <CalendarDays
            size={15}
            color={iconColor}
          />
        )}

        <Text
          style={styles.label}
        >
          {label}
        </Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.78}
        style={[
          styles.dateInput,
          selected &&
            styles.dateInputSelected,
        ]}
        onPress={onPress}
      >
        <View
          style={styles.dateInputLeft}
        >
          <CalendarDays
            size={17}
            color={
              selected
                ? colors.primary[700]
                : '#7D897F'
            }
          />

          <Text
            style={[
              styles.dateText,
              selected &&
                styles.dateTextSelected,
            ]}
          >
            {value}
          </Text>
        </View>

        <ChevronRight
          size={17}
          color="#7D897F"
        />
      </TouchableOpacity>
    </View>
  );
}

function ReviewRow({
  icon,
  label,
  value,
  valueStyle,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueStyle?: any;
}) {
  return (
    <View
      style={styles.reviewRow}
    >
      <View
        style={styles.reviewRowLeft}
      >
        <View
          style={styles.reviewRowIcon}
        >
          {icon}
        </View>

        <Text
          style={styles.reviewRowLabel}
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.reviewRowValue,
          valueStyle,
        ]}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function CheckItem({
  label,
  checked,
  last = false,
}: {
  label: string;
  checked: boolean;
  last?: boolean;
}) {
  return (
    <View
      style={[
        styles.checkItem,
        !last &&
          styles.checkItemBorder,
      ]}
    >
      <View
        style={[
          styles.checkItemIcon,
          checked
            ? styles.checkItemIconChecked
            : styles.checkItemIconEmpty,
        ]}
      >
        {checked ? (
          <Check
            size={13}
            color="#FFFFFF"
            strokeWidth={3}
          />
        ) : null}
      </View>

      <Text
        style={[
          styles.checkItemText,
          checked &&
            styles.checkItemTextChecked,
        ]}
      >
        {label}
      </Text>
    </View>
  );
}

// =======================================================
// STYLES
// =======================================================

const styles =
  StyleSheet.create({
    // ===================================================
    // ROOT
    // ===================================================

    container: {
      flex: 1,
      backgroundColor:
        '#DCEADB',
    },

    content: {
      paddingHorizontal: 15,
      paddingTop: 8,
      paddingBottom: 35,
      gap: 13,
    },

    // ===================================================
    // HEADER
    // ===================================================

    header: {
      minHeight: 67,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      gap: 10,
      backgroundColor:
        'rgba(220,234,219,0.97)',
      borderBottomWidth: 1,
      borderBottomColor:
        'rgba(54,77,57,0.08)',
    },

    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        'rgba(255,255,255,0.74)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    backArrow: {
      fontSize: 31,
      lineHeight: 31,
      color: '#1E3121',
      marginTop: -2,
      fontWeight: '400',
    },

    headerContent: {
      flex: 1,
    },

    headerTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#19241B',
    },

    headerSubtitle: {
      marginTop: 2,
      fontSize: 10.5,
      color: '#748076',
      fontWeight: '600',
    },

    headerLeaf: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#E5F1E5',
      borderWidth: 1,
      borderColor: '#CEE3CF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ===================================================
    // STEPPER
    // ===================================================

    stepperCard: {
      minHeight: 86,
      paddingHorizontal: 10,
      paddingVertical: 12,
      borderRadius: 19,
      backgroundColor:
        'rgba(255,255,255,0.88)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
    },

    stepperLine: {
      position: 'absolute',
      top: 28,
      left: 48,
      right: 48,
      height: 2,
      backgroundColor: '#E0E9E0',
    },

    stepper: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },

    step: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
    },

    stepCircle: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: '#E8EEE8',
      borderWidth: 2,
      borderColor: '#DCE5DC',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2,
    },

    stepCircleActive: {
      backgroundColor:
        colors.primary[700],
      borderColor:
        colors.primary[700],
    },

    stepCircleCompleted: {
      backgroundColor:
        colors.primary[600],
      borderColor:
        colors.primary[600],
    },

    stepNumber: {
      fontSize: 11,
      fontWeight: '800',
      color: '#7D897F',
    },

    stepNumberActive: {
      color: '#FFFFFF',
    },

    stepLabel: {
      fontSize: 9.5,
      color: '#89938A',
      fontWeight: '600',
      textAlign: 'center',
    },

    stepLabelActive: {
      color: '#24482A',
      fontWeight: '800',
    },

    stepLabelCompleted: {
      color:
        colors.primary[700],
      fontWeight: '700',
    },

    // ===================================================
    // STEP CONTENT
    // ===================================================

    stepContent: {
      gap: 13,
    },

    intro: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 11,
      paddingHorizontal: 2,
      paddingVertical: 3,
    },

    introIcon: {
      width: 45,
      height: 45,
      borderRadius: 15,
      backgroundColor: '#E5F2E5',
      borderWidth: 1,
      borderColor: '#CEE5CF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    introIconBlue: {
      backgroundColor: '#E8F1F7',
      borderColor: '#D2E3EF',
    },

    introIconSuccess: {
      backgroundColor: '#E5F3E5',
      borderColor: '#C9E4CB',
    },

    introText: {
      flex: 1,
      gap: 3,
    },

    introTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#1B271C',
    },

    introDescription: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#778378',
    },

    // ===================================================
    // CONTEXT PARCELLE
    // ===================================================

    contextCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      padding: 12,
      borderRadius: 17,
      backgroundColor: '#EEF6EE',
      borderWidth: 1,
      borderColor: '#DDEBDE',
    },

    contextIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#E1F0E1',
      alignItems: 'center',
      justifyContent: 'center',
    },

    contextContent: {
      flex: 1,
      gap: 2,
    },

    contextLabel: {
      fontSize: 10,
      color: '#7B877D',
      fontWeight: '700',
    },

    contextValue: {
      fontSize: 13.5,
      color: '#2C382E',
      fontWeight: '800',
    },

    // ===================================================
    // FORM
    // ===================================================

    formGroup: {
      gap: 6,
    },

    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    label: {
      fontSize: 12,
      color: '#364238',
      fontWeight: '800',
    },

    required: {
      color: '#D25454',
      fontSize: 13,
      fontWeight: '900',
    },

    input: {
      minHeight: 52,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#DCE5DC',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      paddingHorizontal: 14,
      fontSize: 13.5,
      color: '#273329',
      fontWeight: '600',
    },

    textArea: {
      minHeight: 105,
      paddingTop: 13,
      paddingBottom: 13,
    },

    helperText: {
      fontSize: 10,
      color: '#899389',
      paddingHorizontal: 2,
      lineHeight: 14,
    },

    // ===================================================
    // DATE
    // ===================================================

    dateInput: {
      minHeight: 54,
      paddingHorizontal: 13,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: '#DCE5DC',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    dateInputSelected: {
      borderColor: '#CFE3CF',
      backgroundColor: '#F4F8F4',
    },

    dateInputLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flex: 1,
    },

    dateText: {
      fontSize: 13,
      color: '#778378',
      fontWeight: '600',
    },

    dateTextSelected: {
      color: '#334036',
      fontWeight: '800',
    },

    // ===================================================
    // CALCULATED
    // ===================================================

    calculatedCard: {
      flexDirection: 'row',
      gap: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: '#EEF6EE',
      borderWidth: 1,
      borderColor: '#DDEBDE',
    },

    calculatedIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#E1F0E1',
      alignItems: 'center',
      justifyContent: 'center',
    },

    calculatedContent: {
      flex: 1,
      gap: 2,
    },

    calculatedTitle: {
      fontSize: 11,
      color: '#758178',
      fontWeight: '700',
    },

    calculatedValue: {
      fontSize: 15,
      color: '#253226',
      fontWeight: '800',
    },

    calculatedHint: {
      marginTop: 1,
      fontSize: 10,
      lineHeight: 15,
      color: '#859086',
    },

    // ===================================================
    // STEP ACTIONS
    // ===================================================

    stepActionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    secondaryStepButton: {
      minHeight: 54,
      paddingHorizontal: 16,
      borderRadius: 16,
      backgroundColor:
        'rgba(255,255,255,0.86)',
      borderWidth: 1,
      borderColor: '#DCE5DC',
      justifyContent: 'center',
      alignItems: 'center',
    },

    secondaryStepButtonText: {
      fontSize: 12.5,
      color: '#5E6C61',
      fontWeight: '800',
    },

    stepActionFlex: {
      flex: 1,
    },

    // ===================================================
    // NEXT BUTTON
    // ===================================================

    nextButton: {
      minHeight: 54,
      paddingLeft: 17,
      paddingRight: 7,
      borderRadius: 16,
      backgroundColor:
        colors.primary[700],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#214126',
      shadowOpacity: 0.14,
      shadowRadius: 10,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },

    nextButtonText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
    },

    nextButtonIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor:
        'rgba(255,255,255,0.16)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    // ===================================================
    // DÉLIMITATION
    // ===================================================

    delimitationCard: {
      padding: 13,
      borderRadius: 19,
      backgroundColor:
        'rgba(255,255,255,0.90)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      gap: 11,
    },

    delimitationHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 10,
    },

    delimitationHeaderLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },

    delimitationIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#EDF1EE',
      alignItems: 'center',
      justifyContent: 'center',
    },

    delimitationTitle: {
      fontSize: 13,
      color: '#273329',
      fontWeight: '800',
    },

    delimitationSubtitle: {
      marginTop: 2,
      fontSize: 10,
      color: '#829087',
      maxWidth: 220,
    },

    delimitationDescription: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#6B776E',
    },

    choiceRow: {
      flexDirection: 'row',
      gap: 9,
    },

    choiceButton: {
      flex: 1,
      minHeight: 48,
      borderWidth: 1,
      borderColor: '#DCE5DC',
      borderRadius: 14,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor:
        'rgba(255,255,255,0.88)',
    },

    choiceButtonActive: {
      backgroundColor:
        colors.primary[700],
      borderColor:
        colors.primary[700],
    },

    choiceText: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#667269',
    },

    choiceTextActive: {
      color: '#FFFFFF',
    },

    pointsBadge: {
      minWidth: 50,
      height: 30,
      paddingHorizontal: 8,
      borderRadius: 10,
      backgroundColor: '#EFF2EF',
      alignItems: 'center',
      justifyContent: 'center',
    },

    pointsBadgeCompleted: {
      backgroundColor: '#E3F1E4',
    },

    pointsBadgeText: {
      fontSize: 10.5,
      color: '#657168',
      fontWeight: '800',
    },

    pointsBadgeTextCompleted: {
      color:
        colors.primary[700],
    },

    // ===================================================
    // REVIEW
    // ===================================================

    reviewCard: {
      padding: 14,
      borderRadius: 20,
      backgroundColor:
        'rgba(255,255,255,0.91)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.90)',
    },

    reviewHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingBottom: 13,
      marginBottom: 2,
      borderBottomWidth: 1,
      borderBottomColor:
        '#EDF1ED',
    },

    reviewHeaderIcon: {
      width: 42,
      height: 42,
      borderRadius: 14,
      backgroundColor: '#E5F2E5',
      alignItems: 'center',
      justifyContent: 'center',
    },

    reviewHeaderText: {
      flex: 1,
      gap: 2,
    },

    reviewTitle: {
      fontSize: 16,
      color: '#1E2A20',
      fontWeight: '800',
    },

    reviewSubtitle: {
      fontSize: 10,
      color: '#7D887F',
    },

    reviewRow: {
      minHeight: 50,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderBottomWidth: 1,
      borderBottomColor:
        '#EDF1ED',
    },

    reviewRowLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    reviewRowIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor: '#F0F3F0',
      alignItems: 'center',
      justifyContent: 'center',
    },

    reviewRowLabel: {
      fontSize: 11,
      color: '#7A867D',
      fontWeight: '600',
    },

    reviewRowValue: {
      flex: 1.25,
      fontSize: 11.5,
      color: '#2D392F',
      fontWeight: '800',
      textAlign: 'right',
    },

    reviewSuccessValue: {
      color:
        colors.primary[700],
    },

    reviewDescriptionCard: {
      padding: 13,
      borderRadius: 16,
      backgroundColor: '#F4F8F4',
      borderWidth: 1,
      borderColor: '#E4ECE4',
    },

    reviewDescriptionLabel: {
      fontSize: 10,
      color: '#7C887E',
      fontWeight: '800',
      marginBottom: 4,
    },

    reviewDescriptionText: {
      fontSize: 11.5,
      lineHeight: 17,
      color: '#566359',
    },

    // ===================================================
    // CHECKLIST
    // ===================================================

    checklistCard: {
      padding: 13,
      borderRadius: 18,
      backgroundColor:
        'rgba(255,255,255,0.82)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.86)',
    },

    checklistTitle: {
      fontSize: 12,
      color: '#39453B',
      fontWeight: '800',
      marginBottom: 4,
    },

    checkItem: {
      minHeight: 39,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    checkItemBorder: {
      borderBottomWidth: 1,
      borderBottomColor:
        '#EDF1ED',
    },

    checkItemIcon: {
      width: 22,
      height: 22,
      borderRadius: 7,
      alignItems: 'center',
      justifyContent: 'center',
    },

    checkItemIconChecked: {
      backgroundColor:
        colors.primary[700],
    },

    checkItemIconEmpty: {
      backgroundColor: '#E8ECE8',
      borderWidth: 1,
      borderColor: '#D8E0D8',
    },

    checkItemText: {
      flex: 1,
      fontSize: 10.5,
      color: '#879188',
      fontWeight: '600',
    },

    checkItemTextChecked: {
      color: '#506052',
      fontWeight: '700',
    },

    // ===================================================
    // INFO
    // ===================================================

    infoCard: {
      flexDirection: 'row',
      gap: 8,
      padding: 11,
      borderRadius: 15,
      backgroundColor: '#EAF2F7',
      borderWidth: 1,
      borderColor: '#D9E8F0',
    },

    infoIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor: '#DDEBF4',
      alignItems: 'center',
      justifyContent: 'center',
    },

    infoText: {
      flex: 1,
      fontSize: 10.5,
      lineHeight: 16,
      color: '#5E7080',
      fontWeight: '600',
    },

    // ===================================================
    // STATUS
    // ===================================================

    statusCard: {
      flexDirection: 'row',
      gap: 10,
      padding: 13,
      borderRadius: 17,
      backgroundColor: '#EEF6EE',
      borderWidth: 1,
      borderColor: '#DDEBDE',
    },

    statusIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#E2F0E2',
      alignItems: 'center',
      justifyContent: 'center',
    },

    statusContent: {
      flex: 1,
      gap: 2,
    },

    statusLabel: {
      fontSize: 10,
      color: '#7B877D',
      fontWeight: '700',
    },

    statusValue: {
      fontSize: 14,
      color: '#2C382E',
      fontWeight: '800',
    },

    statusHint: {
      marginTop: 1,
      fontSize: 10,
      lineHeight: 15,
      color: '#859086',
    },

    // ===================================================
    // SAVE
    // ===================================================

    saveButton: {
      minHeight: 57,
      borderRadius: 17,
      backgroundColor:
        colors.primary[700],
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#214126',
      shadowOpacity: 0.16,
      shadowRadius: 11,
      shadowOffset: {
        width: 0,
        height: 5,
      },
      elevation: 3,
    },

    disabledButton: {
      opacity: 0.65,
    },

    saveText: {
      color: '#FFFFFF',
      fontSize: 13.5,
      fontWeight: '800',
    },

    editBeforeSave: {
      minHeight: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },

    editBeforeSaveText: {
      fontSize: 11.5,
      color:
        colors.primary[700],
      fontWeight: '800',
    },

    // ===================================================
    // FOOTER
    // ===================================================

    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingTop: 2,
    },

    footerIcon: {
      width: 25,
      height: 25,
      borderRadius: 9,
      backgroundColor:
        'rgba(255,255,255,0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    footerText: {
      fontSize: 10.5,
      color: '#748075',
      fontWeight: '600',
    },
  });
