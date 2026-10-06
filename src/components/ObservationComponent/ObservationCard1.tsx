/**
 * Section `ObservationCard1` extraite de `ObservationCard`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { Badge } from '@/components/CommonComponent/Badge';
import { Card } from '@/components/CommonComponent/Card';
import { StatutCulture, formaterDate, getBadgeVariant, nomStatut } from '@/screens/ObservationScreen/ObservationListScreen.helpers';
import { styles } from '@/screens/ObservationScreen/ObservationListScreen.styles';

import { colors } from '@/theme';
import { getMediaUrl } from '@/utils/mediaUrl';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { CalendarDays, Camera, ChevronRight, Clock3, FileText, MapPin, Pencil, Plus, Sprout, Trash2, X } from 'lucide-react-native';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import type {
  Observation,
  PhotoObservation,
} from '@/types';
type Props = {
  choisirPhoto: () => void;
  confirmerSuppressionPhoto: (photo: PhotoObservation) => void;
  cultureNom: string;
  deletePhoto: UseMutationResult<void, Error, string, unknown>;
  modificationAutorisee: boolean;
  observation: Observation;
  onModifier: (observation: Observation) => void;
  onSupprimer: (observation: Observation) => void;
  parcelleNom: string;
  photoEnCours: boolean;
  /** Libellé de l'étape d'envoi en cours ('' si aucun envoi). */
  libelleEnvoi: string;
  photos: NoInfer<PhotoObservation[]>;
  photosQuery: UseQueryResult<NoInfer<PhotoObservation[]>, Error>;
  statutCulture: StatutCulture | undefined;
};

