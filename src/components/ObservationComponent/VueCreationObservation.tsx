/**
 * Section `VueCreationObservation` extraite de `ObservationCreateScreen`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { DateTimeInput } from '@/components/CommonComponent/DateTimeInput';
import { styles } from '@/screens/ObservationScreen/ObservationCreateScreen.styles';
import type { ObservationPayload, Observation } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, Check, FileText, MapPin, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  createMutation: UseMutationResult<Observation, Error, { cultureId: string; body: ObservationPayload; }, unknown>;
  cultureNom: string;
  date: string;
  description: string;
  enregistrer: () => Promise<void>;
  parcelleNom: string;
  setDate: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  statutLabel: "PLANIFIÉE" | "EN COURS" | "RÉCOLTÉE" | "ABANDONNÉE" | "SUPPRIMÉE";
};

export function VueCreationObservation({
  createMutation,
  cultureNom,
  date,
  description,
  enregistrer,
  parcelleNom,
  setDate,
  setDescription,
  statutLabel,
}: Props) {
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
                Moment de l&apos;observation
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
                DATE DE L&apos;OBSERVATION
              </Text>

              <DateTimeInput
                value={date}
                onChange={setDate}
                disabled={createMutation.isPending}
                placeholder="Choisir la date et l’heure"
                hint="Enregistré au format ISO-8601 (heure locale convertie en instant)"
              />
            </View>
          </View>


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
                    Enregistrer l&apos;observation
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
