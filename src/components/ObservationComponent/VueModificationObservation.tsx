import { formaterDate } from '@/screens/ObservationScreen/ObservationEditScreen.helpers';
import { DateTimeInput } from '@/components/CommonComponent/DateTimeInput';
import { styles } from '@/screens/ObservationScreen/ObservationEditScreen.styles';
import type { Observation, UpdateObservationPayload } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, Check, FileText, MapPin, Pencil, Sprout } from 'lucide-react-native';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  cultureNom: string;
  date: string;
  description: string;
  enregistrer: () => Promise<void>;
  modificationAutorisee: boolean;
  observation: Observation | undefined;
  parcelleNom: string;
  setDate: (valeur: string) => void;
  setDescription: (valeur: string) => void;
  statutLabel: "PLANIFIÉE" | "EN COURS" | "RÉCOLTÉE" | "ABANDONNÉE" | "SUPPRIMÉE";
  updateMutation: UseMutationResult<Observation, Error, { id: string; cultureId: string; body: UpdateObservationPayload; }, unknown>;
};

export function VueModificationObservation({
  cultureNom,
  date,
  description,
  enregistrer,
  modificationAutorisee,
  observation,
  parcelleNom,
  setDate,
  setDescription,
  statutLabel,
  updateMutation,
}: Props) {
  if (!observation) return null;
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
                Modifier l&apos;observation
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
                Moment de l&apos;observation
              </Text>

              <Text
                style={
                  styles.sectionSubtitle
                }
              >
                Ajustez la date si l&apos;observation a été saisie plus tard.
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
                DATE DE L&apos;OBSERVATION
              </Text>

              <DateTimeInput
                value={date}
                onChange={setDate}
                disabled={modificationAutorisee &&
                  updateMutation.isPending}
                placeholder="Choisir la date et l’heure"
                hint="Enregistré au format ISO-8601 (heure locale convertie en instant)"
              />
            </View>
          </View>


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