export function ObservationCard1({
  choisirPhoto,
  confirmerSuppressionPhoto,
  cultureNom,
  deletePhoto,
  modificationAutorisee,
  observation,
  onModifier,
  onSupprimer,
  parcelleNom,
  photoEnCours,
  libelleEnvoi,
  photos,
  photosQuery,
  statutCulture,
}: Props) {
  return (
<Card
          style={
            styles.observationCard
          }
        >
          {/* HEADER */}

          <View
            style={
              styles.observationHeader
            }
          >
            <View
              style={
                styles.observationHeaderLeft
              }
            >
              <View
                style={
                  styles.observationIcon
                }
              >
                <Sprout
                  size={21}
                  color={
                    colors.primary[600]
                  }
                  strokeWidth={2}
                />
              </View>

              <View
                style={
                  styles.observationHeaderContent
                }
              >
                <Text
                  numberOfLines={1}
                  style={
                    styles.observationCultureName
                  }
                >
                  {cultureNom}
                </Text>

                <View
                  style={
                    styles.observationSubtitleRow
                  }
                >
                  <MapPin
                    size={11}
                    color={
                      colors.neutral[500]
                    }
                    strokeWidth={2}
                  />

                  <Text
                    numberOfLines={1}
                    style={
                      styles.observationSubtitle
                    }
                  >
                    {parcelleNom}
                  </Text>
                </View>
              </View>
            </View>

            <View
              style={
                styles.statusContainer
              }
            >
              <Badge
                label={
                  nomStatut(
                    statutCulture,
                  )
                }
                variant={
                  getBadgeVariant(
                    statutCulture,
                  )
                }
                dot
              />
            </View>
          </View>

          {/* SEPARATEUR */}

          <View
            style={
              styles.cardSeparator
            }
          />

          {/* DATE */}

          <View
            style={
              styles.observationDateCard
            }
          >
            <View
              style={
                styles.infoCardIcon
              }
            >
              <CalendarDays
                size={16}
                color={
                  colors.primary[600]
                }
                strokeWidth={2}
              />
            </View>

            <View
              style={
                styles.infoCardContent
              }
            >
              <Text
                style={
                  styles.infoCardLabel
                }
              >
                OBSERVATION
              </Text>

              <Text
                style={
                  styles.infoCardValue
                }
              >
                {formaterDate(
                  observation.date,
                )}
              </Text>
            </View>
          </View>

          {/* DESCRIPTION */}

          <View
            style={
              styles.descriptionCard
            }
          >
            <View
              style={
                styles.descriptionHeader
              }
            >
              <View
                style={
                  styles.infoCardIcon
                }
              >
                <FileText
                  size={15}
                  color={
                    colors.primary[600]
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  styles.infoCardLabel
                }
              >
                DESCRIPTION
              </Text>
            </View>

            <Text
              style={
                styles.observationDescription
              }
            >
              {observation.description ||
                'Aucune description.'}
            </Text>
          </View>

          {/* PHOTOS */}

          <View
            style={
              styles.photoSection
            }
          >
            <View
              style={
                styles.photoTitleRow
              }
            >
              <View
                style={
                  styles.infoCardIcon
                }
              >
                <Camera
                  size={15}
                  color={
                    colors.primary[600]
                  }
                  strokeWidth={2}
                />
              </View>

              <Text
                style={
                  styles.photoTitle
                }
              >
                PHOTOS
              </Text>

              <Text
                style={
                  styles.photoCount
                }
              >
                {photos.length}
              </Text>
            </View>

            {photosQuery.isLoading ? (
              <View
                style={
                  styles.photoLoading
                }
              >
                <ActivityIndicator
                  size="small"
                  color={
                    colors.primary[600]
                  }
                />

                <Text
                  style={
                    styles.photoLoadingText
                  }
                >
                  Chargement des photos...
                </Text>
              </View>
            ) : (
              <>
                {photos.length === 0 ? (
                  <Text
                    style={
                      styles.noPhotoText
                    }
                  >
                    Aucune photo.
                  </Text>
                ) : null}

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={
                    false
                  }
                  contentContainerStyle={
                    styles.photoList
                  }
                >
                  {photos.map(
                    photo => (
                      <View
                        key={
                          photo.id
                        }
                        style={
                          styles.photoContainer
                        }
                      >
                        <Image
                          source={{
                            uri: getMediaUrl(
                              photo.url,
                            ),
                          }}
                          style={
                            styles.photo
                          }
                          resizeMode="cover"
                        />

                        {modificationAutorisee ? (
                          <TouchableOpacity
                            accessibilityRole="button"
                            accessibilityLabel="Supprimer la photo"
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            style={
                              styles.deletePhotoButton
                            }
                            onPress={() =>
                              confirmerSuppressionPhoto(
                                photo,
                              )
                            }
                            disabled={
                              deletePhoto.isPending
                            }
                          >
                            <X
                              size={15}
                              color="#FFFFFF"
                              strokeWidth={
                                2.8
                              }
                            />
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    ),
                  )}

                  {modificationAutorisee ? (
                    <TouchableOpacity
                      accessibilityRole="button"
                      accessibilityLabel="Ajouter une photo"
                      style={
                        styles.photoAddTile
                      }
                      onPress={
                        choisirPhoto
                      }
                      disabled={
                        photoEnCours
                      }
                      activeOpacity={
                        0.8
                      }
                    >
                      {photoEnCours ? (
                        <ActivityIndicator
                          size="small"
                          color={
                            colors.primary[600]
                          }
                        />
                      ) : (
                        <View
                          style={
                            styles.photoAddIcon
                          }
                        >
                          <Plus
                            size={28}
                            color={
                              colors.primary[600]
                            }
                            strokeWidth={
                              2.2
                            }
                          />
                        </View>
                      )}
                    </TouchableOpacity>
                  ) : null}
                </ScrollView>
              </>
            )}

            {libelleEnvoi ? (
              <View
                style={styles.envoiPill}
                accessibilityRole="progressbar"
                accessibilityLabel={libelleEnvoi}
              >
                <ActivityIndicator
                  size="small"
                  color={colors.primary[700]}
                />
                <Text style={styles.envoiPillText}>
                  {libelleEnvoi}
                </Text>
              </View>
            ) : null}
          </View>

          {/* FOOTER */}

          <View
            style={
              styles.cardFooter
            }
          >
            <View
              style={
                styles.modifiedInfo
              }
            >
              <Clock3
                size={14}
                color={
                  colors.neutral[400]
                }
                strokeWidth={1.9}
              />

              <Text
                style={
                  styles.modifiedText
                }
                numberOfLines={1}
              >
                Enregistrée le{' '}
                {
                  formaterDate(
                    observation.date,
                  )
                }
              </Text>
            </View>

            <View
              style={
                styles.detailsButton
              }
            >
              <Text
                style={
                  styles.detailsButtonText
              }
              >
                Détails
              </Text>

              <ChevronRight
                size={16}
                color={
                  colors.primary[700]
                }
                strokeWidth={2.2}
              />
            </View>
          </View>

          {/* ACTIONS */}

          {modificationAutorisee ? (
            <View
              style={
                styles.actionButtons
              }
            >
              <TouchableOpacity
                style={
                  styles.editButton
                }
                onPress={() =>
                  onModifier(
                    observation,
                  )
                }
                activeOpacity={0.8}
              >
                <Pencil
                  size={16}
                  color="#166534"
                  strokeWidth={2.1}
                />

                <Text
                  style={
                    styles.editButtonText
                  }
                >
                  Modifier
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  styles.deleteButton
                }
                onPress={() =>
                  onSupprimer(
                    observation,
                  )
                }
                activeOpacity={0.8}
              >
                <Trash2
                  size={16}
                  color="#DC2626"
                  strokeWidth={2.1}
                />

                <Text
                  style={
                    styles.deleteButtonText
                  }
                >
                  Supprimer
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View
              style={
                styles.readOnlyFooter
              }
            >
              <Text
                style={
                  styles.readOnlyFooterText
              }
              >
                Lecture seule
              </Text>
            </View>
          )}
        </Card>
  );
}
