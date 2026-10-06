import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import {
  ArrowLeft,
  Banknote,
  CalendarDays,
  Check,
  ChevronDown,
  FileText,
  MapPin,
  Package,
  Scale,
  Sprout,
  Wrench,
} from 'lucide-react-native';

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
// UNITÉS DISPONIBLES POUR LES INTERVENTIONS AGRICOLES
// =====================================================

const UNITE_OPTIONS = [
  'kg',
  'g',
  't',
  'L',
  'mL',
  'sac',
  'sacs',
  'bidon',
  'bidons',
  'seaux',
  'unités',
  'doses',
  'plants',
  'arbres',
] as const;

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
  // ÉTAT LISTE UNITÉ
  // ===================================================

  const [unitModalVisible, setUnitModalVisible] =
    useState(false);

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
  // SÉLECTION UNITÉ
  // ===================================================

  const selectionnerUnite =
    (value: string) => {
      setUnite(value);
      setUnitModalVisible(false);
    };

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
          styles.scrollContent
        }
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >

        {/* ==================================================
            HEADER
        ================================================== */}

        <View
          style={
            styles.header
          }
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
            disabled={
              isSubmitting
            }
            activeOpacity={0.8}
          >
            <ArrowLeft
              size={21}
              color="#172018"
              strokeWidth={2.2}
            />
          </TouchableOpacity>

          <View
            style={
              styles.headerTextBlock
            }
          >
            <Text
              style={
                styles.eyebrow
              }
            >
              SUIVI TERRAIN
            </Text>

            <Text
              style={
                styles.title
              }
            >
              Nouvelle intervention
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Enregistrez une opération réalisée
              sur cette culture.
            </Text>
          </View>
        </View>

        {/* ==================================================
            FICHE CULTURE
        ================================================== */}

        <View
          style={
            styles.contextCard
          }
        >
          <View
            style={
              styles.contextAccent
            }
          />

          <View
            style={
              styles.contextMain
            }
          >
            <View
              style={
                styles.contextIconLarge
              }
            >
              <Sprout
                size={24}
                color="#166534"
                strokeWidth={2.2}
              />
            </View>

            <View
              style={
                styles.contextIdentity
              }
            >
              <Text
                style={
                  styles.contextOverline
                }
              >
                CULTURE SUIVIE
              </Text>

              <Text
                style={
                  styles.contextCulture
                }
                numberOfLines={1}
              >
                {cultureNom ||
                  'Culture'}
              </Text>

              <View
                style={
                  styles.parcelleLine
                }
              >
                <MapPin
                  size={14}
                  color="#6B7280"
                  strokeWidth={2}
                />

                <Text
                  style={
                    styles.parcelleText
                  }
                  numberOfLines={1}
                >
                  {parcelleNom ||
                    parcelleId ||
                    'Parcelle non renseignée'}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.interventionBadge
              }
            >
              <Wrench
                size={12}
                color="#166534"
                strokeWidth={2.2}
              />

              <Text
                style={
                  styles.interventionBadgeText
                }
              >
                INTERVENTION
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            SECTION INTERVENTION
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Wrench
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Intervention
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Décrivez l’opération réalisée sur la culture.
            </Text>
          </View>
        </View>

        {/* ==================================================
            TYPE
        ================================================== */}

        <View
          style={
            styles.fieldCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
              }
            >
              <Wrench
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                TYPE D’INTERVENTION
              </Text>
            </View>

            <Text
              style={
                styles.requiredText
              }
            >
              Obligatoire
            </Text>
          </View>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : FERTILISATION"
            placeholderTextColor="#9CA3AF"
            value={type}
            onChangeText={
              setType
            }
            editable={
              !isSubmitting
            }
            autoCapitalize="characters"
          />

          <Text
            style={
              styles.fieldHint
            }
          >
            Indiquez la nature de l’intervention réalisée.
          </Text>
        </View>

        {/* ==================================================
            DESCRIPTION
        ================================================== */}

        <View
          style={
            styles.descriptionCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
              }
            >
              <FileText
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                DESCRIPTION
              </Text>
            </View>

            <Text
              style={
                styles.optionalText
              }
            >
              Facultatif
            </Text>
          </View>

          <TextInput
            style={
              styles.descriptionInput
            }
            placeholder="Ex : Fertilisation complémentaire après plantation"
            placeholderTextColor="#9CA3AF"
            value={description}
            onChangeText={
              setDescription
            }
            editable={
              !isSubmitting
            }
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />

          <View
            style={
              styles.descriptionFooter
            }
          >
            <Text
              style={
                styles.descriptionHint
              }
            >
              Ajoutez les détails utiles sur l’opération effectuée.
            </Text>
          </View>
        </View>

        {/* ==================================================
            CONSEIL TERRAIN
        ================================================== */}

        <View
          style={
            styles.tipCard
          }
        >
          <View
            style={
              styles.tipIcon
            }
          >
            <Sprout
              size={16}
              color="#166534"
              strokeWidth={2}
            />
          </View>

          <View
            style={
              styles.tipContent
            }
          >
            <Text
              style={
                styles.tipTitle
              }
            >
              Conseil terrain
            </Text>

            <Text
              style={
                styles.tipText
              }
            >
              Notez ce qui a été appliqué,
              réalisé ou observé pendant l’intervention.
            </Text>
          </View>
        </View>

        {/* ==================================================
            DATE
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <CalendarDays
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Moment de l’intervention
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Quand cette intervention a-t-elle été réalisée ?
            </Text>
          </View>
        </View>

        <View
          style={
            styles.dateCard
          }
        >
          <View
            style={
              styles.dateIcon
            }
          >
            <CalendarDays
              size={19}
              color="#166534"
              strokeWidth={2.1}
            />
          </View>

          <View
            style={
              styles.dateContent
            }
          >
            <Text
              style={
                styles.dateLabel
              }
            >
              DATE DE L’INTERVENTION
            </Text>

            <TextInput
              style={
                styles.dateInput
              }
              placeholder="AAAA-MM-JJ"
              placeholderTextColor="#9CA3AF"
              value={date}
              onChangeText={
                setDate
              }
              editable={
                !isSubmitting
              }
              keyboardType="numbers-and-punctuation"
            />
          </View>
        </View>

        <Text
          style={
            styles.dateHelp
          }
        >
          Format attendu : AAAA-MM-JJ
        </Text>

        {/* ==================================================
            PRODUIT
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Package
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Produit et quantité
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Renseignez les produits utilisés, si nécessaire.
            </Text>
          </View>
        </View>

        {/* ==================================================
            PRODUIT
        ================================================== */}

        <View
          style={
            styles.fieldCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
              }
            >
              <Package
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                PRODUIT
              </Text>
            </View>

            <Text
              style={
                styles.optionalText
              }
            >
              Facultatif
            </Text>
          </View>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : NPK 15-15-15"
            placeholderTextColor="#9CA3AF"
            value={produit}
            onChangeText={
              setProduit
            }
            editable={
              !isSubmitting
            }
          />
        </View>

        {/* ==================================================
            QUANTITÉ + UNITÉ
        ================================================== */}

        <View
          style={
            styles.quantityUnitRow
          }
        >
          {/* ==============================================
              QUANTITÉ
          ============================================== */}

          <View
            style={
              styles.quantityCard
            }
          >
            <View
              style={
                styles.fieldTopRowCompact
              }
            >
              <View
                style={
                  styles.fieldTitleWrap
                }
              >
                <Scale
                  size={16}
                  color="#166534"
                  strokeWidth={2.1}
                />

                <Text
                  style={
                    styles.fieldLabel
                  }
                >
                  QUANTITÉ
                </Text>
              </View>

              <Text
                style={
                  styles.optionalText
                }
              >
                Facultatif
              </Text>
            </View>

            <TextInput
              style={
                styles.input
              }
              placeholder="Ex : 25"
              placeholderTextColor="#9CA3AF"
              value={quantite}
              onChangeText={
                setQuantite
              }
              editable={
                !isSubmitting
              }
              keyboardType="decimal-pad"
            />
          </View>

          {/* ==============================================
              UNITÉ
          ============================================== */}

          <View
            style={
              styles.unitCard
            }
          >
            <View
              style={
                styles.fieldTopRowCompact
              }
            >
              <View
                style={
                  styles.fieldTitleWrap
                }
              >
                <Scale
                  size={16}
                  color="#166534"
                  strokeWidth={2.1}
                />

                <Text
                  style={
                    styles.fieldLabel
                }
                >
                  UNITÉ
                </Text>
              </View>

              <Text
                style={
                  styles.optionalText
                }
              >
                Facultatif
              </Text>
            </View>

            <TouchableOpacity
              style={
                styles.dropdownButton
              }
              onPress={() =>
                setUnitModalVisible(true)
              }
              disabled={
                isSubmitting
              }
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.dropdownText,
                  !unite &&
                    styles.dropdownPlaceholder,
                ]}
                numberOfLines={1}
              >
                {unite ||
                  'Choisir'}
              </Text>

              <ChevronDown
                size={18}
                color="#6B7280"
                strokeWidth={2.2}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* ==================================================
            COÛT
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionIcon
            }
          >
            <Banknote
              size={17}
              color="#166534"
              strokeWidth={2.2}
            />
          </View>

          <View
            style={
              styles.sectionHeaderText
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Coût de l’intervention
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Indiquez le coût si vous souhaitez le suivre.
            </Text>
          </View>
        </View>

        <View
          style={
            styles.fieldCard
          }
        >
          <View
            style={
              styles.fieldTopRow
            }
          >
            <View
              style={
                styles.fieldTitleWrap
              }
            >
              <Banknote
                size={16}
                color="#166534"
                strokeWidth={2.1}
              />

              <Text
                style={
                  styles.fieldLabel
                }
              >
                COÛT
              </Text>
            </View>

            <Text
              style={
                styles.optionalText
              }
            >
              Facultatif
            </Text>
          </View>

          <TextInput
            style={
              styles.input
            }
            placeholder="Ex : 150000"
            placeholderTextColor="#9CA3AF"
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
              styles.fieldHint
            }
          >
            Montant en Ariary (Ar)
          </Text>
        </View>

        {/* ==================================================
            ACTION PRINCIPALE
        ================================================== */}

        <TouchableOpacity
          style={[
            styles.saveButton,
            isSubmitting &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            enregistrerIntervention
          }
          disabled={
            isSubmitting
          }
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator
                size="small"
                color="#FFFFFF"
              />

              <Text
                style={
                  styles.saveText
                }
              >
                Enregistrement...
              </Text>
            </>
          ) : (
            <>
              <View
                style={
                  styles.saveIcon
                }
              >
                <Check
                  size={18}
                  color="#FFFFFF"
                  strokeWidth={2.8}
                />
              </View>

              <View
                style={
                  styles.saveTextBlock
                }
              >
                <Text
                  style={
                    styles.saveText
                  }
                >
                  Enregistrer l’intervention
                </Text>

                <Text
                  style={
                    styles.saveSubtext
                  }
                >
                  Sauvegarder l’opération terrain
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        {/* ==================================================
            ANNULER
        ================================================== */}

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
          activeOpacity={0.8}
        >
          <ArrowLeft
            size={17}
            color="#4B5563"
            strokeWidth={2.1}
          />

          <Text
            style={
              styles.cancelButtonText
            }
          >
            Annuler
          </Text>
        </TouchableOpacity>

        <Text
          style={
            styles.bottomHint
          }
        >
          Vous pourrez retrouver cette intervention
          dans le suivi de la culture.
        </Text>

      </ScrollView>

      {/* ==================================================
          MODAL LISTE UNITÉS
      ================================================== */}

      <Modal
        visible={
          unitModalVisible
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setUnitModalVisible(false)
        }
      >
        <View
          style={
            styles.modalOverlay
          }
        >
          <TouchableOpacity
            style={
              StyleSheet.absoluteFill
            }
            activeOpacity={1}
            onPress={() =>
              setUnitModalVisible(false)
            }
          />

          <View
            style={
              styles.unitModal
            }
          >
            <View
              style={
                styles.modalHeader
              }
            >
              <View
                style={
                  styles.modalHeaderIcon
                }
              >
                <Scale
                  size={19}
                  color="#166534"
                  strokeWidth={2.2}
                />
              </View>

              <View
                style={
                  styles.modalHeaderTextBlock
                }
              >
                <Text
                  style={
                    styles.modalTitle
                  }
                >
                  Choisir une unité
                </Text>

                <Text
                  style={
                    styles.modalSubtitle
                  }
                >
                  Sélectionnez l’unité utilisée pour la quantité.
                </Text>
              </View>

              <TouchableOpacity
                style={
                  styles.modalCloseButton
                }
                onPress={() =>
                  setUnitModalVisible(false)
                }
                activeOpacity={0.8}
              >
                <Text
                  style={
                    styles.modalCloseText
                  }
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={
                styles.unitList
              }
              contentContainerStyle={
                styles.unitListContent
              }
              showsVerticalScrollIndicator={false}
            >
              {/* ==========================================
                  AUCUNE UNITÉ
              ========================================== */}

              <TouchableOpacity
                style={[
                  styles.unitOption,
                  !unite &&
                    styles.unitOptionSelected,
                ]}
                onPress={() =>
                  selectionnerUnite('')
                }
                activeOpacity={0.8}
              >
                <View
                  style={
                    styles.unitOptionTextBlock
                  }
                >
                  <Text
                    style={[
                      styles.unitOptionText,
                      !unite &&
                        styles.unitOptionTextSelected,
                    ]}
                  >
                    Aucune unité
                  </Text>

                  <Text
                    style={
                      styles.unitOptionHint
                    }
                  >
                    Ne pas préciser d’unité
                  </Text>
                </View>

                {!unite && (
                  <View
                    style={
                      styles.unitCheck
                    }
                  >
                    <Check
                      size={16}
                      color="#FFFFFF"
                      strokeWidth={2.8}
                    />
                  </View>
                )}
              </TouchableOpacity>

              {/* ==========================================
                  UNITÉS
              ========================================== */}

              {UNITE_OPTIONS.map(
                (item) => {
                  const selected =
                    unite === item;

                  return (
                    <TouchableOpacity
                      key={item}
                      style={[
                        styles.unitOption,
                        selected &&
                          styles.unitOptionSelected,
                      ]}
                      onPress={() =>
                        selectionnerUnite(item)
                      }
                      activeOpacity={0.8}
                    >
                      <View
                        style={
                          styles.unitOptionTextBlock
                        }
                      >
                        <Text
                          style={[
                            styles.unitOptionText,
                            selected &&
                              styles.unitOptionTextSelected,
                          ]}
                        >
                          {item}
                        </Text>

                        {item === 'kg' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            kilogramme
                          </Text>
                        )}

                        {item === 'g' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            gramme
                          </Text>
                        )}

                        {item === 't' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            tonne
                          </Text>
                        )}

                        {item === 'L' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            litre
                          </Text>
                        )}

                        {item === 'mL' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            millilitre
                          </Text>
                        )}

                        {item === 'sac' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            sac
                          </Text>
                        )}

                        {item === 'sacs' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            sacs
                          </Text>
                        )}

                        {item === 'bidon' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            bidon
                          </Text>
                        )}

                        {item === 'bidons' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            bidons
                          </Text>
                        )}

                        {item === 'seaux' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            seaux
                          </Text>
                        )}

                        {item === 'unités' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            quantité comptée à l’unité
                          </Text>
                        )}

                        {item === 'doses' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            doses de produit
                          </Text>
                        )}

                        {item === 'plants' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            plants
                          </Text>
                        )}

                        {item === 'arbres' && (
                          <Text
                            style={
                              styles.unitOptionHint
                            }
                          >
                            arbres
                          </Text>
                        )}
                      </View>

                      {selected && (
                        <View
                          style={
                            styles.unitCheck
                          }
                        >
                          <Check
                            size={16}
                            color="#FFFFFF"
                            strokeWidth={2.8}
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                },
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles =
  StyleSheet.create({

    // =================================================
    // CONTENEUR
    // =================================================

    container: {
      flex: 1,
      backgroundColor: '#F4F8F3',
    },

    scrollContent: {
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 36,
    },

    // =================================================
    // HEADER
    // =================================================

    header: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 18,
    },

    backButton: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    headerTextBlock: {
      flex: 1,
      paddingTop: 1,
    },

    eyebrow: {
      fontSize: 10,
      fontWeight: '800',
      color: '#4D7C55',
      letterSpacing: 1,
      marginBottom: 3,
    },

    title: {
      fontSize: 24,
      lineHeight: 29,
      fontWeight: '800',
      color: '#172018',
      letterSpacing: -0.4,
    },

    subtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color: '#6B7280',
    },

    // =================================================
    // CONTEXTE CULTURE
    // =================================================

    contextCard: {
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      marginBottom: 24,
      shadowColor: '#14532D',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 2,
    },

    contextAccent: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: 5,
      backgroundColor: '#22C55E',
    },

    contextMain: {
      minHeight: 106,
      paddingVertical: 15,
      paddingHorizontal: 15,
      paddingLeft: 18,
      flexDirection: 'row',
      alignItems: 'center',
    },

    contextIconLarge: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#ECFDF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },

    contextIdentity: {
      flex: 1,
      minWidth: 0,
    },

    contextOverline: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.9,
      color: '#9CA3AF',
    },

    contextCulture: {
      marginTop: 2,
      fontSize: 17,
      lineHeight: 21,
      fontWeight: '800',
      color: '#172018',
    },

    parcelleLine: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 5,
    },

    parcelleText: {
      flex: 1,
      marginLeft: 5,
      fontSize: 11,
      color: '#6B7280',
    },

    interventionBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 8,
      paddingHorizontal: 8,
      paddingVertical: 7,
      borderRadius: 999,
      backgroundColor: '#ECFDF3',
      borderWidth: 1,
      borderColor: '#BBF7D0',
    },

    interventionBadgeText: {
      marginLeft: 4,
      fontSize: 8,
      fontWeight: '800',
      color: '#166534',
    },

    // =================================================
    // SECTION HEADER
    // =================================================

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 10,
      marginTop: 2,
    },

    sectionIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor: '#E8F5E4',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    sectionHeaderText: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 14,
      lineHeight: 18,
      fontWeight: '800',
      color: '#172018',
    },

    sectionSubtitle: {
      marginTop: 2,
      fontSize: 11,
      lineHeight: 16,
      color: '#6B7280',
    },

    // =================================================
    // CHAMPS
    // =================================================

    fieldCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
      marginBottom: 14,
    },

    fieldTopRow: {
      minHeight: 48,
      paddingHorizontal: 14,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#EEF3ED',
    },

    fieldTopRowCompact: {
      minHeight: 46,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottomWidth: 1,
      borderBottomColor: '#EEF3ED',
    },

    fieldTitleWrap: {
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      flexShrink: 1,
    },

    fieldLabel: {
      marginLeft: 7,
      fontSize: 10,
      fontWeight: '800',
      letterSpacing: 0.8,
      color: '#4B5563',
      flexShrink: 1,
    },

    requiredText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#16A34A',
    },

    optionalText: {
      fontSize: 9,
      fontWeight: '700',
      color: '#9CA3AF',
      marginLeft: 5,
    },

    input: {
      minHeight: 56,
      paddingHorizontal: 14,
      paddingVertical: 10,
      fontSize: 14,
      lineHeight: 20,
      color: '#172018',
      backgroundColor: '#FFFFFF',
    },

    fieldHint: {
      paddingHorizontal: 14,
      paddingBottom: 11,
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // DESCRIPTION
    // =================================================

    descriptionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
      marginBottom: 14,
    },

    descriptionInput: {
      minHeight: 150,
      paddingHorizontal: 14,
      paddingTop: 14,
      paddingBottom: 12,
      fontSize: 14,
      lineHeight: 21,
      color: '#172018',
      backgroundColor: '#FFFFFF',
    },

    descriptionFooter: {
      minHeight: 42,
      paddingHorizontal: 12,
      paddingBottom: 9,
      paddingTop: 2,
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },

    descriptionHint: {
      flex: 1,
      paddingRight: 12,
      fontSize: 10,
      lineHeight: 14,
      color: '#9CA3AF',
    },

    // =================================================
    // CONSEIL TERRAIN
    // =================================================

    tipCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#F0FDF4',
      borderWidth: 1,
      borderColor: '#D1FAE5',
      borderRadius: 15,
      padding: 12,
      marginBottom: 22,
    },

    tipIcon: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: '#DCFCE7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 9,
    },

    tipContent: {
      flex: 1,
    },

    tipTitle: {
      fontSize: 11,
      fontWeight: '800',
      color: '#166534',
    },

    tipText: {
      marginTop: 3,
      fontSize: 10,
      lineHeight: 15,
      color: '#4B5563',
    },

    // =================================================
    // DATE
    // =================================================

    dateCard: {
      minHeight: 72,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      paddingHorizontal: 12,
    },

    dateIcon: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#ECFDF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    dateContent: {
      flex: 1,
    },

    dateLabel: {
      fontSize: 9,
      fontWeight: '800',
      letterSpacing: 0.7,
      color: '#9CA3AF',
      marginBottom: 2,
    },

    dateInput: {
      minHeight: 30,
      paddingHorizontal: 0,
      paddingVertical: 0,
      fontSize: 13,
      fontWeight: '700',
      color: '#172018',
    },

    dateHelp: {
      marginTop: 6,
      marginLeft: 3,
      marginBottom: 22,
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // QUANTITÉ + UNITÉ
    // =================================================

    quantityUnitRow: {
      flexDirection: 'row',
      alignItems: 'stretch',
      gap: 10,
      marginBottom: 14,
    },

    quantityCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
    },

    unitCard: {
      flex: 1,
      minWidth: 0,
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      overflow: 'hidden',
    },

    dropdownButton: {
      minHeight: 56,
      paddingHorizontal: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
    },

    dropdownText: {
      flex: 1,
      marginRight: 8,
      fontSize: 14,
      fontWeight: '700',
      color: '#172018',
    },

    dropdownPlaceholder: {
      color: '#9CA3AF',
      fontWeight: '500',
    },

    // =================================================
    // SAVE
    // =================================================

    saveButton: {
      minHeight: 58,
      borderRadius: 17,
      backgroundColor: '#166534',
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 14,
      marginTop: 2,
      shadowColor: '#166534',
      shadowOffset: {
        width: 0,
        height: 5,
      },
      shadowOpacity: 0.18,
      shadowRadius: 10,
      elevation: 4,
    },

    saveButtonDisabled: {
      opacity: 0.72,
    },

    saveIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#22C55E',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    saveTextBlock: {
      flex: 1,
    },

    saveText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    saveSubtext: {
      marginTop: 2,
      color: '#DCFCE7',
      fontSize: 10,
      fontWeight: '500',
    },

    // =================================================
    // ANNULER
    // =================================================

    cancelButton: {
      minHeight: 50,
      borderRadius: 15,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 12,
      marginTop: 10,
    },

    cancelButtonText: {
      marginLeft: 7,
      color: '#4B5563',
      fontSize: 13,
      fontWeight: '700',
    },

    // =================================================
    // BOTTOM HINT
    // =================================================

    bottomHint: {
      marginTop: 10,
      textAlign: 'center',
      fontSize: 10,
      lineHeight: 15,
      color: '#9CA3AF',
    },

    // =================================================
    // MODAL UNITÉS
    // =================================================

    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 23, 18, 0.42)',
      justifyContent: 'flex-end',
    },

    unitModal: {
      maxHeight: '78%',
      backgroundColor: '#F4F8F3',
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      paddingBottom: Platform.OS === 'ios' ? 26 : 18,
    },

    modalHeader: {
      minHeight: 82,
      paddingHorizontal: 16,
      paddingVertical: 14,
      backgroundColor: '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: '#E5ECE3',
      flexDirection: 'row',
      alignItems: 'center',
    },

    modalHeaderIcon: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#ECFDF3',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },

    modalHeaderTextBlock: {
      flex: 1,
      minWidth: 0,
    },

    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: '#172018',
    },

    modalSubtitle: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 15,
      color: '#6B7280',
    },

    modalCloseButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#F4F8F3',
      borderWidth: 1,
      borderColor: '#DCE7DA',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },

    modalCloseText: {
      marginTop: -2,
      fontSize: 25,
      lineHeight: 28,
      color: '#4B5563',
      fontWeight: '400',
    },

    unitList: {
      flexGrow: 0,
    },

    unitListContent: {
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 18,
    },

    unitOption: {
      minHeight: 64,
      marginBottom: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: '#DCE7DA',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    unitOptionSelected: {
      backgroundColor: '#F0FDF4',
      borderColor: '#86EFAC',
    },

    unitOptionTextBlock: {
      flex: 1,
      minWidth: 0,
    },

    unitOptionText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#172018',
    },

    unitOptionTextSelected: {
      color: '#166534',
    },

    unitOptionHint: {
      marginTop: 2,
      fontSize: 10,
      lineHeight: 14,
      color: '#9CA3AF',
    },

    unitCheck: {
      width: 28,
      height: 28,
      borderRadius: 10,
      backgroundColor: '#22C55E',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 10,
    },
  });