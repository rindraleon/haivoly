/* eslint-disable react/no-unescaped-entities */

import {
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
  Sprout,
} from 'lucide-react-native';

import {
  router,
  useLocalSearchParams,
} from 'expo-router';

import {
  useCreateObservation,
} from '@/hooks/useObservations';

type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

export default function AjoutObservationScreen() {
  const params =
    useLocalSearchParams<{
      parcelleId?: string;
      cultureId?: string;
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

  const createMutation =
    useCreateObservation();

  const [description, setDescription] =
    useState('');

  const [date, setDate] =
    useState(
      new Date().toISOString(),
    );

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

  const enregistrer =
    async () => {
      if (
        statut === 'SUPPRIMEE' ||
        statut === 'RECOLTEE' ||
        statut === 'ABANDONNEE'
      ) {
        Alert.alert(
          'Action impossible',
          'Cette culture est en lecture seule.',
        );

        return;
      }

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

      if (!description.trim()) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir une description.',
        );

        return;
      }

      try {
        await createMutation.mutateAsync(
          {
            parcelleId,
            cultureId,
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
          'Observation enregistrée',
          'Votre observation terrain a été ajoutée avec succès.',
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
          'ERREUR OBSERVATION:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          error?.response?.data
            ?.message ||
            "Impossible d'enregistrer l'observation.",
        );
      }
    };

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
          style={styles.header}
        >
          <TouchableOpacity
            style={
              styles.backButton
            }
            onPress={() =>
              router.back()
            }
            disabled={
              createMutation.isPending
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
              Nouvelle observation
            </Text>

            <Text
              style={
                styles.subtitle
              }
            >
              Notez ce que vous constatez sur la culture.
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
            <FileText
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
              Décrivez précisément ce que vous voyez.
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
            placeholder="Ex. feuilles jaunissantes, présence d'insectes, manque d'eau..."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={7}
            textAlignVertical="top"
            editable={
              !createMutation.isPending
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
              Décrivez les symptômes, leur emplacement ou leur intensité.
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
              Décrivez ce qui est visible sur la culture :
              feuilles, tiges, fruits, parasites, humidité
              ou évolution récente.
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
              Quand cette observation a-t-elle été faite ?
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
                !createMutation.isPending
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

        <TouchableOpacity
          style={[
            styles.saveButton,
            createMutation.isPending &&
              styles.saveButtonDisabled,
          ]}
          onPress={
            enregistrer
          }
          disabled={
            createMutation.isPending
          }
          activeOpacity={0.85}
        >
          {createMutation.isPending ? (
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
                  Enregistrer l'observation
                </Text>

                <Text
                  style={
                    styles.saveSubtext
                  }
                >
                  Sauvegarder la note terrain
                </Text>
              </View>
            </>
          )}
        </TouchableOpacity>

        <Text
          style={
            styles.bottomHint
          }
        >
          Vous pourrez retrouver cette observation
          dans le suivi de la culture.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
  // CONTEXTE CULTURE
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
  // SECTION HEADER
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
  // SAVE
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

  bottomHint: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 10,
    lineHeight: 15,
    color: '#9CA3AF',
  },
});