/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  useEffect,
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
  router,
  useLocalSearchParams,
} from 'expo-router';

import { Picker } from '@react-native-picker/picker';

import {
  Check,
  ChevronRight,
  CircleCheck,
  FileText,
  Layers,
  LocateFixed,
  MapPinned,
  Navigation,
  Ruler,
  Sprout,
} from 'lucide-react-native';

import { addPointsGPS } from '@/api/parcelles';

import { useCreateParcelle } from '@/hooks/useParcelles';

import {
  getCurrentLocation,
} from '@/services/location';

import {
  getIsOnline,
  useNetwork,
} from '@/hooks/useNetwork';

import {
  enqueue,
  getPendingCount,
} from '@/features/sync/services/queue';

import { OfflineBanner } from '@/features/offline/components/OfflineBanner';

import { colors } from '@/design/tokens';

/* ============================================================
   TYPES
============================================================ */

interface GPSPoint {
  id?: string;
  latitude: number;
  longitude: number;
  ordre: number;
  parcelleId?: string;
}

/* ============================================================
   HELPERS
============================================================ */

const parseGPSPoints = (
  value?: string,
): GPSPoint[] => {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(value);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    return parsed
      .map(
        (
          point: any,
          index: number,
        ) => ({
          id: point?.id,
          latitude:
            Number(
              point?.latitude,
            ),
          longitude:
            Number(
              point?.longitude,
            ),
          ordre:
            Number(
              point?.ordre ??
                index + 1,
            ),
          parcelleId:
            point?.parcelleId,
        }),
      )
      .filter(
        (
          point: GPSPoint,
        ) =>
          Number.isFinite(
            point.latitude,
          ) &&
          Number.isFinite(
            point.longitude,
          ),
      );
  } catch (
    error
  ) {
    console.log(
      'ERREUR PARSING POINTS GPS:',
      error,
    );

    return [];
  }
};

const formatCoordinates = (
  latitude: string,
  longitude: string,
) => {
  if (
    !latitude ||
    !longitude
  ) {
    return 'Position non renseignée';
  }

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lng)
  ) {
    return 'Position non valide';
  }

  return `${lat.toFixed(
    5,
  )}, ${lng.toFixed(5)}`;
};

const formatAreaHa = (
  superficie: string,
) => {
  if (!superficie) {
    return '—';
  }

  const value =
    Number(superficie);

  if (
    !Number.isFinite(value)
  ) {
    return '—';
  }

  return `${(
    value / 10000
  ).toFixed(2)} ha`;
};

/* ============================================================
   SCREEN
============================================================ */

