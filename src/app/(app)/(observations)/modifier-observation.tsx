/* eslint-disable react/no-unescaped-entities */

import {
  useEffect,
  useMemo,
  useState,
} from 'react';

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
  ArrowLeft,
  CalendarDays,
  Check,
  FileText,
  MapPin,
  Pencil,
  Sprout,
} from 'lucide-react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useObservations,
  useUpdateObservation,
} from '@/hooks/useObservations';

type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export default function ModifierObservationScreen() {
  const params =
    useLocalSearchParams<{
      parcelleId?: string;
      cultureId?: string;
      observationId?: string;
      parcelleNom?: string;
      cultureNom?: string;
      statut?: string;
    }>();

  const parcelleId =
    typeof params.parcelleId === 'string'
      ? params.parcelleId
      : '';

  const cultureId =
    typeof params.cultureId === 'string'
      ? params.cultureId
      : '';

  const observationId =
    typeof params.observationId === 'string'
      ? params.observationId
      : '';

  const parcelleNom =
    typeof params.parcelleNom === 'string'
      ? params.parcelleNom
      : '';

  const cultureNom =
    typeof params.cultureNom === 'string'
      ? params.cultureNom
      : '';

  const statut =
    typeof params.statut === 'string'
      ? (params.statut as StatutCulture)
      : 'EN_COURS';

  const observationsQuery =
    useObservations(
      parcelleId,
      cultureId,
    );

  const updateMutation =
    useUpdateObservation();

  const [
    description,
    setDescription,
  ] = useState('');

  const [
    date,
    setDate,
  ] = useState('');

  const [
    initialisationFaite,
    setInitialisationFaite,
  ] = useState(false);

  // ====================================================
  // STATUT AFFICHÉ
  // ====================================================

  const statutLabel = useMemo(() => {
    switch (statut) {
      case 'PLANIFIEE':
        return 'PLANIFIÉE';

      case 'EN_COURS':
        return 'EN COURS';

      case 'RECOLTEE':
        return 'RÉCOLTÉE';

      case 'ABANDONNEE':
        return 'ABANDONNÉE';

      case 'SUPPRIMEE':
        return 'SUPPRIMÉE';

      default:
        return statut;
    }
  }, [statut]);

  // ====================================================
  // CHARGER OBSERVATION
  // ====================================================

  useEffect(() => {
    if (
      initialisationFaite ||
      observationsQuery.isLoading ||
      !observationId
    ) {
      return;
    }

    const observation =
      observationsQuery.data?.find(
        item =>
          item.id ===
          observationId,
      );

    if (!observation) {
      // Le chargement est terminé, mais
      // l'observation n'existe pas.
      if (
        !observationsQuery.isLoading
      ) {
        setInitialisationFaite(true);
      }

      return;
    }

    setDescription(
      observation.description ?? '',
    );

    setDate(
      observation.date ||
        new Date().toISOString(),
    );

    setInitialisationFaite(true);
  }, [
    initialisationFaite,
    observationId,
    observationsQuery.data,
    observationsQuery.isLoading,
  ]);

  // ====================================================
  // VALIDATION / DROITS
  // ====================================================

  const modificationAutorisee =
    statut !== 'SUPPRIMEE' &&
    statut !== 'RECOLTEE' &&
    statut !== 'ABANDONNEE';

  // ====================================================
  // ENREGISTRER
  // ====================================================

  const enregistrer =
    async () => {
      if (!modificationAutorisee) {
        Alert.alert(
          'Action impossible',
          'Cette culture est en lecture seule.',
        );

        return;
      }

      if (
        !parcelleId ||
        !cultureId ||
        !observationId
      ) {
        Alert.alert(
          'Erreur',
          'Les informations de l’observation sont incomplètes.',
        );

        return;
      }

      if (!description.trim()) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir une description.',
        );

        return;
      }

      try {
        await updateMutation.mutateAsync(
          {
            parcelleId,
            cultureId,
            observationId,
            data: {
              description:
                description.trim(),
              date:
                date.trim() ||
                undefined,
            },
          },
        );

        Alert.alert(
          'Observation mise à jour',
          'Votre observation terrain a été modifiée avec succès.',
          [
            {
              text: 'OK',
              onPress: () =>
                router.back(),
            },
          ],
        );
      } catch (error: any) {
        console.error(
          'ERREUR MODIFICATION OBSERVATION:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          error?.response?.data
            ?.message ||
            "Impossible de modifier l'observation.",
        );
      }
    };

  // ====================================================
  // ERREUR PARAMETRES
  // ====================================================

  if (
    !parcelleId ||
    !cultureId ||
    !observationId
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <FileText
            size={24}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Observation introuvable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Les paramètres nécessaires à la
          modification sont manquants.
        </Text>

        <TouchableOpacity
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (
    observationsQuery.isLoading ||
    !initialisationFaite
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.loadingIcon
          }
        >
          <Pencil
            size={21}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <ActivityIndicator
          size="small"
          color="#166534"
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement de l'observation...
        </Text>
      </View>
    );
  }

  // ====================================================
  // ERROR
  // ====================================================

  if (
    observationsQuery.isError
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <FileText
            size={24}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Impossible de charger
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          L'observation n'a pas pu être chargée.
        </Text>

        <TouchableOpacity
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // OBSERVATION INTROUVABLE
  // ====================================================

  const observation =
    observationsQuery.data?.find(
      item =>
        item.id ===
        observationId,
    );

  if (!observation) {
    return (
      <View
        style={
          styles.center
        }
      >
        <View
          style={
            styles.errorIcon
          }
        >
          <FileText
            size={24}
            color="#166534"
            strokeWidth={2}
          />
        </View>

        <Text
          style={
            styles.errorTitle
          }
        >
          Observation introuvable
        </Text>

        <Text
          style={
            styles.errorText
          }
        >
          Cette observation n'existe plus
          ou n'est plus accessible.
        </Text>

        <TouchableOpacity
          style={
            styles.backButtonLarge
          }
          onPress={() =>
            router.back()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Retour
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // ECRAN
  // ====================================================

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
              updateMutation.isPending
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
              Modifier l'observation
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Mettez à jour votre note terrain.
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
                    'Parcelle non renseignée'}
                </Text>
              </View>
            </View>

            <View
              style={
                styles.statusBadge
              }
            >
              <View
                style={
                  styles.statusDot
                }
              />

              <Text
                style={
                  styles.statusText
                }
              >
                {statutLabel}
              </Text>
            </View>
          </View>
        </View>

        {/* ==================================================
            SECTION OBSERVATION
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
            <Pencil
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
              Observation
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Modifiez les informations relevées sur le terrain.
            </Text>
          </View>
        </View>

        {/* ==================================================
            INFORMATIONS EXISTANTES
        ================================================== */}

        <View
          style={
            styles.existingCard
          }
        >
          <View
            style={
              styles.existingIcon
            }
          >
            <CalendarDays
              size={17}
              color="#166534"
              strokeWidth={2.1}
            />
          </View>

          <View
            style={
              styles.existingContent
            }
          >
            <Text
              style={
                styles.existingLabel
              }
            >
              OBSERVATION EXISTANTE
            </Text>

            <Text
              style={
                styles.existingDate
              }
            >
              Créée le{' '}
              {formaterDate(
                observation.date,
              )}
            </Text>
          </View>
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
                styles.requiredText
              }
            >
              Obligatoire
            </Text>
          </View>

          <TextInput
            style={
              styles.descriptionInput
            }
            value={description}
            onChangeText={
              setDescription
            }
            placeholder="Décrire ce que vous observez dans la culture..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={7}
            textAlignVertical="top"
            editable={
              modificationAutorisee &&
              !updateMutation.isPending
            }
            maxLength={500}
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
              Décrivez les symptômes, leur emplacement ou leur évolution.
            </Text>

            <Text
              style={
                styles.characterCount
              }
            >
              {description.length}/500
            </Text>
          </View>
        </View>

        {/* ==================================================
            CONSEIL
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
              Gardez la description factuelle :
              symptômes, zone concernée, évolution
              ou intervention observée.
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
              Moment de l'observation
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Ajustez la date si l'observation a été saisie plus tard.
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
              DATE DE L'OBSERVATION
            </Text>

            <TextInput
              style={
                styles.dateInput
              }
              value={date}
              onChangeText={
                setDate
              }
              placeholder="2026-10-01T08:30:00.000Z"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              editable={
                modificationAutorisee &&
                !updateMutation.isPending
              }
            />
          </View>
        </View>

        <Text
          style={
            styles.dateHelp
          }
        >
          Format conservé pour l'enregistrement :
          AAAA-MM-JJTHH:mm:ss
        </Text>

        {/* ==================================================
            ACTION
        ================================================== */}

        {modificationAutorisee ? (
          <TouchableOpacity
            style={[
              styles.saveButton,
              updateMutation.isPending &&
                styles.saveButtonDisabled,
            ]}
            onPress={
              enregistrer
            }
            disabled={
              updateMutation.isPending
            }
            activeOpacity={0.85}
          >
            {updateMutation.isPending ? (
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
                    Enregistrer les modifications
                  </Text>

                  <Text
                    style={
                      styles.saveSubtext
                    }
                  >
                    Mettre à jour la note terrain
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        ) : (
          <View
            style={
              styles.readOnlyBox
            }
          >
            <View
              style={
                styles.readOnlyIcon
              }
            >
              <FileText
                size={17}
                color="#9A3412"
                strokeWidth={2}
              />
            </View>

            <View
              style={
                styles.readOnlyContent
              }
            >
              <Text
                style={
                  styles.readOnlyTitle
                }
              >
                Observation en lecture seule
              </Text>

              <Text
                style={
                  styles.readOnlyText
                }
              >
                Cette culture ne permet plus la modification
                des observations.
              </Text>
            </View>
          </View>
        )}

        <Text
          style={
            styles.bottomHint
          }
        >
          Les modifications seront enregistrées sur cette observation.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// ======================================================
// DATE
// ======================================================

function formaterDate(
  date: string,
): string {
  if (!date) {
    return 'Date inconnue';
  }

  const valeur =
    new Date(date);

  if (
    Number.isNaN(
      valeur.getTime(),
    )
  ) {
    return date;
  }

  return valeur.toLocaleString(
    'fr-FR',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    },
  );
}

// ======================================================
// STYLES
// ======================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F3',
  },

  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 36,
  },

  // ===================================================
  // ETATS
  // ===================================================

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F4F8F3',
  },

  loadingIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: '#E8F5E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  errorIcon: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: '#E8F5E4',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },

  loadingText: {
    marginTop: 12,
    color: '#6B7280',
    fontSize: 14,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172018',
    textAlign: 'center',
    marginBottom: 8,
  },

  errorText: {
    color: '#6B7280',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 22,
  },

  backButtonLarge: {
    backgroundColor: '#166534',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },

  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },

  // ===================================================
  // HEADER
  // ===================================================

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

  // ===================================================
  // CONTEXTE
  // ===================================================

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

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 9,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#ECFDF3',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 5,
  },

  statusText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#166534',
  },

  // ===================================================
  // SECTION
  // ===================================================

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

  // ===================================================
  // OBSERVATION EXISTANTE
  // ===================================================

  existingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCE7DA',
    padding: 12,
    marginBottom: 14,
  },

  existingIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#ECFDF3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  existingContent: {
    flex: 1,
  },

  existingLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.7,
    color: '#9CA3AF',
  },

  existingDate: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },

  // ===================================================
  // DESCRIPTION
  // ===================================================

  descriptionCard: {
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

  fieldTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  fieldLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#4B5563',
  },

  requiredText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#16A34A',
  },

  descriptionInput: {
    minHeight: 165,
    paddingHorizontal: 14,
    paddingTop: 14,
    paddingBottom: 12,
    fontSize: 14,
    lineHeight: 21,
    color: '#172018',
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

  characterCount: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  // ===================================================
  // CONSEIL
  // ===================================================

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

  // ===================================================
  // DATE
  // ===================================================

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

  // ===================================================
  // ACTION
  // ===================================================

  saveButton: {
    minHeight: 58,
    borderRadius: 17,
    backgroundColor: '#166534',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
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

  readOnlyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FED7AA',
    borderRadius: 16,
    padding: 14,
  },

  readOnlyIcon: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },

  readOnlyContent: {
    flex: 1,
  },

  readOnlyTitle: {
    color: '#9A3412',
    fontSize: 12,
    fontWeight: '800',
  },

  readOnlyText: {
    marginTop: 3,
    color: '#9A3412',
    fontSize: 10,
    lineHeight: 15,
  },

  bottomHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },
});