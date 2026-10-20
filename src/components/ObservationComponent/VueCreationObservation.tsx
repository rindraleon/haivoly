import { DateTimeInput } from '@/components/CommonComponent/DateTimeInput';
import { i18n } from '@/i18n/instance';
import {
  PhotosSelection,
  type PhotoBrouillon,
} from '@/components/CommonComponent/PhotosSelection';
import { useStylesCreationObservation } from '@/screens/ObservationScreen/ObservationCreateScreen.styles';
import { useTheme } from '@/hooks/common/useTheme';
import type { ObservationPayload, Observation } from '@/types';
import type { UseMutationResult } from '@tanstack/react-query';
import { router } from 'expo-router';
import { ArrowLeft, CalendarDays, Check, FileText, MapPin, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Props = {
  createMutation: UseMutationResult<Observation, Error, { cultureId: string; body: ObservationPayload; }, unknown>;
  cultureNom: string;
  /** Photos mises en attente, envoyées après création de l'observation. */
  photos?: PhotoBrouillon[];
  onChangePhotos?: (photos: PhotoBrouillon[]) => void;
  envoiPhotosEnCours?: boolean;
  date: string;
  description: string;
  enregistrer: () => Promise<void>;
  parcelleNom: string;
  setDate: Dispatch<SetStateAction<string>>;
  setDescription: Dispatch<SetStateAction<string>>;
  statutLabel: string;
};

export function VueCreationObservation({
  createMutation,
  cultureNom,
  photos,
  onChangePhotos,
  envoiPhotosEnCours,
  date,
  description,
  enregistrer,
  parcelleNom,
  setDate,
  setDescription,
  statutLabel,
}: Props) {
  const styles = useStylesCreationObservation();
  const { jetons } = useTheme();
  const saisieVerrouillee = createMutation.isPending || !!envoiPhotosEnCours;
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
          {}

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
              disabled={saisieVerrouillee}
              activeOpacity={0.8}
            >
              <ArrowLeft
                size={21}
                color={jetons.texte.principal}
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

          {}

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
                  color={jetons.primaire.fonce}
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
                    i18n.t('libelles.culture')}
                </Text>

                <View
                  style={
                    styles.parcelleLine
                  }
                >
                  <MapPin
                    size={14}
                    color={jetons.texte.secondaire}
                    strokeWidth={2}
                  />

                  <Text
                    style={
                      styles.parcelleText
                    }
                    numberOfLines={1}
                  >
                    {parcelleNom ||
                      i18n.t('domaine.parcelleNonRenseignee')}
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

          {}

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
                color={jetons.primaire.fonce}
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

          {}

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
                  color={jetons.primaire.fonce}
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
              placeholder={i18n.t('divers.observationPlaceholder')}
              placeholderTextColor={jetons.texte.discret}
              multiline
              numberOfLines={7}
              textAlignVertical="top"
              editable={!saisieVerrouillee}
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

          {}

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
                color={jetons.primaire.fonce}
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

          {}

          {/* Photos : sélection en attente, envoyées après l'enregistrement */}
          {onChangePhotos ? (
            <PhotosSelection
              photos={photos ?? []}
              onChange={onChangePhotos}
              disabled={saisieVerrouillee}
            />
          ) : null}

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
                color={jetons.primaire.fonce}
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
                color={jetons.primaire.fonce}
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
                disabled={saisieVerrouillee}
                placeholder={i18n.t('libelles.choisirDateHeure')}
                hint={i18n.t('observations.hintHorodatage')}
              />
            </View>
          </View>


          {}

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
            {saisieVerrouillee ? (
              <>
                <ActivityIndicator
                  size="small"
                  color={jetons.primaire.contraste}
                />

                <Text
                  style={
                    styles.saveText
                  }
                >
                  {envoiPhotosEnCours
                    ? i18n.t('photos.envoiPhotosEnCours')
                    : 'Enregistrement...'}
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
                    color={jetons.primaire.contraste}
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