export default function AjouterParcelleScreen() {
  /* ==========================================================
     PARAMÈTRES
  ========================================================== */

  const params =
    useLocalSearchParams<{
      nom?: string;
      description?: string;
      typeSol?: string;
      latitude?: string;
      longitude?: string;
      superficie?: string;
      pointsGPS?: string;
    }>();

  /* ==========================================================
     ÉTATS FORMULAIRE
  ========================================================== */

  const [
    nom,
    setNom,
  ] = useState(
    params.nom ?? '',
  );

  const [
    description,
    setDescription,
  ] = useState(
    params.description ?? '',
  );

  const [
    superficie,
    setSuperficie,
  ] = useState(
    params.superficie ?? '',
  );

  const [
    typeSol,
    setTypeSol,
  ] = useState(
    params.typeSol ?? '',
  );

  const [
    latitude,
    setLatitude,
  ] = useState(
    params.latitude ?? '',
  );

  const [
    longitude,
    setLongitude,
  ] = useState(
    params.longitude ?? '',
  );

  const [
    gpsAccuracy,
    setGpsAccuracy,
  ] = useState<
    number | null
  >(null);

  const [
    currentStep,
    setCurrentStep,
  ] = useState(1);

  /* ==========================================================
     POINTS GPS
  ========================================================== */

  const [
    pointsGPS,
    setPointsGPS,
  ] = useState<GPSPoint[]>(
    () =>
      parseGPSPoints(
        params.pointsGPS,
      ),
  );

  /* ==========================================================
     MUTATION / OFFLINE
  ========================================================== */

  const createMutation =
    useCreateParcelle();

  const {
    isOnline,
  } = useNetwork();

  const [
    pendingCount,
    setPendingCount,
  ] = useState(0);

  /* ==========================================================
     SYNCHRONISATION PARAMÈTRES
  ========================================================== */

  useEffect(() => {
    if (
      params.nom !==
      undefined
    ) {
      setNom(
        params.nom,
      );
    }

    if (
      params.description !==
      undefined
    ) {
      setDescription(
        params.description,
      );
    }

    if (
      params.typeSol !==
      undefined
    ) {
      setTypeSol(
        params.typeSol,
      );
    }

    if (
      params.latitude !==
      undefined
    ) {
      setLatitude(
        params.latitude,
      );
    }

    if (
      params.longitude !==
      undefined
    ) {
      setLongitude(
        params.longitude,
      );
    }

    if (
      params.superficie !==
      undefined
    ) {
      setSuperficie(
        params.superficie,
      );
    }

    if (
      params.pointsGPS !==
      undefined
    ) {
      const parsed =
        parseGPSPoints(
          params.pointsGPS,
        );

      setPointsGPS(
        parsed,
      );

      /*
       * Lorsque l'utilisateur revient
       * de l'écran de délimitation,
       * on l'amène directement à
       * l'étape localisation.
       */
      setCurrentStep(2);
    }
  }, [
    params.nom,
    params.description,
    params.typeSol,
    params.latitude,
    params.longitude,
    params.superficie,
    params.pointsGPS,
  ]);

  /* ==========================================================
     PENDING COUNT
  ========================================================== */

  useEffect(() => {
    const refreshPending =
      async () => {
        try {
          const count =
            await getPendingCount();

          setPendingCount(
            count,
          );
        } catch (
          error
        ) {
          console.log(
            'PENDING COUNT ERROR:',
            error,
          );
        }
      };

    refreshPending();

    const id =
      setInterval(
        refreshPending,
        3000,
      );

    return () =>
      clearInterval(id);
  }, []);

  /* ==========================================================
     GPS
  ========================================================== */

  const handleGetLocation =
    async () => {
      try {
        const position =
          await getCurrentLocation();

        setLatitude(
          position.latitude.toString(),
        );

        setLongitude(
          position.longitude.toString(),
        );

        setGpsAccuracy(
          position.accuracy ??
            null,
        );

        Alert.alert(
          'Position GPS récupérée',
          `Latitude : ${position.latitude.toFixed(
            6,
          )}
Longitude : ${position.longitude.toFixed(
            6,
          )}
Précision : ${
            position.accuracy !==
            undefined
              ? `${position.accuracy.toFixed(
                  1,
                )} m`
              : 'inconnue'
          }`,
        );
      } catch (
        error: any
      ) {
        console.log(
          'GPS ERROR:',
          error,
        );

        Alert.alert(
          'Erreur GPS',
          error?.message ||
            'Impossible de récupérer votre position.',
        );
      }
    };

  /* ==========================================================
     DÉLIMITATION
  ========================================================== */

  const handleDelimiterParcelle =
    () => {
      router.push({
        pathname:
          '/delimiter-parcelle',

        params: {
          nom,
          description,
          typeSol,
          latitude,
          longitude,
          superficie,
          pointsGPS:
            JSON.stringify(
              pointsGPS,
            ),
        },
      } as any);
    };

  /* ==========================================================
     VALIDATION ÉTAPE 1
  ========================================================== */

  const goToStep2 =
    () => {
      if (
        !nom.trim()
      ) {
        Alert.alert(
          'Nom obligatoire',
          'Veuillez saisir le nom de la parcelle.',
        );

        return;
      }

      setCurrentStep(2);
    };

  /* ==========================================================
     VALIDATION ÉTAPE 2
  ========================================================== */

  const goToStep3 =
    () => {
      setCurrentStep(3);
    };

  /* ==========================================================
     RETOUR ÉTAPE
  ========================================================== */

  const goBackStep =
    () => {
      if (
        currentStep === 1
      ) {
        router.back();
        return;
      }

      setCurrentStep(
        currentStep - 1,
      );
    };

  /* ==========================================================
     CRÉATION
  ========================================================== */

  const handleCreate =
    async () => {
      if (
        !nom.trim()
      ) {
        Alert.alert(
          'Champ obligatoire',
          'Veuillez saisir le nom de la parcelle.',
        );

        setCurrentStep(1);

        return;
      }

      const online =
        await getIsOnline();

      /* =====================================================
         OFFLINE
      ===================================================== */

      if (!online) {
        try {
          await enqueue({
            actionType:
              'CREATE_PARCELLE',

            entityType:
              'PARCELLE',

            payload: {
              nom:
                nom.trim(),

              description:
                description.trim() ||
                undefined,

              superficie:
                superficie
                  ? Number(
                      superficie,
                    )
                  : undefined,

              typeSol:
                typeSol.trim() ||
                undefined,

              latitude:
                latitude
                  ? Number(
                      latitude,
                    )
                  : undefined,

              longitude:
                longitude
                  ? Number(
                      longitude,
                    )
                  : undefined,

              pointsGPS,
            },
          });

          Alert.alert(
            'Parcelle enregistrée',
            'Vous êtes hors connexion. La parcelle a été enregistrée localement et sera synchronisée automatiquement.',
            [
              {
                text:
                  'OK',

                onPress:
                  () =>
                    router.replace(
                      '/(app)/(parcelles)/parcelles' as any,
                    ),
              },
            ],
          );
        } catch (
          error
        ) {
          console.log(
            'OFFLINE CREATE ERROR:',
            error,
          );

          Alert.alert(
            'Erreur',
            'Impossible d’enregistrer la parcelle localement.',
          );
        }

        return;
      }

      /* =====================================================
         SUPERFICIE
      ===================================================== */

      const superficieNumber =
        superficie
          ? Number(
              superficie,
            )
          : undefined;

      if (
        superficie &&
        Number.isNaN(
          superficieNumber,
        )
      ) {
        Alert.alert(
          'Superficie invalide',
          'La superficie doit être un nombre.',
        );

        setCurrentStep(1);

        return;
      }

      /* =====================================================
         CREATE
      ===================================================== */

      createMutation.mutate(
        {
          nom:
            nom.trim(),

          description:
            description.trim() ||
            undefined,

          superficie:
            superficieNumber,

          typeSol:
            typeSol.trim() ||
            undefined,
        },

        {
          onSuccess:
            async (
              parcelle,
            ) => {
              try {
                console.log(
                  'PARCELLE CREEE:',
                  parcelle,
                );

                if (
                  pointsGPS.length >=
                  3
                ) {
                  const pointsAEnvoyer =
                    pointsGPS.map(
                      (
                        point,
                      ) => ({
                        latitude:
                          point.latitude,

                        longitude:
                          point.longitude,

                        ordre:
                          point.ordre,
                      }),
                    );

                  await addPointsGPS(
                    parcelle.id,
                    pointsAEnvoyer,
                  );
                }

                Alert.alert(
                  'Parcelle créée',
                  pointsGPS.length >=
                    3
                    ? 'La parcelle et sa délimitation GPS ont été enregistrées.'
                    : 'La parcelle a été enregistrée.',
                  [
                    {
                      text:
                        'OK',

                      onPress:
                        () =>
                          router.replace(
                            '/parcelles',
                          ),
                    },
                  ],
                );
              } catch (
                error: any
              ) {
                console.log(
                  'ERREUR ENREGISTREMENT POINTS GPS:',
                  error?.response
                    ?.data ||
                    error,
                );

                Alert.alert(
                  'Parcelle créée',
                  'La parcelle a été créée, mais les points GPS n’ont pas pu être enregistrés.',
                  [
                    {
                      text:
                        'OK',

                      onPress:
                        () =>
                          router.replace(
                            '/parcelles',
                          ),
                    },
                  ],
                );
              }
            },

          onError:
            (
              error: any,
            ) => {
              console.log(
                'CREATE PARCELLE ERROR:',
                error?.response
                  ?.data,
              );

              const message =
                error?.response
                  ?.data
                  ?.message ||
                'Impossible de créer la parcelle.';

              Alert.alert(
                'Erreur',
                String(
                  message,
                ),
              );
            },
        },
      );
    };

  /* ==========================================================
     DONNÉES POUR LE REVIEW
  ========================================================== */

  const hasPosition =
    !!latitude &&
    !!longitude;

  const hasDelimitation =
    pointsGPS.length >=
    3;

  const stepLabels = [
    'Informations',
    'Position',
    'Vérification',
  ];

  /* ==========================================================
     RENDER
  ========================================================== */

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
      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={
          styles.header
        }
      >
        <TouchableOpacity
          activeOpacity={
            0.75
          }
          onPress={
            goBackStep
          }
          style={
            styles.headerButton
          }
        >
          <Text
            style={
              styles.backArrow
            }
          >
            ‹
          </Text>
        </TouchableOpacity>

        <View
          style={
            styles.headerContent
          }
        >
          <Text
            style={
              styles.headerTitle
            }
          >
            Nouvelle parcelle
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Étape {currentStep} sur 3
          </Text>
        </View>

        <View
          style={
            styles.headerLeaf
          }
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
            OFFLINE
        ================================================== */}

        <OfflineBanner
          isOnline={
            isOnline ?? true
          }
          pendingCount={
            pendingCount
          }
          isSyncing={
            false
          }
        />

        {/* ==================================================
            STEPPER
        ================================================== */}

        <View
          style={
            styles.stepperCard
          }
        >
          <View
            style={
              styles.stepperLine
            }
          />

          <View
            style={
              styles.stepper
            }
          >
            {stepLabels.map(
              (
                label,
                index,
              ) => {
                const step =
                  index + 1;

                const completed =
                  currentStep >
                  step;

                const active =
                  currentStep ===
                  step;

                return (
                  <View
                    key={
                      label
                    }
                    style={
                      styles.step
                    }
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
                          size={
                            14
                          }
                          color="#FFFFFF"
                          strokeWidth={
                            3
                          }
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
            style={
              styles.stepContent
            }
          >
            {/* INTRO */}

            <View
              style={
                styles.intro
              }
            >
              <View
                style={
                  styles.introIcon
                }
              >
                <Sprout
                  size={23}
                  color={
                    colors.primary[700]
                  }
                />
              </View>

              <View
                style={
                  styles.introText
                }
              >
                <Text
                  style={
                    styles.introTitle
                  }
                >
                  Informations du terrain
                </Text>

                <Text
                  style={
                    styles.introDescription
                  }
                >
                  Commencez par renseigner
                  les informations principales
                  de votre parcelle.
                </Text>
              </View>
            </View>

            {/* NOM */}

            <View
              style={
                styles.formGroup
              }
            >
              <View
                style={
                  styles.labelRow
                }
              >
                <FileText
                  size={15}
                  color={
                    colors.primary[700]
                  }
                />

                <Text
                  style={
                    styles.label
                  }
                >
                  Nom de la parcelle
                </Text>

                <Text
                  style={
                    styles.required
                  }
                >
                  *
                </Text>
              </View>

              <TextInput
                style={
                  styles.input
                }
                placeholder="Ex. : Parcelle Nord"
                placeholderTextColor="#A0AAA2"
                value={
                  nom
                }
                onChangeText={
                  setNom
                }
                autoCapitalize="sentences"
              />

              <Text
                style={
                  styles.helperText
                }
              >
                Donnez un nom facile à reconnaître.
              </Text>
            </View>

            {/* DESCRIPTION */}

            <View
              style={
                styles.formGroup
              }
            >
              <View
                style={
                  styles.labelRow
                }
              >
                <FileText
                  size={15}
                  color="#758178"
                />

                <Text
                  style={
                    styles.label
                  }
                >
                  Description
                </Text>
              </View>

              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                ]}
                placeholder="Décrivez brièvement cette parcelle..."
                placeholderTextColor="#A0AAA2"
                value={
                  description
                }
                onChangeText={
                  setDescription
                }
                multiline
                textAlignVertical="top"
              />

              <Text
                style={
                  styles.helperText
                }
              >
                Une information utile pour
                retrouver facilement le terrain.
              </Text>
            </View>

            {/* SOL */}

            <View
              style={
                styles.formGroup
              }
            >
              <View
                style={
                  styles.labelRow
                }
              >
                <Layers
                  size={15}
                  color={
                    colors.primary[700]
                  }
                />

                <Text
                  style={
                    styles.label
                  }
                >
                  Type de sol
                </Text>
              </View>

              <View
                style={
                  styles.pickerCard
                }
              >
                <Picker
                  selectedValue={
                    typeSol
                  }
                  onValueChange={(
                    value,
                  ) =>
                    setTypeSol(
                      value,
                    )
                  }
                  style={
                    styles.picker
                  }
                >
                  <Picker.Item
                    label="Sélectionner un type de sol"
                    value=""
                    color="#9AA59C"
                  />

                  <Picker.Item
                    label="Argileux"
                    value="Argileux"
                  />

                  <Picker.Item
                    label="Sableux"
                    value="Sableux"
                  />

                  <Picker.Item
                    label="Limoneux"
                    value="Limoneux"
                  />

                  <Picker.Item
                    label="Argilo-limoneux"
                    value="Argilo-limoneux"
                  />

                  <Picker.Item
                    label="Humifère"
                    value="Humifère"
                  />

                  <Picker.Item
                    label="Latéritique"
                    value="Latéritique"
                  />

                  <Picker.Item
                    label="Rocheux"
                    value="Rocheux"
                  />
                </Picker>
              </View>
            </View>

            {/* SUPERFICIE */}

            <View
              style={
                styles.calculatedCard
              }
            >
              <View
                style={
                  styles.calculatedIcon
                }
              >
                <Ruler
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
                  Superficie
                </Text>

                <Text
                  style={
                    styles.calculatedValue
                  }
                >
                  {superficie
                    ? formatAreaHa(
                        superficie,
                      )
                    : 'Non calculée'}
                </Text>

                <Text
                  style={
                    styles.calculatedHint
                  }
                >
                  Calculée automatiquement
                  après la délimitation GPS.
                </Text>
              </View>
            </View>

            <ButtonNext
              label="Continuer"
              onPress={
                goToStep2
              }
            />
          </View>
        ) : null}

        {/* ==================================================
            ÉTAPE 2
        ================================================== */}

        {currentStep === 2 ? (
          <View
            style={
              styles.stepContent
            }
          >
            {/* INTRO */}

            <View
              style={
                styles.intro
              }
            >
              <View
                style={[
                  styles.introIcon,
                  styles.introIconBlue,
                ]}
              >
                <MapPinned
                  size={23}
                  color="#3D6E9D"
                />
              </View>

              <View
                style={
                  styles.introText
                }
              >
                <Text
                  style={
                    styles.introTitle
                  }
                >
                  Localiser la parcelle
                </Text>

                <Text
                  style={
                    styles.introDescription
                  }
                >
                  Positionnez votre terrain
                  et définissez son contour
                  avec le GPS.
                </Text>
              </View>
            </View>

            {/* POSITION */}

            <View
              style={
                styles.locationCard
              }
            >
              <View
                style={
                  styles.locationHeader
                }
              >
                <View
                  style={
                    styles.locationHeaderLeft
                  }
                >
                  <View
                    style={
                      styles.locationIcon
                    }
                  >
                    <Navigation
                      size={18}
                      color={
                        colors.primary[700]
                      }
                    />
                  </View>

                  <View>
                    <Text
                      style={
                        styles.locationTitle
                      }
                    >
                      Position actuelle
                    </Text>

                    <Text
                      style={
                        styles.locationSubtitle
                      }
                    >
                      Coordonnées GPS
                    </Text>
                  </View>
                </View>

                {hasPosition ? (
                  <CircleCheck
                    size={20}
                    color={
                      colors.primary[600]
                    }
                  />
                ) : null}
              </View>

              <View
                style={
                  styles.coordinatesBox
                }
              >
                <Text
                  style={
                    styles.coordinatesValue
                  }
                >
                  {formatCoordinates(
                    latitude,
                    longitude,
                  )}
                </Text>

                {gpsAccuracy !==
                null ? (
                  <Text
                    style={
                      styles.accuracyText
                    }
                  >
                    Précision estimée :{' '}
                    {gpsAccuracy.toFixed(
                      1,
                    )}{' '}
                    m
                  </Text>
                ) : null}
              </View>

              <TouchableOpacity
                activeOpacity={
                  0.78
                }
                style={
                  styles.gpsButton
                }
                onPress={
                  handleGetLocation
                }
              >
                <LocateFixed
                  size={18}
                  color="#FFFFFF"
                />

                <View
                  style={
                    styles.gpsButtonContent
                  }
                >
                  <Text
                    style={
                      styles.gpsButtonTitle
                    }
                  >
                    Utiliser ma position
                  </Text>

                  <Text
                    style={
                      styles.gpsButtonSubtitle
                    }
                  >
                    Récupérer le GPS du téléphone
                  </Text>
                </View>

                <ChevronRight
                  size={18}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
            </View>

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
                        pointsGPS.length >=
                        3
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
                      Délimitation GPS
                    </Text>

                    <Text
                      style={
                        styles.delimitationSubtitle
                      }
                    >
                      {pointsGPS.length >=
                      3
                        ? 'Parcelle correctement délimitée'
                        : 'Ajoutez au moins 3 points'}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.pointsBadge,

                    pointsGPS.length >=
                      3 &&
                      styles.pointsBadgeCompleted,
                  ]}
                >
                  <Text
                    style={[
                      styles.pointsBadgeText,

                      pointsGPS.length >=
                        3 &&
                        styles.pointsBadgeTextCompleted,
                    ]}
                  >
                    {pointsGPS.length}{' '}
                    pts
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                activeOpacity={
                  0.78
                }
                onPress={
                  handleDelimiterParcelle
                }
                style={
                  styles.delimiterButton
                }
              >
                <MapPinned
                  size={19}
                  color="#FFFFFF"
                />

                <View
                  style={
                    styles.delimiterButtonContent
                  }
                >
                  <Text
                    style={
                      styles.delimiterButtonTitle
                    }
                  >
                    {hasDelimitation
                      ? 'Modifier la délimitation'
                      : 'Délimiter la parcelle'}
                  </Text>

                  <Text
                    style={
                      styles.delimiterButtonSubtitle
                    }
                  >
                    Marquez les points autour
                    de votre terrain
                  </Text>
                </View>

                <ChevronRight
                  size={19}
                  color="#FFFFFF"
                />
              </TouchableOpacity>

              {hasDelimitation ? (
                <View
                  style={
                    styles.successRow
                  }
                >
                  <CircleCheck
                    size={15}
                    color={
                      colors.primary[700]
                    }
                  />

                  <Text
                    style={
                      styles.successText
                    }
                  >
                    {pointsGPS.length}{' '}
                    points GPS enregistrés
                  </Text>
                </View>
              ) : null}
            </View>

            {/* SUPERFICIE */}

            <View
              style={
                styles.areaPreview
              }
            >
              <View
                style={
                  styles.areaPreviewIcon
                }
              >
                <Ruler
                  size={18}
                  color={
                    colors.primary[700]
                  }
                />
              </View>

              <View
                style={
                  styles.areaPreviewContent
                }
              >
                <Text
                  style={
                    styles.areaPreviewLabel
                  }
                >
                  Superficie calculée
                </Text>

                <Text
                  style={
                    styles.areaPreviewValue
                  }
                >
                  {superficie
                    ? formatAreaHa(
                        superficie,
                      )
                    : 'En attente de la délimitation'}
                </Text>
              </View>
            </View>

            <ButtonNext
              label="Vérifier la parcelle"
              onPress={
                goToStep3
              }
            />
          </View>
        ) : null}

        {/* ==================================================
            ÉTAPE 3
        ================================================== */}

        {currentStep === 3 ? (
          <View
            style={
              styles.stepContent
            }
          >
            {/* INTRO */}

            <View
              style={
                styles.intro
              }
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
                style={
                  styles.introText
                }
              >
                <Text
                  style={
                    styles.introTitle
                  }
                >
                  Vérifier la parcelle
                </Text>

                <Text
                  style={
                    styles.introDescription
                  }
                >
                  Vérifiez les informations
                  avant d'enregistrer votre
                  parcelle.
                </Text>
              </View>
            </View>

            {/* PREVIEW */}

            <View
              style={
                styles.reviewCard
              }
            >
              <View
                style={
                  styles.reviewHeader
                }
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
                    style={
                      styles.reviewTitle
                    }
                  >
                    {nom.trim() ||
                      'Nouvelle parcelle'}
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

              {/* NOM */}

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

              {/* SOL */}

              <ReviewRow
                icon={
                  <Layers
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Type de sol"
                value={
                  typeSol ||
                  'Non renseigné'
                }
              />

              {/* SUPERFICIE */}

              <ReviewRow
                icon={
                  <Ruler
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Superficie"
                value={
                  superficie
                    ? formatAreaHa(
                        superficie,
                      )
                    : 'Non calculée'
                }
              />

              {/* GPS */}

              <ReviewRow
                icon={
                  <Navigation
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Position"
                value={
                  hasPosition
                    ? formatCoordinates(
                        latitude,
                        longitude,
                      )
                    : 'Non renseignée'
                }
              />

              {/* POINTS */}

              <ReviewRow
                icon={
                  <MapPinned
                    size={15}
                    color="#6D7A70"
                  />
                }
                label="Délimitation"
                value={
                  hasDelimitation
                    ? `${pointsGPS.length} points GPS`
                    : 'Non délimitée'
                }
                valueStyle={
                  hasDelimitation
                    ? styles.reviewSuccessValue
                    : undefined
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
                label="Nom de la parcelle renseigné"
                checked={
                  !!nom.trim()
                }
              />

              <CheckItem
                label="Type de sol sélectionné"
                checked={
                  !!typeSol
                }
              />

              <CheckItem
                label="Position GPS disponible"
                checked={
                  hasPosition
                }
              />

              <CheckItem
                label="Parcelle délimitée"
                checked={
                  hasDelimitation
                }
                last
              />
            </View>

            {/* INFORMATION */}

            <View
              style={
                styles.infoCard
              }
            >
              <View
                style={
                  styles.infoIcon
                }
              >
                <MapPinned
                  size={16}
                  color="#3D6E9D"
                />
              </View>

              <Text
                style={
                  styles.infoText
                }
              >
                La délimitation GPS est
                facultative pour créer la
                parcelle. Vous pourrez la
                compléter plus tard.
              </Text>
            </View>

            {/* ENREGISTRER */}

            <TouchableOpacity
              activeOpacity={
                0.8
              }
              style={[
                styles.saveButton,

                createMutation.isPending &&
                  styles.saveButtonDisabled,
              ]}
              onPress={
                handleCreate
              }
              disabled={
                createMutation.isPending
              }
            >
              {createMutation.isPending ? (
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
                      styles.saveButtonText
                    }
                  >
                    Enregistrer la parcelle
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* MODIFIER */}

            <TouchableOpacity
              activeOpacity={
                0.7
              }
              onPress={() =>
                setCurrentStep(
                  1,
                )
              }
              style={
                styles.editBeforeSave
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
            FOOTER
        ================================================== */}

        <View
          style={
            styles.footer
          }
        >
          <View
            style={
              styles.footerIcon
            }
          >
            <Sprout
              size={14}
              color={
                colors.primary[700]
              }
            />
          </View>

          <Text
            style={
              styles.footerText
            }
          >
            HaiVoly · Gestion agricole
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function ButtonNext({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={
        0.8
      }
      style={
        styles.nextButton
      }
      onPress={
        onPress
      }
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
      style={
        styles.reviewRow
      }
    >
      <View
        style={
          styles.reviewRowLeft
        }
      >
        <View
          style={
            styles.reviewRowIcon
          }
        >
          {icon}
        </View>

        <Text
          style={
            styles.reviewRowLabel
          }
        >
          {label}
        </Text>
      </View>

      <Text
        style={[
          styles.reviewRowValue,
          valueStyle,
        ]}
        numberOfLines={
          2
        }
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

/* ============================================================
   STYLES
============================================================ */

const styles =
  StyleSheet.create({

    /* ========================================================
       ROOT
    ======================================================== */

    container: {
      flex: 1,
      backgroundColor:
        '#DCEADB',
    },

    content: {
      paddingHorizontal:
        15,
      paddingTop:
        8,
      paddingBottom:
        35,
      gap:
        13,
    },

    /* ========================================================
       HEADER
    ======================================================== */

    header: {
      minHeight:
        67,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal:
        14,
      gap:
        10,
      backgroundColor:
        'rgba(220,234,219,0.97)',
      borderBottomWidth:
        1,
      borderBottomColor:
        'rgba(54,77,57,0.08)',
    },

    headerButton: {
      width:
        40,
      height:
        40,
      borderRadius:
        13,
      backgroundColor:
        'rgba(255,255,255,0.74)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.88)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    backArrow: {
      fontSize:
        31,
      lineHeight:
        31,
      color:
        '#1E3121',
      marginTop:
        -2,
      fontWeight:
        '400',
    },

    headerContent: {
      flex:
        1,
    },

    headerTitle: {
      fontSize:
        16,
      fontWeight:
        '800',
      color:
        '#19241B',
    },

    headerSubtitle: {
      marginTop:
        2,
      fontSize:
        10.5,
      color:
        '#748076',
      fontWeight:
        '600',
    },

    headerLeaf: {
      width:
        40,
      height:
        40,
      borderRadius:
        13,
      backgroundColor:
        '#E5F1E5',
      borderWidth:
        1,
      borderColor:
        '#CEE3CF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    /* ========================================================
       STEPPER
    ======================================================== */

    stepperCard: {
      minHeight:
        86,
      paddingHorizontal:
        10,
      paddingVertical:
        12,
      borderRadius:
        19,
      backgroundColor:
        'rgba(255,255,255,0.88)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.88)',
    },

    stepperLine: {
      position:
        'absolute',
      top:
        28,
      left:
        48,
      right:
        48,
      height:
        2,
      backgroundColor:
        '#E0E9E0',
    },

    stepper: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'flex-start',
    },

    step: {
      flex:
        1,
      alignItems:
        'center',
      gap:
        6,
    },

    stepCircle: {
      width:
        30,
      height:
        30,
      borderRadius:
        15,
      backgroundColor:
        '#E8EEE8',
      borderWidth:
        2,
      borderColor:
        '#DCE5DC',
      alignItems:
        'center',
      justifyContent:
        'center',
      zIndex:
        2,
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
      fontSize:
        11,
      fontWeight:
        '800',
      color:
        '#7D897F',
    },

    stepNumberActive: {
      color:
        '#FFFFFF',
    },

    stepLabel: {
      fontSize:
        9.5,
      color:
        '#89938A',
      fontWeight:
        '600',
      textAlign:
        'center',
    },

    stepLabelActive: {
      color:
        '#24482A',
      fontWeight:
        '800',
    },

    stepLabelCompleted: {
      color:
        colors.primary[700],
      fontWeight:
        '700',
    },

    /* ========================================================
       STEP CONTENT
    ======================================================== */

    stepContent: {
      gap:
        13,
    },

    intro: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        11,
      paddingHorizontal:
        2,
      paddingVertical:
        3,
    },

    introIcon: {
      width:
        45,
      height:
        45,
      borderRadius:
        15,
      backgroundColor:
        '#E5F2E5',
      borderWidth:
        1,
      borderColor:
        '#CEE5CF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    introIconBlue: {
      backgroundColor:
        '#E8F1F7',
      borderColor:
        '#D2E3EF',
    },

    introIconSuccess: {
      backgroundColor:
        '#E5F3E5',
      borderColor:
        '#C9E4CB',
    },

    introText: {
      flex:
        1,
      gap:
        3,
    },

    introTitle: {
      fontSize:
        17,
      fontWeight:
        '800',
      color:
        '#1B271C',
    },

    introDescription: {
      fontSize:
        11.5,
      lineHeight:
        17,
      color:
        '#778378',
    },

    /* ========================================================
       FORM
    ======================================================== */

    formGroup: {
      gap:
        6,
    },

    labelRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        6,
    },

    label: {
      fontSize:
        12,
      color:
        '#364238',
      fontWeight:
        '800',
    },

    required: {
      color:
        '#D25454',
      fontSize:
        13,
      fontWeight:
        '900',
    },

    input: {
      minHeight:
        52,
      borderRadius:
        15,
      borderWidth:
        1,
      borderColor:
        '#DCE5DC',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      paddingHorizontal:
        14,
      fontSize:
        13.5,
      color:
        '#273329',
      fontWeight:
        '600',
    },

    textArea: {
      minHeight:
        105,
      paddingTop:
        13,
      paddingBottom:
        13,
    },

    helperText: {
      fontSize:
        10,
      color:
        '#899389',
      paddingHorizontal:
        2,
    },

    /* ========================================================
       PICKER
    ======================================================== */

    pickerCard: {
      minHeight:
        54,
      borderRadius:
        15,
      borderWidth:
        1,
      borderColor:
        '#DCE5DC',
      backgroundColor:
        'rgba(255,255,255,0.90)',
      overflow:
        'hidden',
      justifyContent:
        'center',
    },

    picker: {
      color:
        '#334036',
      fontSize:
        13,
      height:
        54,
    },

    /* ========================================================
       CALCULATED
    ======================================================== */

    calculatedCard: {
      flexDirection:
        'row',
      gap:
        10,
      padding:
        13,
      borderRadius:
        17,
      backgroundColor:
        '#EEF6EE',
      borderWidth:
        1,
      borderColor:
        '#DDEBDE',
    },

    calculatedIcon: {
      width:
        38,
      height:
        38,
      borderRadius:
        12,
      backgroundColor:
        '#E1F0E1',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    calculatedContent: {
      flex:
        1,
      gap:
        2,
    },

    calculatedTitle: {
      fontSize:
        11,
      color:
        '#758178',
      fontWeight:
        '700',
    },

    calculatedValue: {
      fontSize:
        15,
      color:
        '#253226',
      fontWeight:
        '800',
    },

    calculatedHint: {
      marginTop:
        1,
      fontSize:
        10,
      lineHeight:
        15,
      color:
        '#859086',
    },

    /* ========================================================
       NEXT BUTTON
    ======================================================== */

    nextButton: {
      minHeight:
        54,
      paddingLeft:
        17,
      paddingRight:
        7,
      borderRadius:
        16,
      backgroundColor:
        colors.primary[700],
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      shadowColor:
        '#214126',
      shadowOpacity:
        0.14,
      shadowRadius:
        10,
      shadowOffset: {
        width:
          0,
        height:
          5,
      },
      elevation:
        3,
    },

    nextButtonText: {
      color:
        '#FFFFFF',
      fontSize:
        13.5,
      fontWeight:
        '800',
    },

    nextButtonIcon: {
      width:
        40,
      height:
        40,
      borderRadius:
        13,
      backgroundColor:
        'rgba(255,255,255,0.16)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    /* ========================================================
       LOCATION
    ======================================================== */

    locationCard: {
      padding:
        13,
      borderRadius:
        19,
      backgroundColor:
        'rgba(255,255,255,0.90)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.88)',
      gap:
        11,
    },

    locationHeader: {
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
    },

    locationHeaderLeft: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
    },

    locationIcon: {
      width:
        36,
      height:
        36,
      borderRadius:
        12,
      backgroundColor:
        '#E5F2E5',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    locationTitle: {
      fontSize:
        13,
      color:
        '#273329',
      fontWeight:
        '800',
    },

    locationSubtitle: {
      marginTop:
        2,
      fontSize:
        10,
      color:
        '#829087',
    },

    coordinatesBox: {
      padding:
        12,
      borderRadius:
        14,
      backgroundColor:
        '#F4F8F4',
      borderWidth:
        1,
      borderColor:
        '#E4EBE4',
    },

    coordinatesValue: {
      fontSize:
        13,
      color:
        '#445148',
      fontFamily:
        'monospace',
      fontWeight:
        '700',
    },

    accuracyText: {
      marginTop:
        5,
      fontSize:
        10,
      color:
        '#829087',
      fontWeight:
        '600',
    },

    gpsButton: {
      minHeight:
        55,
      paddingHorizontal:
        12,
      borderRadius:
        15,
      backgroundColor:
        '#2F7836',
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
    },

    gpsButtonContent: {
      flex:
        1,
      gap:
        2,
    },

    gpsButtonTitle: {
      color:
        '#FFFFFF',
      fontSize:
        12.5,
      fontWeight:
        '800',
    },

    gpsButtonSubtitle: {
      color:
        'rgba(255,255,255,0.72)',
      fontSize:
        9.5,
    },

    /* ========================================================
       DELIMITATION
    ======================================================== */

    delimitationCard: {
      padding:
        13,
      borderRadius:
        19,
      backgroundColor:
        'rgba(255,255,255,0.90)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.88)',
      gap:
        11,
    },

    delimitationHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap:
        10,
    },

    delimitationHeaderLeft: {
      flex:
        1,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
    },

    delimitationIcon: {
      width:
        36,
      height:
        36,
      borderRadius:
        12,
      backgroundColor:
        '#EDF1EE',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    delimitationTitle: {
      fontSize:
        13,
      color:
        '#273329',
      fontWeight:
        '800',
    },

    delimitationSubtitle: {
      marginTop:
        2,
      fontSize:
        10,
      color:
        '#829087',
    },

    pointsBadge: {
      minWidth:
        50,
      height:
        30,
      paddingHorizontal:
        8,
      borderRadius:
        10,
      backgroundColor:
        '#EFF2EF',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    pointsBadgeCompleted: {
      backgroundColor:
        '#E3F1E4',
    },

    pointsBadgeText: {
      fontSize:
        10.5,
      color:
        '#657168',
      fontWeight:
        '800',
    },

    pointsBadgeTextCompleted: {
      color:
        colors.primary[700],
    },

    delimiterButton: {
      minHeight:
        58,
      paddingHorizontal:
        12,
      borderRadius:
        15,
      backgroundColor:
        '#3F6F9C',
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        9,
    },

    delimiterButtonContent: {
      flex:
        1,
      gap:
        2,
    },

    delimiterButtonTitle: {
      color:
        '#FFFFFF',
      fontSize:
        12.5,
      fontWeight:
        '800',
    },

    delimiterButtonSubtitle: {
      color:
        'rgba(255,255,255,0.72)',
      fontSize:
        9.5,
    },

    successRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        6,
      paddingHorizontal:
        2,
    },

    successText: {
      fontSize:
        10.5,
      color:
        colors.primary[700],
      fontWeight:
        '700',
    },

    areaPreview: {
      minHeight:
        65,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        10,
      padding:
        12,
      borderRadius:
        16,
      backgroundColor:
        '#EEF6EE',
      borderWidth:
        1,
      borderColor:
        '#DFEBDF',
    },

    areaPreviewIcon: {
      width:
        36,
      height:
        36,
      borderRadius:
        11,
      backgroundColor:
        '#E2F0E2',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    areaPreviewContent: {
      flex:
        1,
      gap:
        2,
    },

    areaPreviewLabel: {
      fontSize:
        10,
      color:
        '#7B877D',
      fontWeight:
        '700',
    },

    areaPreviewValue: {
      fontSize:
        13,
      color:
        '#2C382E',
      fontWeight:
        '800',
    },

    /* ========================================================
       REVIEW
    ======================================================== */

    reviewCard: {
      padding:
        14,
      borderRadius:
        20,
      backgroundColor:
        'rgba(255,255,255,0.91)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.90)',
      gap:
        0,
    },

    reviewHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        10,
      paddingBottom:
        13,
      marginBottom:
        2,
      borderBottomWidth:
        1,
      borderBottomColor:
        '#EDF1ED',
    },

    reviewHeaderIcon: {
      width:
        42,
      height:
        42,
      borderRadius:
        14,
      backgroundColor:
        '#E5F2E5',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    reviewHeaderText: {
      flex:
        1,
      gap:
        2,
    },

    reviewTitle: {
      fontSize:
        16,
      color:
        '#1E2A20',
      fontWeight:
        '800',
    },

    reviewSubtitle: {
      fontSize:
        10,
      color:
        '#7D887F',
    },

    reviewRow: {
      minHeight:
        50,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap:
        12,
      borderBottomWidth:
        1,
      borderBottomColor:
        '#EDF1ED',
    },

    reviewRowLeft: {
      flex:
        1,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        8,
    },

    reviewRowIcon: {
      width:
        29,
      height:
        29,
      borderRadius:
        9,
      backgroundColor:
        '#F0F3F0',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    reviewRowLabel: {
      fontSize:
        11,
      color:
        '#7A867D',
      fontWeight:
        '600',
    },

    reviewRowValue: {
      flex:
        1.25,
      fontSize:
        11.5,
      color:
        '#2D392F',
      fontWeight:
        '800',
      textAlign:
        'right',
    },

    reviewSuccessValue: {
      color:
        colors.primary[700],
    },

    reviewDescriptionCard: {
      padding:
        13,
      borderRadius:
        16,
      backgroundColor:
        '#F4F8F4',
      borderWidth:
        1,
      borderColor:
        '#E4ECE4',
    },

    reviewDescriptionLabel: {
      fontSize:
        10,
      color:
        '#7C887E',
      fontWeight:
        '800',
      marginBottom:
        4,
    },

    reviewDescriptionText: {
      fontSize:
        11.5,
      lineHeight:
        17,
      color:
        '#566359',
    },

    /* ========================================================
       CHECKLIST
    ======================================================== */

    checklistCard: {
      padding:
        13,
      borderRadius:
        18,
      backgroundColor:
        'rgba(255,255,255,0.82)',
      borderWidth:
        1,
      borderColor:
        'rgba(255,255,255,0.86)',
    },

    checklistTitle: {
      fontSize:
        12,
      color:
        '#39453B',
      fontWeight:
        '800',
      marginBottom:
        4,
    },

    checkItem: {
      minHeight:
        39,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap:
        8,
    },

    checkItemBorder: {
      borderBottomWidth:
        1,
      borderBottomColor:
        '#EDF1ED',
    },

    checkItemIcon: {
      width:
        22,
      height:
        22,
      borderRadius:
        7,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    checkItemIconChecked: {
      backgroundColor:
        colors.primary[700],
    },

    checkItemIconEmpty: {
      backgroundColor:
        '#E8ECE8',
      borderWidth:
        1,
      borderColor:
        '#D8E0D8',
    },

    checkItemText: {
      flex:
        1,
      fontSize:
        10.5,
      color:
        '#879188',
      fontWeight:
        '600',
    },

    checkItemTextChecked: {
      color:
        '#506052',
      fontWeight:
        '700',
    },

    /* ========================================================
       INFO
    ======================================================== */

    infoCard: {
      flexDirection:
        'row',
      gap:
        8,
      padding:
        11,
      borderRadius:
        15,
      backgroundColor:
        '#EAF2F7',
      borderWidth:
        1,
      borderColor:
        '#D9E8F0',
    },

    infoIcon: {
      width:
        29,
      height:
        29,
      borderRadius:
        9,
      backgroundColor:
        '#DDEBF4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    infoText: {
      flex:
        1,
      fontSize:
        10.5,
      lineHeight:
        16,
      color:
        '#5E7080',
      fontWeight:
        '600',
    },

    /* ========================================================
       SAVE
    ======================================================== */

    saveButton: {
      minHeight:
        57,
      borderRadius:
        17,
      backgroundColor:
        colors.primary[700],
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap:
        8,
      shadowColor:
        '#214126',
      shadowOpacity:
        0.16,
      shadowRadius:
        11,
      shadowOffset: {
        width:
          0,
        height:
          5,
      },
      elevation:
        3,
    },

    saveButtonDisabled: {
      opacity:
        0.65,
    },

    saveButtonText: {
      color:
        '#FFFFFF',
      fontSize:
        13.5,
      fontWeight:
        '800',
    },

    editBeforeSave: {
      minHeight:
        40,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    editBeforeSaveText: {
      fontSize:
        11.5,
      color:
        colors.primary[700],
      fontWeight:
        '800',
    },

    /* ========================================================
       FOOTER
    ======================================================== */

    footer: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap:
        6,
      paddingTop:
        2,
    },

    footerIcon: {
      width:
        25,
      height:
        25,
      borderRadius:
        9,
      backgroundColor:
        'rgba(255,255,255,0.55)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    footerText: {
      fontSize:
        10.5,
      color:
        '#748075',
      fontWeight:
        '600',
    },
  });