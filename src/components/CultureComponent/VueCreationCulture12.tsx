/**
 * Section `VueCreationCulture12` extraite de `VueCreationCulture1`.
 *
 * Le rendu est repris à l’identique : seules les valeurs et les actions
 * du composant parent sont reçues en props, ce qui évite de faire
 * transiter toute la logique de l’écran dans un seul fichier.
 */
import { CultureCheckItem } from '@/components/CultureComponent/CultureCheckItem';
import { ReviewRow } from '@/components/CultureComponent/ReviewRow';
import { styles } from '@/screens/CultureScreen/CultureCreateScreen.styles';
import type { CulturePayload, Culture } from '@/types';
import { colors } from '@/theme';
import type { UseMutationResult } from '@tanstack/react-query';
import { CalendarDays, CircleCheck, FileText, Layers, MapPinned, Sprout } from 'lucide-react-native';
import type { Dispatch, SetStateAction } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  createCulture: UseMutationResult<Culture, Error, { parcelleId: string; body: CulturePayload; }, unknown>;
  datePlantation: Date | null;
  datePrevueRecolte: Date | null;
  demanderDelimitation: boolean;
  description: string;
  enregistrer: () => void;
  formaterDate: (date: Date | null) => string;
  nom: string;
  parcelleId: string;
  parcelleNom: string | undefined;
  setCurrentStep: Dispatch<SetStateAction<number>>;
  setDemanderDelimitation: Dispatch<SetStateAction<boolean>>;
  stade: string;
  type: string;
  variete: string;
};

export function VueCreationCulture12({
  createCulture,
  datePlantation,
  datePrevueRecolte,
  demanderDelimitation,
  description,
  enregistrer,
  formaterDate,
  nom,
  parcelleId,
  parcelleNom,
  setCurrentStep,
  setDemanderDelimitation,
  stade,
  type,
  variete,
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
                        avant d&apos;enregistrer votre
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
                      cette culture à l&apos;intérieur de
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
                          Après l&apos;enregistrement,
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

                    <CultureCheckItem
                      label="Nom de la culture renseigné"
                      checked={!!nom.trim()}
                    />

                    <CultureCheckItem
                      label="Parcelle associée"
                      checked={!!parcelleId}
                    />

                    <CultureCheckItem
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

                    <CultureCheckItem
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
  );
}
