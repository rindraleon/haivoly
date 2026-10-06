/* eslint-disable react/no-unescaped-entities */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { WebView } from 'react-native-webview';

import {
  Calendar,
  Check,
  ChevronRight,
  Clock3,
  Layers,
  Leaf,
  MapPinned,
  Plus,
  SearchX,
  SlidersHorizontal,
  Sprout,
  Wheat,
  X,
} from 'lucide-react-native';

import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { useQueries } from '@tanstack/react-query';

import {
  Culture,
  getCultures,
  getPointsGPSCulture,
  PointGPSCulture,
} from '@/api/cultures';

import {
  useParcelle,
  useParcelles,
} from '@/hooks/useParcelles';

import { useCultures } from '@/hooks/useCultures';

import {
  colors,
  radius,
} from '@/design/tokens';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { AppBottomBar } from '@/components/layout/AppBottomBar';


// =====================================================
// TYPES
// =====================================================

interface CultureAvecPoints extends Culture {
  pointsGPS: PointGPSCulture[];
}

interface CultureToutesParcelles extends Culture {
  parcelleNom: string;
  pointsGPS?: PointGPSCulture[];
}

interface CultureCarte {
  id: string;
  nom: string;
  statut: string;
  points: {
    latitude: number;
    longitude: number;
  }[];
}

type FiltreCulture =
  | 'TOUTES'
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';


// =====================================================
// CONSTANTES
// =====================================================

const FILTRES: FiltreCulture[] = [
  'TOUTES',
  'PLANIFIEE',
  'EN_COURS',
  'RECOLTEE',
  'ABANDONNEE',
  'SUPPRIMEE',
];


// =====================================================
// OUTILS
// =====================================================

function nomStatut(
  statut?: string,
) {
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
      return statut ?? '';
  }
}


function texteCulture(
  culture: CultureToutesParcelles,
) {
  const valeurs = [
    culture.nom,
    culture.type,
    culture.variete,
    culture.stade,
    culture.statut,
    culture.description,
    culture.datePlantation,
    culture.datePrevueRecolte,
    culture.modifieA,
    culture.parcelleNom,
  ];

  return valeurs
    .filter(
      (valeur) =>
        valeur !== undefined &&
        valeur !== null,
    )
    .map(
      (valeur) =>
        String(valeur).toLowerCase(),
    )
    .join(' ');
}


function formaterDate(
  date?: string | Date | null,
) {
  if (!date) {
    return null;
  }

  const valeur = new Date(date);

  if (Number.isNaN(valeur.getTime())) {
    return null;
  }

  return valeur.toLocaleDateString(
    'fr-FR',
  );
}


function getBadgeVariant(
  statut?: string,
): any {
  switch (statut) {
    case 'EN_COURS':
      return 'success';

    case 'PLANIFIEE':
      return 'warning';

    case 'RECOLTEE':
      return 'success';

    case 'ABANDONNEE':
      return 'warning';

    case 'SUPPRIMEE':
      return 'neutral';

    default:
      return 'neutral';
  }
}


function getFiltreLabel(
  filtre: FiltreCulture,
) {
  switch (filtre) {
    case 'TOUTES':
      return 'Toutes';

    default:
      return nomStatut(filtre);
  }
}


// =====================================================
// CARTE CULTURE
// =====================================================

function CultureCard({
  culture,
  onPress,
}: {
  culture: CultureToutesParcelles;
  onPress: () => void;
}) {
  const points =
    culture.pointsGPS ?? [];

  const estDelimitee =
    points.length >= 3;

  const datePlantation =
    formaterDate(
      culture.datePlantation,
    );

  const dateRecoltePrevue =
    formaterDate(
      culture.datePrevueRecolte,
    );

  const dateModification =
    formaterDate(
      culture.modifieA,
    );


  // ===================================================
  // PROGRESSION DU CYCLE
  // ===================================================

  let progression = 0;
  let progressionLabel = '';
  let progressionActive = false;

  switch (culture.statut) {
    case 'PLANIFIEE':
      progression = 33;
      progressionLabel = 'Culture planifiée';
      progressionActive = true;
      break;

    case 'EN_COURS':
      progression = 66;
      progressionLabel = 'Culture en cours';
      progressionActive = true;
      break;

    case 'RECOLTEE':
      progression = 100;
      progressionLabel = 'Cycle terminé';
      progressionActive = true;
      break;

    case 'ABANDONNEE':
      progression = 0;
      progressionLabel = 'Cycle arrêté';
      progressionActive = false;
      break;

    case 'SUPPRIMEE':
      progression = 0;
      progressionLabel = 'Culture supprimée';
      progressionActive = false;
      break;

    default:
      progression = 0;
      progressionLabel = 'Cycle';
      progressionActive = false;
      break;
  }


  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        pressed && {
          opacity: 0.96,
          transform: [
            {
              scale: 0.992,
            },
          ],
        },
      ]}
    >

      <Card
        style={
          styles.cultureCard
        }
      >

        {/* =========================================
            HEADER
        ========================================== */}

        <View
          style={
            styles.cultureHeader
          }
        >

          <View
            style={
              styles.cultureIcon
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
              styles.cultureHeaderContent
            }
          >

            <Text
              numberOfLines={1}
              style={
                styles.cultureName
              }
            >
              {culture.nom}
            </Text>


            <View
              style={
                styles.cultureSubtitleRow
              }
            >

              {culture.type ? (
                <>
                  <Layers
                    size={11}
                    color={
                      colors.neutral[500]
                    }
                    strokeWidth={2}
                  />

                  <Text
                    numberOfLines={1}
                    style={
                      styles.cultureSubtitle
                    }
                  >
                    {culture.type}
                  </Text>
                </>
              ) : null}


              {culture.type &&
              culture.variete ? (
                <Text
                  style={
                    styles.cultureSubtitleSeparator
                  }
                >
                  •
                </Text>
              ) : null}


              {culture.variete ? (
                <>
                  <Leaf
                    size={11}
                    color={
                      colors.neutral[500]
                    }
                    strokeWidth={2}
                  />

                  <Text
                    numberOfLines={1}
                    style={
                      styles.cultureSubtitle
                    }
                  >
                    {culture.variete}
                  </Text>
                </>
              ) : null}

            </View>

          </View>


          <View
            style={
              styles.statusContainer
            }
          >

            <Badge
              label={nomStatut(
                culture.statut,
              )}
              variant={getBadgeVariant(
                culture.statut,
              )}
              dot
            />

          </View>

        </View>


        {/* =========================================
            SEPARATEUR
        ========================================== */}

        <View
          style={
            styles.cardSeparator
          }
        />


        {/* =========================================
            PROGRESSION
        ========================================== */}

        <View
          style={
            styles.progressSection
          }
        >

          <View
            style={
              styles.progressHeader
            }
          >

            <View
              style={
                styles.progressTitleArea
              }
            >

              <Text
                style={
                  styles.progressTitle
                }
              >
                PROGRESSION DU CYCLE
              </Text>

              <Text
                style={
                  progressionActive
                    ? styles.progressLabelActive
                    : styles.progressLabelInactive
                }
              >
                {progressionLabel}
              </Text>

            </View>


            <Text
              style={
                progressionActive
                  ? styles.progressPercent
                  : styles.progressPercentInactive
              }
            >
              {progressionActive
                ? `${progression} %`
                : '—'}
            </Text>

          </View>


          {/* =======================================
              TIMELINE
          ======================================== */}

          <View
            style={
              styles.progressTimeline
            }
          >

            <View
              style={
                styles.progressLineBackground
              }
            />

            <View
              style={[
                styles.progressLineActive,
                {
                  right:
                    progression === 66
                      ? '50%'
                      : progression === 100
                        ? 5.5
                        : '100%',
                },
              ]}
            />


            <View
              style={
                styles.progressNodeRow
              }
            >

              <View
                style={[
                  styles.progressNodeItem,
                  styles.progressNodeStart,
                ]}
              >

                <View
                  style={[
                    styles.progressNode,
                    progression >= 33 &&
                      styles.progressNodeActive,
                    !progressionActive &&
                      styles.progressNodeInactive,
                  ]}
                />

                <Text
                  style={[
                    styles.progressNodeLabel,
                    progression >= 33 &&
                      styles.progressNodeLabelActive,
                  ]}
                >
                  Planifiée
                </Text>

              </View>


              <View
                style={[
                  styles.progressNodeItem,
                  styles.progressNodeCenter,
                ]}
              >

                <View
                  style={[
                    styles.progressNode,
                    progression >= 66 &&
                      styles.progressNodeActive,
                    !progressionActive &&
                      styles.progressNodeInactive,
                  ]}
                />

                <Text
                  style={[
                    styles.progressNodeLabel,
                    progression >= 66 &&
                      styles.progressNodeLabelActive,
                  ]}
                >
                  En cours
                </Text>

              </View>


              <View
                style={[
                  styles.progressNodeItem,
                  styles.progressNodeEnd,
                ]}
              >

                <View
                  style={[
                    styles.progressNode,
                    progression >= 100 &&
                      styles.progressNodeActive,
                    !progressionActive &&
                      styles.progressNodeInactive,
                  ]}
                />

                <Text
                  style={[
                    styles.progressNodeLabel,
                    progression >= 100 &&
                      styles.progressNodeLabelActive,
                  ]}
                >
                  Récoltée
                </Text>

              </View>

            </View>

          </View>

        </View>


        {/* =========================================
            PARCELLE
        ========================================== */}

        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.parcelleCard,

            pressed && {
              opacity: 0.88,
            },
          ]}
        >

          <View
            style={
              styles.parcelleCardLeft
            }
          >

            <MapPinned
              size={19}
              color={
                colors.primary[600]
              }
              strokeWidth={2}
            />

            <View
              style={
                styles.parcelleCardText
              }
            >

              <Text
                style={
                  styles.parcelleCardLabel
                }
              >
                PARCELLE
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.parcelleCardValue
                }
              >
                {culture.parcelleNom ||
                  'Parcelle non renseignée'}
              </Text>

            </View>

          </View>

        </Pressable>


        {/* =========================================
            GRILLE D'INFORMATIONS
        ========================================== */}

        <View
          style={
            styles.infoGrid
          }
        >

          {/* STADE */}

          <View
            style={
              styles.infoCard
            }
          >

            <View
              style={
                styles.infoCardIcon
              }
            >

              <Sprout
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
                STADE
              </Text>

              <Text
                numberOfLines={2}
                style={
                  styles.infoCardValue
                }
              >
                {culture.stade ||
                  'Non renseigné'}
              </Text>

            </View>

          </View>


          {/* PLANTATION */}

          <View
            style={
              styles.infoCard
            }
          >

            <View
              style={
                styles.infoCardIcon
              }
            >

              <Calendar
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
                PLANTATION
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.infoCardValue
                }
              >
                {datePlantation ||
                  'Non renseignée'}
              </Text>

            </View>

          </View>


          {/* RÉCOLTE */}

          <View
            style={
              styles.infoCard
            }
          >

            <View
              style={
                styles.infoCardIcon
              }
            >

              <Wheat
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
                RÉCOLTE
              </Text>

              <Text
                numberOfLines={1}
                style={
                  styles.infoCardValue
                }
              >
                {dateRecoltePrevue ||
                  'Non renseignée'}
              </Text>

            </View>

          </View>


          {/* DÉLIMITATION */}

          <View
            style={
              styles.infoCard
            }
          >

            <View
              style={
                styles.infoCardIcon
              }
            >

              <MapPinned
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
                DÉLIMITATION
              </Text>

              <Text
                numberOfLines={1}
                style={[
                  styles.infoCardValue,
                  estDelimitee &&
                    styles.infoCardValueActive,
                ]}
              >
                {estDelimitee
                  ? `${points.length} points GPS`
                  : 'Non délimitée'}
              </Text>

            </View>

          </View>

        </View>


        {/* =========================================
            FOOTER
        ========================================== */}

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
              {dateModification
                ? `Modifiée le ${dateModification}`
                : 'Modification non renseignée'}
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

      </Card>

    </Pressable>
  );
}


// =====================================================
// ÉCRAN
// =====================================================

export default function CulturesScreen() {

  // ===================================================
  // PARAMÈTRES
  // ===================================================

  const {
    parcelleId,
    parcelleNom,
  } =
    useLocalSearchParams<{
      parcelleId?: string;
      parcelleNom?: string;
    }>();


  // ===================================================
  // PARCELLE
  // ===================================================

  const {
    data: parcelle,
    isLoading:
      isLoadingParcelle,
    isError:
      isErrorParcelle,
    refetch:
      refetchParcelle,
  } =
    useParcelle(
      parcelleId ?? '',
    );


  // ===================================================
  // CULTURES DE LA PARCELLE
  // ===================================================

  const {
    data: cultures,
    isLoading:
      isLoadingCultures,
    isError:
      isErrorCultures,
    refetch:
      refetchCultures,
  } =
    useCultures(
      parcelleId ?? '',
    );


  // ===================================================
  // PARCELLES
  // ===================================================

  const {
    data: parcelles,
    isLoading:
      isLoadingParcelles,
    isError:
      isErrorParcelles,
    refetch:
      refetchParcelles,
  } =
    useParcelles();


  // ===================================================
  // CULTURES DE TOUTES LES PARCELLES
  // ===================================================

  const culturesToutesParcellesQueries =
    useQueries({
      queries:
        (parcelles ?? []).map(
          (item) => ({
            queryKey: [
              'cultures',
              item.id,
            ],

            queryFn: () =>
              getCultures(item.id),

            enabled:
              !parcelleId &&
              !!item.id,
          }),
        ),
    });


  // useQueries retourne un nouveau tableau de résultats à chaque rendu.
  // On ne doit donc pas utiliser directement ce tableau comme dépendance
  // du useMemo, sinon toutesLesCultures peut être recalculée à chaque rendu
  // et relancer en cascade l'effet de chargement GPS.
  const culturesQueriesVersion =
    culturesToutesParcellesQueries
      .map(
        (query) =>
          query.dataUpdatedAt,
      )
      .join('|');


  const toutesLesCultures =
    useMemo<
      CultureToutesParcelles[]
    >(() => {

      if (
        !parcelles ||
        parcelles.length === 0
      ) {
        return [];
      }

      const resultat:
        CultureToutesParcelles[] =
        [];

      parcelles.forEach(
        (
          item,
          index,
        ) => {

          const culturesParcelle =
            culturesToutesParcellesQueries[
              index
            ]?.data;

          if (
            !culturesParcelle
          ) {
            return;
          }

          culturesParcelle.forEach(
            (culture) => {

              resultat.push({
                ...culture,

                parcelleNom:
                  item.nom,

                pointsGPS: [],
              });

            },
          );

        },
      );

      return resultat;

    }, [
      parcelles,
      culturesQueriesVersion,
    ]);


  const isLoadingToutesLesCultures =
    !parcelleId &&
    (
      isLoadingParcelles ||
      culturesToutesParcellesQueries.some(
        (query) =>
          query.isLoading,
      )
    );


  const isErrorToutesLesCultures =
    !parcelleId &&
    culturesToutesParcellesQueries.some(
      (query) =>
        query.isError,
    );


  // ===================================================
  // AJOUT CULTURE
  // ===================================================

  const [
    ajoutCultureModalOuvert,
    setAjoutCultureModalOuvert,
  ] =
    useState(false);


  const [
    parcellePourAjout,
    setParcellePourAjout,
  ] =
    useState<string | null>(
      null,
    );


  const ouvrirModalAjoutCulture =
    useCallback(() => {

      setParcellePourAjout(
        parcelleId ?? null,
      );

      setAjoutCultureModalOuvert(
        true,
      );

    }, [
      parcelleId,
    ]);


  // ===================================================
  // CHOISIR PARCELLE
  // ===================================================

  const choisirParcellePourAjout =
    useCallback(
      (id: string) => {

        const selected =
          parcelles?.find(
            (item) =>
              item.id === id,
          );

        if (!selected) {
          return;
        }

        setParcellePourAjout(
          id,
        );

        setAjoutCultureModalOuvert(
          false,
        );

        router.push({
          pathname:
            '/ajout-culture',

          params: {
            parcelleId:
              selected.id,

            parcelleNom:
              selected.nom,
          },
        });

      },
      [
        parcelles,
      ],
    );


  // ===================================================
  // GPS CULTURES
  // ===================================================

  const [
    culturesAvecPoints,
    setCulturesAvecPoints,
  ] =
    useState<
      CultureAvecPoints[]
    >([]);


  const [
    loadingPoints,
    setLoadingPoints,
  ] =
    useState(false);


  const [
    refreshKey,
    setRefreshKey,
  ] =
    useState(0);


  // ===================================================
  // RECHERCHE
  // ===================================================

  const [
    recherche,
    setRecherche,
  ] =
    useState('');


  // ===================================================
  // FILTRE
  // ===================================================

  const [
    filtreOuvert,
    setFiltreOuvert,
  ] =
    useState(false);


  const [
    statutFiltre,
    setStatutFiltre,
  ] =
    useState<FiltreCulture>(
      'TOUTES',
    );


  // ===================================================
  // REFRESH
  // ===================================================

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);


  const onRefresh =
    useCallback(
      async () => {

        setRefreshing(true);

        try {

          if (parcelleId) {

            await Promise.all([
              refetchParcelle(),
              refetchCultures(),
            ]);

            setRefreshKey(
              (previous) =>
                previous + 1,
            );

          } else {

            await Promise.all([
              refetchParcelles(),
              ...culturesToutesParcellesQueries.map(
                (query) =>
                  query.refetch(),
              ),
            ]);

            setRefreshKey(
              (previous) =>
                previous + 1,
            );
          }

        } finally {

          setRefreshing(false);

        }

      },
      [
        parcelleId,
        refetchParcelle,
        refetchCultures,
        refetchParcelles,
        culturesToutesParcellesQueries,
      ],
    );


  // ===================================================
  // REFRESH FOCUS
  // ===================================================

  useFocusEffect(
    useCallback(() => {

      if (!parcelleId) {
        return;
      }

      refetchParcelle();
      refetchCultures();

      setRefreshKey(
        (previous) =>
          previous + 1,
      );

    }, [
      parcelleId,
      refetchParcelle,
      refetchCultures,
    ]),
  );


  // ===================================================
  // CHARGEMENT DES POINTS GPS
  // ===================================================

  useEffect(() => {

    let actif = true;

    const chargerPointsGPS =
      async () => {

        try {

          setLoadingPoints(
            true,
          );


          // =================================================
          // CAS 1 : UNE SEULE PARCELLE
          // =================================================

          if (parcelleId) {

            if (
              !cultures ||
              cultures.length === 0
            ) {

              if (actif) {

                setCulturesAvecPoints(
                  [],
                );

              }

              return;
            }


            const result =
              await Promise.all(
                cultures.map(
                  async (
                    culture,
                  ) => {

                    try {

                      const points =
                        await getPointsGPSCulture(
                          parcelleId,
                          culture.id,
                        );


                      return {
                        ...culture,

                        pointsGPS:
                          points.map(
                            (
                              point,
                              index,
                            ) => ({
                              ...point,

                              ordre:
                                point.ordre ??
                                index + 1,

                              latitude:
                                Number(
                                  point.latitude,
                                ),

                              longitude:
                                Number(
                                  point.longitude,
                                ),
                            }),
                          ),
                      };

                    } catch (
                      error
                    ) {

                      console.log(
                        `Erreur GPS culture ${culture.id}`,
                        error,
                      );

                      return {
                        ...culture,

                        pointsGPS: [],
                      };

                    }

                  },
                ),
              );


            if (actif) {

              setCulturesAvecPoints(
                result,
              );

            }


            return;
          }


          // =================================================
          // CAS 2 : TOUTES LES PARCELLES
          // =================================================

          if (
            toutesLesCultures.length ===
            0
          ) {

            if (actif) {

              setCulturesAvecPoints(
                [],
              );

            }

            return;
          }


          const resultGlobal:
            CultureAvecPoints[] =
            await Promise.all(
              toutesLesCultures.map(
                async (culture) => {

                  try {

                    if (
                      !culture.parcelleId
                    ) {

                      return {
                        ...culture,
                        pointsGPS: [],
                      };

                    }


                    const points =
                      await getPointsGPSCulture(
                        culture.parcelleId,
                        culture.id,
                      );


                    return {
                      ...culture,

                      pointsGPS:
                        points.map(
                          (
                            point,
                            index,
                          ) => ({
                            ...point,

                            ordre:
                              point.ordre ??
                              index + 1,

                            latitude:
                              Number(
                                point.latitude,
                              ),

                            longitude:
                              Number(
                                point.longitude,
                              ),
                          }),
                        ),
                    };

                  } catch (
                    error
                  ) {

                    console.log(
                      `Erreur GPS culture ${culture.id}`,
                      error,
                    );

                    return {
                      ...culture,

                      pointsGPS: [],
                    };

                  }

                },
              ),
            );


          if (actif) {

            setCulturesAvecPoints(
              resultGlobal,
            );

          }

        } catch (
          error
        ) {

          console.error(
            'Erreur chargement GPS cultures',
            error,
          );

          if (actif) {

            setCulturesAvecPoints(
              [],
            );

          }

        } finally {

          if (actif) {

            setLoadingPoints(
              false,
            );

          }

        }

      };


    chargerPointsGPS();


    return () => {
      actif = false;
    };

  }, [
    parcelleId,
    cultures,
    toutesLesCultures,
    refreshKey,
  ]);


  // ===================================================
  // CENTRE CARTE
  // ===================================================

  const centreCarte =
    useMemo(() => {

      if (
        parcelle?.pointsGPS &&
        parcelle.pointsGPS.length > 0
      ) {

        return {
          latitude:
            Number(
              parcelle
                .pointsGPS[0]
                .latitude,
            ),

          longitude:
            Number(
              parcelle
                .pointsGPS[0]
                .longitude,
            ),
        };

      }

      if (
        parcelle?.latitude != null &&
        parcelle?.longitude != null
      ) {

        return {
          latitude:
            Number(
              parcelle.latitude,
            ),

          longitude:
            Number(
              parcelle.longitude,
            ),
        };

      }

      return {
        latitude:
          -18.8792,

        longitude:
          47.5079,
      };

    }, [
      parcelle,
    ]);


  // ===================================================
  // CULTURES DÉLIMITÉES
  // ===================================================

  const nombreCulturesDelimitees =
    culturesAvecPoints.filter(
      (culture) =>
        culture.pointsGPS.length >=
        3,
    ).length;


  // ===================================================
  // SOURCE CULTURES
  // ===================================================

  const culturesSource =
    useMemo<
      CultureToutesParcelles[]
    >(() => {

      if (parcelleId) {

        return (
          cultures ?? []
        ).map(
          (culture) => {

            const gps =
              culturesAvecPoints.find(
                (item) =>
                  item.id ===
                  culture.id,
              );


            return {
              ...culture,

              parcelleNom:
                parcelle?.nom ??
                parcelleNom ??
                '',

              pointsGPS:
                gps?.pointsGPS ??
                [],
            };

          },
        );

      }


      return toutesLesCultures.map(
        (culture) => {

          const gps =
            culturesAvecPoints.find(
              (item) =>
                item.id ===
                culture.id,
            );


          return {
            ...culture,

            pointsGPS:
              gps?.pointsGPS ??
              [],
          };

        },
      );

    }, [
      parcelleId,
      cultures,
      culturesAvecPoints,
      parcelle,
      parcelleNom,
      toutesLesCultures,
    ]);


  // ===================================================
  // RECHERCHE + FILTRE + TRI AUTOMATIQUE
  // ===================================================

  const culturesFiltrees =
    useMemo(() => {

      let resultat =
        [...culturesSource];


      const q =
        recherche
          .trim()
          .toLowerCase();


      if (q) {

        resultat =
          resultat.filter(
            (culture) =>
              texteCulture(
                culture,
              ).includes(q),
          );

      }


      if (
        statutFiltre !==
        'TOUTES'
      ) {

        resultat =
          resultat.filter(
            (culture) =>
              culture.statut ===
              statutFiltre,
          );

      }


      resultat.sort(
        (a, b) =>
          new Date(
            b.modifieA ?? 0,
          ).getTime() -
          new Date(
            a.modifieA ?? 0,
          ).getTime(),
      );


      return resultat;

    }, [
      culturesSource,
      recherche,
      statutFiltre,
    ]);


  // ===================================================
  // STATISTIQUES
  // ===================================================

  const statistiques =
    useMemo(() => {

      const total =
        culturesSource.length;

      const enCours =
        culturesSource.filter(
          (culture) =>
            culture.statut ===
            'EN_COURS',
        ).length;

      const planifiees =
        culturesSource.filter(
          (culture) =>
            culture.statut ===
            'PLANIFIEE',
        ).length;

      return {
        total,
        enCours,
        planifiees,
      };

    }, [
      culturesSource,
    ]);


  // ===================================================
  // WEBVIEW CARTE
  // ===================================================

  const webViewRef =
    useRef<WebView>(
      null,
    );


  const [
    mapReady,
    setMapReady,
  ] =
    useState(false);


  // ===================================================
  // DONNÉES CULTURES POUR LEAFLET
  // ===================================================

  const culturesCarte =
    useMemo<CultureCarte[]>(() => {

      return culturesAvecPoints
        .filter(
          (culture) =>
            culture.pointsGPS &&
            culture.pointsGPS.length >=
              3,
        )
        .map(
          (culture) => ({
            id:
              culture.id,

            nom:
              culture.nom,

            statut:
              culture.statut,

            points:
              [
                ...culture.pointsGPS,
              ]
                .sort(
                  (a, b) =>
                    a.ordre -
                    b.ordre,
                )
                .map(
                  (point) => ({
                    latitude:
                      Number(
                        point.latitude,
                      ),

                    longitude:
                      Number(
                        point.longitude,
                      ),
                  }),
                ),
          }),
        );

    }, [
      culturesAvecPoints,
    ]);


  // ===================================================
  // ENVOI DES CULTURES VERS LEAFLET
  // ===================================================

  const envoyerCulturesVersCarte =
    useCallback(() => {

      if (
        !webViewRef.current ||
        !mapReady
      ) {
        return;
      }

      const message =
        JSON.stringify({
          type:
            'UPDATE_CULTURES',

          cultures:
            culturesCarte,
        });


      webViewRef.current.postMessage(
        message,
      );

    }, [
      mapReady,
      culturesCarte,
    ]);


  // ===================================================
  // SYNCHRONISATION AUTOMATIQUE
  // ===================================================

  useEffect(() => {

    envoyerCulturesVersCarte();

  }, [
    envoyerCulturesVersCarte,
  ]);


  // ===================================================
  // MAP HTML
  // ===================================================

  const mapHtml =
    useMemo(() => {

      const pointsParcelle =
        parcelle?.pointsGPS?.map(
          (
            point: any,
            index: number,
          ) => ({

            id:
              point.id ??
              `parcelle-${index}`,

            ordre:
              point.ordre ??
              index + 1,

            latitude:
              Number(
                point.latitude,
              ),

            longitude:
              Number(
                point.longitude,
              ),

          }),
        ) ?? [];


      return `
<!DOCTYPE html>

<html>

<head>

<meta
  name="viewport"
  content="width=device-width, initial-scale=1.0"
/>

<link
  rel="stylesheet"
  href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
/>

<script
  src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
></script>

<style>

html,
body,
#map {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
}

.legend {
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.25);
  font-size: 13px;
  max-width: 180px;
}

.legend-title {
  font-weight: bold;
  margin-bottom: 7px;
}

.legend-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.legend-color {
  width: 14px;
  height: 14px;
  margin-right: 7px;
  border-radius: 3px;
}

.culture-label {
  background: white;
  border: 2px solid #333;
  border-radius: 8px;
  padding: 5px 8px;
  font-size: 13px;
  font-weight: bold;
  white-space: nowrap;
}

.map-status {
  background: rgba(255,255,255,0.92);
  padding: 7px 10px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  font-size: 12px;
  font-weight: 700;
}

</style>

</head>

<body>

<div id="map"></div>

<script>

const pointsParcelle =
  ${JSON.stringify(pointsParcelle)};

const couleurs = [
  '#1976D2',
  '#F57C00',
  '#7B1FA2',
  '#00838F',
  '#C2185B',
  '#5D4037',
  '#455A64',
  '#388E3C',
];

const map =
  L.map(
    'map',
    {
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      touchZoom: true,
      minZoom: 5,
      maxZoom: 22,
    }
  ).setView(
    [
      ${centreCarte.latitude},
      ${centreCarte.longitude}
    ],
    18
  );

const standard =
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution:
        '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }
  );

const satellite =
  L.tileLayer(
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    {
      attribution:
        'Tiles &copy; Esri',
      maxZoom: 19,
    }
  );

standard.addTo(map);

L.control.layers(
  {
    '🗺️ Standard': standard,
    '🛰️ Satellite': satellite,
  },
  null,
  {
    position: 'topright',
  }
).addTo(map);


// =====================================================
// PARCELLE
// =====================================================

const parcelleBounds = [];

if (
  pointsParcelle.length >= 3
) {

  const coordinates =
    pointsParcelle.map(
      function(point) {

        const position = [
          Number(point.latitude),
          Number(point.longitude),
        ];

        parcelleBounds.push(position);

        return position;

      }
    );


  const parcellePolygon =
    L.polygon(
      coordinates,
      {
        color: '#2e7d32',
        fillColor: '#2e7d32',
        fillOpacity: 0.12,
        weight: 4,
      }
    ).addTo(map);


  parcellePolygon.bindPopup(
    '<b>Parcelle</b>'
  );

}


// =====================================================
// COUCHES CULTURES
// =====================================================

let cultureLayers = [];
let cultureMarkers = [];
let currentCultures = [];


// =====================================================
// LÉGENDE
// =====================================================

const legend =
  L.control({
    position: 'bottomright',
  });


legend.onAdd =
  function() {

    const div =
      L.DomUtil.create(
        'div',
        'legend',
      );

    div.innerHTML =
      '<div class="legend-title">Légende</div>' +
      '<div class="legend-item">' +
      '<div class="legend-color" style="background:#2e7d32"></div>' +
      'Parcelle' +
      '</div>';

    return div;

  };


legend.addTo(map);


// =====================================================
// MISE À JOUR LÉGENDE
// =====================================================

function mettreAJourLegende(
  cultures
) {

  const container =
    document.querySelector(
      '.legend'
    );

  if (!container) {
    return;
  }


  let html =
    '<div class="legend-title">Légende</div>';


  html +=
    '<div class="legend-item">' +
    '<div class="legend-color" style="background:#2e7d32"></div>' +
    'Parcelle' +
    '</div>';


  cultures.forEach(
    function(
      culture,
      index,
    ) {

      const couleur =
        couleurs[
          index % couleurs.length
        ];


      html +=
        '<div class="legend-item">' +
        '<div class="legend-color" style="background:' +
        couleur +
        '"></div>' +
        culture.nom +
        '</div>';

    }
  );


  container.innerHTML =
    html;

}


// =====================================================
// SUPPRESSION ANCIENNES CULTURES
// =====================================================

function supprimerCulturesExistantes() {

  cultureLayers.forEach(
    function(layer) {

      try {
        map.removeLayer(layer);
      } catch (error) {
      }

    }
  );


  cultureMarkers.forEach(
    function(marker) {

      try {
        map.removeLayer(marker);
      } catch (error) {
      }

    }
  );


  cultureLayers = [];
  cultureMarkers = [];

}


// =====================================================
// AJOUT CULTURES
// =====================================================

function afficherCultures(
  cultures
) {

  currentCultures =
    Array.isArray(cultures)
      ? cultures
      : [];


  supprimerCulturesExistantes();


  const bounds = [];


  parcelleBounds.forEach(
    function(position) {

      bounds.push(position);

    }
  );


  currentCultures.forEach(
    function(
      culture,
      index,
    ) {

      if (
        !culture ||
        !Array.isArray(
          culture.points,
        ) ||
        culture.points.length <
          3
      ) {
        return;
      }


      const couleur =
        couleurs[
          index % couleurs.length
        ];


      const coordinates =
        culture.points.map(
          function(point) {

            const position = [
              Number(point.latitude),
              Number(point.longitude),
            ];


            bounds.push(
              position
            );


            return position;

          }
        );


      const polygon =
        L.polygon(
          coordinates,
          {
            color:
              couleur,

            fillColor:
              couleur,

            fillOpacity:
              0.35,

            weight:
              3,
          }
        ).addTo(map);


      polygon.bindPopup(
        '<div style="min-width:140px">' +
        '<b>' +
        culture.nom +
        '</b>' +
        '<br/>' +
        'Statut : ' +
        culture.statut +
        '</div>'
      );


      cultureLayers.push(
        polygon,
      );


      const center =
        polygon
          .getBounds()
          .getCenter();


      const marker =
        L.marker(
          center,
          {
            interactive:
              false,

            icon:
              L.divIcon({
                className:
                  '',

                html:
                  '<div class="culture-label">' +
                  culture.nom +
                  '</div>',

                iconSize:
                  [30, 30],

                iconAnchor:
                  [25, 15],
              }),
          }
        ).addTo(map);


      cultureMarkers.push(
        marker,
      );

    }
  );


  mettreAJourLegende(
    currentCultures,
  );


  if (
    bounds.length > 0
  ) {

    map.fitBounds(
      bounds,
      {
        padding:
          [30, 30],
      }
    );

  } else if (
    pointsParcelle.length === 0
  ) {

    map.setView(
      [
        ${centreCarte.latitude},
        ${centreCarte.longitude}
      ],
      18
    );

  }

}


// =====================================================
// MESSAGE REACT NATIVE -> LEAFLET
// =====================================================

function traiterMessage(
  event
) {

  try {

    const raw =
      event.data;


    if (!raw) {
      return;
    }


    const data =
      typeof raw === 'string'
        ? JSON.parse(raw)
        : raw;


    if (
      data &&
      data.type ===
        'UPDATE_CULTURES'
    ) {

      afficherCultures(
        data.cultures,
      );

    }

  } catch (
    error
  ) {

    console.error(
      'Erreur message carte',
      error,
    );

  }

}


// =====================================================
// COMPATIBILITÉ ANDROID / IOS
// =====================================================

window.addEventListener(
  'message',
  traiterMessage,
);

document.addEventListener(
  'message',
  traiterMessage,
);


// =====================================================
// INITIALISATION
// =====================================================

if (
  pointsParcelle.length === 0
) {

  map.setView(
    [
      ${centreCarte.latitude},
      ${centreCarte.longitude}
    ],
    18
  );

} else {

  map.fitBounds(
    parcelleBounds,
    {
      padding:
        [30, 30],
    }
  );

}

</script>

</body>

</html>
      `;

    }, [
      parcelle,
      centreCarte,
    ]);


  // ===================================================
  // MODAL CHOIX PARCELLE
  // ===================================================

  const modalChoixParcelle = (
    <Modal
      visible={
        ajoutCultureModalOuvert
      }
      transparent
      animationType="fade"
      onRequestClose={() =>
        setAjoutCultureModalOuvert(
          false,
        )
      }
    >

      <View
        style={
          styles.modalOverlay
        }
      >

        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={() =>
            setAjoutCultureModalOuvert(
              false,
            )
          }
        />

        <View
          style={
            styles.modalCard
          }
        >

          <View
            style={
              styles.modalHeader
            }
          >

            <View
              style={
                styles.modalHeaderText
              }
            >

              <Text
                style={
                  styles.modalTitle
                }
              >
                Choisir une parcelle
              </Text>

              <Text
                style={
                  styles.modalSubtitle
                }
              >
                Sélectionnez la parcelle où vous souhaitez créer la culture.
              </Text>

            </View>

            <Pressable
              style={
                styles.modalCloseButton
              }
              onPress={() =>
                setAjoutCultureModalOuvert(
                  false,
                )
              }
            >

              <X
                size={20}
                color={
                  colors.neutral[600]
                }
              />

            </Pressable>

          </View>


          <View
            style={
              styles.modalDivider
            }
          />


          {isLoadingParcelles ? (

            <View
              style={
                styles.modalLoading
              }
            >

              <ActivityIndicator
                size="large"
                color={
                  colors.primary[500]
                }
              />

              <Text
                style={
                  styles.modalLoadingText
                }
              >
                Chargement des parcelles...
              </Text>

            </View>

          ) : isErrorParcelles ? (

            <View
              style={
                styles.modalEmpty
              }
            >

              <Text
                style={
                  styles.modalEmptyTitle
                }
              >
                Impossible de charger les parcelles
              </Text>

              <Text
                style={
                  styles.modalEmptyText
                }
              >
                Vérifiez votre connexion puis réessayez.
              </Text>

            </View>

          ) : !parcelles ||
            parcelles.length === 0 ? (

            <View
              style={
                styles.modalEmpty
              }
            >

              <Text
                style={
                  styles.modalEmptyTitle
                }
              >
                Aucune parcelle
              </Text>

              <Text
                style={
                  styles.modalEmptyText
                }
              >
                Créez d'abord une parcelle avant d'ajouter une culture.
              </Text>

            </View>

          ) : (

            <ScrollView
              style={
                styles.modalParcellesScroll
              }
              showsVerticalScrollIndicator={
                false
              }
            >

              {parcelles.map(
                (item) => {

                  const selectionnee =
                    parcellePourAjout ===
                    item.id;

                  return (
                    <Pressable
                      key={
                        item.id
                      }
                      style={({ pressed }) => [
                        styles.modalParcelleItem,

                        selectionnee &&
                          styles.modalParcelleItemSelected,

                        pressed && {
                          opacity: 0.9,
                        },
                      ]}
                      onPress={() =>
                        choisirParcellePourAjout(
                          item.id,
                        )
                      }
                    >

                      <View
                        style={
                          styles.modalParcelleIcon
                        }
                      >

                        <MapPinned
                          size={18}
                          color={
                            colors.primary[600]
                          }
                        />

                      </View>

                      <View
                        style={
                          styles.modalParcelleInfo
                        }
                      >

                        <Text
                          style={
                            styles.modalParcelleNom
                          }
                        >
                          {item.nom}
                        </Text>

                        {item.superficie !=
                          null && (
                          <Text
                            style={
                              styles.modalParcelleSuperficie
                            }
                          >
                            {Number(
                              item.superficie,
                            ).toLocaleString(
                              'fr-FR',
                            )}{' '}
                            m²
                          </Text>
                        )}

                      </View>

                      {selectionnee ? (

                        <View
                          style={
                            styles.modalCheck
                          }
                        >

                          <Check
                            size={18}
                            color="#fff"
                            strokeWidth={3}
                          />

                        </View>

                      ) : (

                        <ChevronRight
                          size={18}
                          color={
                            colors.neutral[400]
                          }
                        />

                      )}

                    </Pressable>
                  );
                },
              )}

            </ScrollView>
          )}

        </View>

      </View>

    </Modal>
  );


  // ===================================================
  // VUE GLOBALE
  // ===================================================

  if (!parcelleId) {

    return (
      <View
        style={
          styles.root
        }
      >

        <ScreenHeader
          title="Cultures"
          subtitle={`${statistiques.total} cultures • ${statistiques.enCours} en cours`}
        />


        <View
          style={
            styles.topBar
          }
        >

          <View
            style={
              styles.searchRow
            }
          >

            <View
              style={{
                flex: 1,
              }}
            >

              <SearchBar
                value={
                  recherche
                }
                onChangeText={
                  setRecherche
                }
                placeholder="Rechercher culture, parcelle, variété..."
              />

            </View>


            <Pressable
              onPress={() =>
                setFiltreOuvert(
                  (value) =>
                    !value,
                )
              }
              style={({ pressed }) => [
                styles.filterBtn,

                filtreOuvert &&
                  styles.filterBtnActive,

                pressed && {
                  opacity: 0.8,
                },
              ]}
            >

              <SlidersHorizontal
                size={18}
                color={
                  filtreOuvert
                    ? '#FFFFFF'
                    : colors.neutral[700]
                }
                strokeWidth={2}
              />

            </Pressable>

          </View>


          {filtreOuvert && (
            <View
              style={
                styles.filterPanel
              }
            >

              <View
                style={
                  styles.filterHeader
                }
              >

                <Text
                  style={
                    styles.filterLabel
                  }
                >
                  Filtrer par statut
                </Text>

                <Pressable
                  onPress={() =>
                    setFiltreOuvert(
                      false,
                    )
                  }
                >

                  <X
                    size={17}
                    color={
                      colors.neutral[500]
                    }
                  />

                </Pressable>

              </View>


              <View
                style={
                  styles.chips
                }
              >

                {FILTRES.map(
                  (filtre) => (
                    <Chip
                      key={
                        filtre
                      }
                      label={
                        getFiltreLabel(
                          filtre,
                        )
                      }
                      selected={
                        statutFiltre ===
                        filtre
                      }
                      onPress={() =>
                        setStatutFiltre(
                          filtre,
                        )
                      }
                    />
                  ),
                )}

              </View>

            </View>
          )}


          <View
            style={
              styles.statsBar
            }
          >

            <View
              style={
                styles.statPill
              }
            >

              <Text
                style={
                  styles.statPillValue
                }
              >
                {
                  culturesFiltrees.length
                }
              </Text>

              <Text
                style={
                  styles.statPillLabel
                }
              >
                résultat(s)
              </Text>

            </View>


            <Text
              style={
                styles.statHint
              }
              numberOfLines={1}
            >
              {recherche
                ? `pour "${recherche}"`
                : 'Triées par modification récente'}
            </Text>

          </View>

        </View>


        <View
          style={
            styles.listArea
          }
        >

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeOne,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeTwo,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeThree,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldLine,
              styles.fieldLineOne,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldLine,
              styles.fieldLineTwo,
            ]}
          />


          <ScrollView
            showsVerticalScrollIndicator={
              false
            }
            refreshControl={
              <RefreshControl
                refreshing={
                  refreshing
                }
                onRefresh={
                  onRefresh
                }
                tintColor={
                  colors.primary[500]
                }
              />
            }
            contentContainerStyle={
              styles.listContent
            }
          >

            {isLoadingToutesLesCultures ? (

              <View
                style={
                  styles.loadingInline
                }
              >

                <ActivityIndicator
                  size="large"
                  color={
                    colors.primary[500]
                  }
                />

                <Text
                  style={
                    styles.loadingInlineText
                  }
                >
                  Chargement des cultures...
                </Text>

              </View>

            ) : isErrorToutesLesCultures ? (

              <View
                style={
                  styles.errorInline
                }
              >

                <Text
                  style={
                    styles.errorTitle
                  }
                >
                  Impossible de charger les cultures
                </Text>

                <Text
                  style={
                    styles.errorMessage
                  }
                >
                  Vérifiez votre connexion.
                </Text>

                <Pressable
                  style={
                    styles.retryButton
                  }
                  onPress={() =>
                    refetchParcelles()
                  }
                >

                  <Text
                    style={
                      styles.retryButtonText
                    }
                  >
                    Réessayer
                  </Text>

                </Pressable>

              </View>

            ) : culturesFiltrees.length ===
              0 ? (

              <EmptyState
                icon={
                  recherche ||
                  statutFiltre !==
                    'TOUTES'
                    ? SearchX
                    : Sprout
                }
                title={
                  recherche ||
                  statutFiltre !==
                    'TOUTES'
                    ? 'Aucun résultat'
                    : 'Aucune culture'
                }
                description={
                  recherche
                    ? `Aucune culture ne correspond à "${recherche}".`
                    : statutFiltre !==
                        'TOUTES'
                      ? `Aucune culture ${nomStatut(
                          statutFiltre,
                        ).toLowerCase()}.`
                      : 'Commencez par ajouter votre première culture.'
                }
                actionLabel={
                  recherche ||
                  statutFiltre !==
                    'TOUTES'
                    ? 'Réinitialiser'
                    : 'Ajouter une culture'
                }
                onAction={() => {

                  if (
                    recherche ||
                    statutFiltre !==
                      'TOUTES'
                  ) {

                    setRecherche(
                      '',
                    );

                    setStatutFiltre(
                      'TOUTES',
                    );

                  } else {

                    ouvrirModalAjoutCulture();

                  }

                }}
              />

            ) : (

              culturesFiltrees.map(
                (culture) => (

                  <CultureCard
                    key={`${culture.parcelleId}-${culture.id}`}
                    culture={
                      culture
                    }
                    onPress={() => {

                      if (
                        !culture.parcelleId
                      ) {
                        return;
                      }

                      router.push({
                        pathname:
                          '/detail-culture',

                        params: {
                          parcelleId:
                            culture.parcelleId,

                          cultureId:
                            culture.id,

                          parcelleNom:
                            culture.parcelleNom,

                          cultureNom:
                            culture.nom,
                        },
                      });

                    }}
                  />

                ),
              )

            )}

          </ScrollView>

        </View>


        <Pressable
          onPress={
            ouvrirModalAjoutCulture
          }
          style={({ pressed }) => [
            styles.fab,

            pressed && {
              opacity: 0.9,
              transform: [
                {
                  scale: 0.94,
                },
              ],
            },
          ]}
        >

          <Plus
            size={27}
            color="#FFFFFF"
            strokeWidth={2.7}
          />

        </Pressable>


        <AppBottomBar />

        {modalChoixParcelle}

      </View>
    );
  }


  // ===================================================
  // CHARGEMENT PARCELLE
  // ===================================================

  if (
    isLoadingParcelle ||
    isLoadingCultures
  ) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <ActivityIndicator
          size="large"
          color={
            colors.primary[500]
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement des cultures...
        </Text>

      </View>
    );
  }


  // ===================================================
  // ERREUR PARCELLE
  // ===================================================

  if (
    isErrorParcelle ||
    isErrorCultures
  ) {

    return (
      <View
        style={
          styles.loadingContainer
        }
      >

        <Text
          style={
            styles.errorText
          }
        >
          Impossible de récupérer les données.
        </Text>

        <Pressable
          style={
            styles.backButton
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

        </Pressable>

      </View>
    );
  }


  // ===================================================
  // VUE D'UNE PARCELLE
  // ===================================================

  return (
    <View
      style={
        styles.root
      }
    >

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              onRefresh
            }
            tintColor={
              colors.primary[500]
            }
          />
        }
        contentContainerStyle={
          styles.detailContent
        }
      >

        {/* ===========================================
            HEADER
        ============================================ */}

        <ScreenHeader
          title="Cultures"
          subtitle={`Parcelle : ${
            parcelle?.nom ||
            parcelleNom ||
            parcelleId
          }`}
          showBack
        />


        {/* ===========================================
            SUMMARY
        ============================================ */}

        <View
          style={
            styles.summaryCard
          }
        >

          <View
            style={
              styles.summaryItem
            }
          >

            <Text
              style={
                styles.summaryValue
              }
            >
              {cultures?.length ??
                0}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Cultures
            </Text>

          </View>


          <View
            style={
              styles.summaryDivider
            }
          />


          <View
            style={
              styles.summaryItem
            }
          >

            <Text
              style={
                styles.summaryValue
              }
            >
              {
                nombreCulturesDelimitees
              }
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Délimitées
            </Text>

          </View>


          <View
            style={
              styles.summaryDivider
            }
          />


          <View
            style={
              styles.summaryItem
            }
          >

            <Text
              style={
                styles.summaryValue
              }
            >
              {parcelle?.superficie !=
              null
                ? `${Number(
                    parcelle.superficie,
                  ).toFixed(0)} m²`
                : '-'}
            </Text>

            <Text
              style={
                styles.summaryLabel
              }
            >
              Parcelle
            </Text>

          </View>

        </View>


        {/* ===========================================
            MAP
        ============================================ */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Parcelle et cultures
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            Parcelle en vert et cultures délimitées
            affichées à l'intérieur.
          </Text>

        </View>


        <View
          style={
            styles.mapCard
          }
        >

          <WebView
            ref={
              webViewRef
            }
            originWhitelist={[
              '*',
            ]}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState={false}
            source={{
              html: mapHtml,
            }}
            onLoad={() => {

              setMapReady(
                true,
              );

            }}
            onLoadEnd={() => {

              setMapReady(
                true,
              );

            }}
          />


          {loadingPoints && (
            <View
              pointerEvents="none"
              style={
                styles.mapUpdatingBadge
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
                  styles.mapUpdatingText
                }
              >
                Mise à jour des délimitations...
              </Text>

            </View>
          )}

        </View>


        {/* ===========================================
            HISTORIQUE
        ============================================ */}

        <Pressable
          style={({ pressed }) => [
            styles.historyButton,

            pressed && {
              opacity: 0.85,
            },
          ]}
          onPress={() => {

            if (!parcelleId) {
              return;
            }

            router.push({
              pathname:
                '/historique-cultures',

              params: {
                parcelleId,

                parcelleNom:
                  parcelle?.nom ||
                  parcelleNom ||
                  '',
              },
            });

          }}
        >

          <Text
            style={
              styles.historyButtonText
            }
          >
            Historique des cultures
          </Text>

          <ChevronRight
            size={17}
            color={
              colors.primary[600]
            }
          />

        </Pressable>


        {/* ===========================================
            SECTION CULTURES
        ============================================ */}

        <View
          style={
            styles.sectionHeader
          }
        >

          <Text
            style={
              styles.sectionTitle
            }
          >
            Cultures de la parcelle
          </Text>

          <Text
            style={
              styles.sectionDescription
            }
          >
            {culturesFiltrees.length}{' '}
            {culturesFiltrees.length >
            1
              ? 'cultures'
              : 'culture'}{' '}
            affichée
            {culturesFiltrees.length >
            1
              ? 's'
              : ''}{' '}
            • modification récente en premier
          </Text>

        </View>


        {/* ===========================================
            ZONE AGRICOLE
        ============================================ */}

        <View
          style={
            styles.detailListArea
          }
        >

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeOne,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldShape,
              styles.fieldShapeTwo,
            ]}
          />

          <View
            pointerEvents="none"
            style={[
              styles.fieldLine,
              styles.fieldLineOne,
            ]}
          />


          {/* RECHERCHE + FILTRE */}

          <View
            style={
              styles.localTopBar
            }
          >

            <View
              style={
                styles.searchRow
              }
            >

              <View
                style={{
                  flex: 1,
                }}
              >

                <SearchBar
                  value={
                    recherche
                  }
                  onChangeText={
                    setRecherche
                  }
                  placeholder="Rechercher une culture..."
                />

              </View>


              <Pressable
                onPress={() =>
                  setFiltreOuvert(
                    (value) =>
                      !value,
                  )
                }
                style={({ pressed }) => [
                  styles.filterBtn,

                  filtreOuvert &&
                    styles.filterBtnActive,

                  pressed && {
                    opacity: 0.8,
                  },
                ]}
              >

                <SlidersHorizontal
                  size={18}
                  color={
                    filtreOuvert
                      ? '#FFFFFF'
                      : colors.neutral[700]
                  }
                  strokeWidth={2}
                />

              </Pressable>

            </View>


            {filtreOuvert && (
              <View
                style={
                  styles.filterPanel
                }
              >

                <View
                  style={
                    styles.filterHeader
                  }
                >

                  <Text
                    style={
                      styles.filterLabel
                    }
                  >
                    Filtrer par statut
                  </Text>

                  <Pressable
                    onPress={() =>
                      setFiltreOuvert(
                        false,
                      )
                    }
                  >

                    <X
                      size={17}
                      color={
                        colors.neutral[500]
                      }
                    />

                  </Pressable>

                </View>


                <View
                  style={
                    styles.chips
                  }
                >

                  {FILTRES.map(
                    (filtre) => (
                      <Chip
                        key={
                          filtre
                        }
                        label={
                          getFiltreLabel(
                            filtre,
                          )
                        }
                        selected={
                          statutFiltre ===
                          filtre
                        }
                        onPress={() =>
                          setStatutFiltre(
                            filtre,
                          )
                        }
                      />
                    ),
                  )}

                </View>

              </View>
            )}

          </View>


          {/* LISTE */}

          <View
            style={
              styles.detailListContent
            }
          >

            {culturesFiltrees.length ===
            0 ? (

              <EmptyState
                icon={
                  recherche ||
                  statutFiltre !==
                    'TOUTES'
                    ? SearchX
                    : Sprout
                }
                title={
                  recherche ||
                  statutFiltre !==
                    'TOUTES'
                    ? 'Aucun résultat'
                    : 'Aucune culture'
                }
                description={
                  recherche
                    ? `Aucune culture ne correspond à "${recherche}".`
                    : statutFiltre !==
                        'TOUTES'
                      ? `Aucune culture ${nomStatut(
                          statutFiltre,
                        ).toLowerCase()}.`
                      : 'Cette parcelle ne contient encore aucune culture.'
                }
                actionLabel={
                  recherche ||
                  statutFiltre !==
                    'TOUTES'
                    ? 'Réinitialiser'
                    : 'Ajouter une culture'
                }
                onAction={() => {

                  if (
                    recherche ||
                    statutFiltre !==
                      'TOUTES'
                  ) {

                    setRecherche(
                      '',
                    );

                    setStatutFiltre(
                      'TOUTES',
                    );

                  } else {

                    ouvrirModalAjoutCulture();

                  }

                }}
              />

            ) : (

              culturesFiltrees.map(
                (culture) => (

                  <CultureCard
                    key={
                      culture.id
                    }
                    culture={
                      culture
                    }
                    onPress={() => {

                      router.push({
                        pathname:
                          '/detail-culture',

                        params: {
                          parcelleId,

                          cultureId:
                            culture.id,

                          parcelleNom:
                            parcelle?.nom ||
                            parcelleNom ||
                            '',

                          cultureNom:
                            culture.nom,
                        },
                      });

                    }}
                  />

                )

              )

            )}

          </View>

        </View>


        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>


      {/* FAB */}

      <Pressable
        onPress={
          ouvrirModalAjoutCulture
        }
        style={({ pressed }) => [
          styles.fab,

          pressed && {
            opacity: 0.9,
            transform: [
              {
                scale: 0.94,
              },
            ],
          },
        ]}
      >

        <Plus
          size={27}
          color="#FFFFFF"
          strokeWidth={2.7}
        />

      </Pressable>


      <AppBottomBar />

      {modalChoixParcelle}

    </View>
  );
}


// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({

  // ===================================================
  // ROOT
  // ===================================================

  root: {
    flex: 1,
    backgroundColor:
      colors.background.app,
  },


  detailContent: {
    paddingBottom: 120,
  },


  // ===================================================
  // TOP BAR
  // ===================================================

  topBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor:
      colors.border.default,
    paddingBottom: 12,
  },


  localTopBar: {
    padding: 12,
    gap: 10,
    backgroundColor:
      'rgba(255,255,255,0.88)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.8)',
    borderRadius: 16,
  },


  searchRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },


  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor:
      colors.border.default,
    alignItems: 'center',
    justifyContent: 'center',
  },


  filterBtnActive: {
    backgroundColor:
      colors.primary[500],
    borderColor:
      colors.primary[500],
  },


  filterPanel: {
    backgroundColor:
      colors.neutral[100],
    borderWidth: 1,
    borderColor:
      colors.border.default,
    borderRadius:
      radius.md,
    padding: 12,
    gap: 10,
  },


  filterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },


  filterLabel: {
    fontSize: 12,
    fontWeight: '700',
    color:
      colors.neutral[700],
    textTransform:
      'uppercase',
    letterSpacing: 0.5,
  },


  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  // ===================================================
  // STATS
  // ===================================================

  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },


  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor:
      colors.primary[50],
    borderWidth: 1,
    borderColor:
      colors.primary[100],
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius:
      radius.full,
  },


  statPillValue: {
    fontSize: 12,
    fontWeight: '800',
    color:
      colors.primary[700],
  },


  statPillLabel: {
    fontSize: 11.5,
    color:
      colors.primary[700],
    fontWeight: '600',
  },


  statHint: {
    fontSize: 12,
    color:
      colors.neutral[500],
    flex: 1,
  },


  // ===================================================
  // LISTE
  // ===================================================

  listArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#DCEBD7',
  },


  listContent: {
    padding: 16,
    gap: 12,
    paddingBottom: 120,
  },


  detailListArea: {
    position: 'relative',
    overflow: 'hidden',
    marginHorizontal: 16,
    borderRadius: 20,
    backgroundColor:
      '#DCEBD7',
    paddingBottom: 4,
  },


  detailListContent: {
    padding: 12,
    gap: 12,
  },


  // ===================================================
  // FOND AGRICOLE
  // ===================================================

  fieldShape: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.55,
  },


  fieldShapeOne: {
    width: 330,
    height: 220,
    top: -90,
    right: -130,
    backgroundColor: '#C5DEBC',
    transform: [
      {
        rotate: '-18deg',
      },
    ],
  },


  fieldShapeTwo: {
    width: 300,
    height: 200,
    bottom: 60,
    left: -150,
    backgroundColor: '#CBE4C3',
    transform: [
      {
        rotate: '18deg',
      },
    ],
  },


  fieldShapeThree: {
    width: 170,
    height: 130,
    top: 260,
    right: -70,
    backgroundColor: '#D2E7CB',
    transform: [
      {
        rotate: '-12deg',
      },
    ],
  },


  fieldLine: {
    position: 'absolute',
    height: 2,
    borderRadius: 2,
    backgroundColor: '#B8D4AE',
    opacity: 0.65,
  },


  fieldLineOne: {
    width: 360,
    top: 125,
    left: -110,
    transform: [
      {
        rotate: '-16deg',
      },
    ],
  },


  fieldLineTwo: {
    width: 330,
    top: 150,
    left: -80,
    transform: [
      {
        rotate: '-16deg',
      },
    ],
  },


  // ===================================================
  // CULTURE CARD
  // ===================================================

  cultureCard: {
    padding: 15,
    gap: 0,
    backgroundColor:
      'rgba(255,255,255,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(255,255,255,0.88)',
    borderRadius: 20,
    shadowColor: '#355D38',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.10,
    shadowRadius: 12,
    elevation: 4,
  },


  cultureHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },


  cultureIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor:
      'rgba(232,245,228,0.95)',
    borderWidth: 1,
    borderColor:
      'rgba(155,190,145,0.40)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  cultureHeaderContent: {
    flex: 1,
    minWidth: 0,
    paddingTop: 1,
  },


  cultureName: {
    fontSize: 16,
    fontWeight: '900',
    color:
      colors.neutral[900],
    letterSpacing: 0.1,
    textTransform: 'uppercase',
  },


  cultureSubtitleRow: {
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 0,
  },


  cultureSubtitle: {
    flexShrink: 1,
    fontSize: 11.5,
    color:
      colors.neutral[500],
    fontWeight: '600',
  },


  cultureSubtitleSeparator: {
    fontSize: 11,
    color:
      colors.neutral[400],
    marginHorizontal: 1,
  },


  statusContainer: {
    paddingTop: 1,
    alignItems: 'flex-end',
  },


  cardSeparator: {
    height: 1,
    backgroundColor:
      'rgba(224,232,221,0.95)',
    marginTop: 15,
    marginBottom: 15,
  },


  // ===================================================
  // PROGRESSION
  // ===================================================

  progressSection: {
    gap: 0,
  },


  progressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },


  progressTitleArea: {
    flex: 1,
    paddingRight: 10,
  },


  progressTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color:
      colors.neutral[700],
    letterSpacing: 0.65,
  },


  progressLabelActive: {
    marginTop: 4,
    fontSize: 11.5,
    color:
      colors.primary[700],
    fontWeight: '700',
  },


  progressLabelInactive: {
    marginTop: 4,
    fontSize: 11.5,
    color:
      colors.neutral[500],
    fontWeight: '600',
  },


  progressPercent: {
    fontSize: 15,
    color:
      colors.primary[700],
    fontWeight: '900',
  },


  progressPercentInactive: {
    fontSize: 15,
    color:
      colors.neutral[400],
    fontWeight: '800',
  },


  progressTimeline: {
    position: 'relative',
    height: 48,
    marginTop: 10,
  },


  progressLineBackground: {
    position: 'absolute',
    top: 4,
    left: 5.5,
    right: 5.5,
    height: 4,
    borderRadius: 999,
    backgroundColor:
      '#DDE6DA',
  },


  progressLineActive: {
    position: 'absolute',
    top: 4,
    left: 5.5,
    height: 4,
    borderRadius: 999,
    backgroundColor:
      colors.primary[500],
  },


  progressNodeRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },


  progressNodeItem: {
    flex: 1,
  },


  progressNodeStart: {
    alignItems: 'flex-start',
  },


  progressNodeCenter: {
    alignItems: 'center',
  },


  progressNodeEnd: {
    alignItems: 'flex-end',
  },


  progressNode: {
    width: 11,
    height: 11,
    borderRadius: 999,
    backgroundColor:
      '#D2DBD0',
    borderWidth: 2,
    borderColor:
      '#FFFFFF',
  },


  progressNodeActive: {
    backgroundColor:
      colors.primary[500],
    borderColor:
      colors.primary[500],
  },


  progressNodeInactive: {
    backgroundColor:
      '#C8D0C7',
    borderColor:
      '#C8D0C7',
  },


  progressNodeLabel: {
    marginTop: 7,
    fontSize: 9.5,
    color:
      colors.neutral[400],
    fontWeight: '600',
  },


  progressNodeLabelActive: {
    color:
      colors.primary[700],
    fontWeight: '800',
  },


  // ===================================================
  // PARCELLE
  // ===================================================

  parcelleCard: {
    marginTop: 2,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor:
      'rgba(246,250,244,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(218,229,214,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
  },


  parcelleCardLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },


  parcelleCardText: {
    flex: 1,
    minWidth: 0,
  },


  parcelleCardLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color:
      colors.neutral[500],
    letterSpacing: 0.65,
  },


  parcelleCardValue: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },


  // ===================================================
  // INFOS 2 × 2
  // ===================================================

  infoGrid: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },


  infoCard: {
    width: '48%',
    minHeight: 70,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor:
      'rgba(248,250,247,0.92)',
    borderWidth: 1,
    borderColor:
      'rgba(222,230,219,0.95)',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },


  infoCardIcon: {
    width: 29,
    height: 29,
    borderRadius: 9,
    backgroundColor:
      'rgba(232,245,228,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },


  infoCardContent: {
    flex: 1,
    minWidth: 0,
  },


  infoCardLabel: {
    fontSize: 8.8,
    fontWeight: '900',
    color:
      colors.neutral[500],
    letterSpacing: 0.55,
  },


  infoCardValue: {
    marginTop: 4,
    fontSize: 11.5,
    lineHeight: 15,
    color:
      colors.neutral[800],
    fontWeight: '700',
  },


  infoCardValueActive: {
    color:
      colors.primary[700],
  },


  // ===================================================
  // FOOTER
  // ===================================================

  cardFooter: {
    marginTop: 13,
    paddingTop: 11,
    borderTopWidth: 1,
    borderTopColor:
      'rgba(226,233,224,0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    gap: 10,
  },


  modifiedInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },


  modifiedText: {
    flex: 1,
    fontSize: 10.5,
    color:
      colors.neutral[400],
    fontWeight: '600',
  },


  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },


  detailsButtonText: {
    fontSize: 11.5,
    color:
      colors.primary[700],
    fontWeight: '900',
  },


  // ===================================================
  // SUMMARY
  // ===================================================

  summaryCard: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 18,
    backgroundColor:
      'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor:
      colors.border.default,
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-around',
  },


  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },


  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },


  summaryLabel: {
    fontSize: 11,
    color:
      colors.neutral[500],
    fontWeight: '600',
  },


  summaryDivider: {
    width: 1,
    height: 34,
    backgroundColor:
      colors.border.default,
  },


  // ===================================================
  // SECTION
  // ===================================================

  sectionHeader: {
    paddingHorizontal: 16,
    marginBottom: 10,
  },


  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color:
      colors.neutral[900],
    letterSpacing: -0.3,
  },


  sectionDescription: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 18,
    color:
      colors.neutral[500],
  },


  // ===================================================
  // MAP
  // ===================================================

  mapCard: {
    height: 420,
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor:
      colors.neutral[200],
    borderWidth: 1,
    borderColor:
      colors.border.default,
  },


  mapUpdatingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor:
      'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor:
      'rgba(218,229,214,0.95)',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 5,
    elevation: 3,
  },


  mapUpdatingText: {
    fontSize: 11,
    color:
      colors.neutral[700],
    fontWeight: '700',
  },


  // ===================================================
  // HISTORIQUE
  // ===================================================

  historyButton: {
    marginHorizontal: 16,
    marginBottom: 20,
    minHeight: 48,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor:
      colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'center',
    gap: 5,
  },


  historyButtonText: {
    color:
      colors.primary[700],
    fontSize: 13.5,
    fontWeight: '800',
  },


  // ===================================================
  // LOADING
  // ===================================================

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
    backgroundColor:
      colors.background.app,
  },


  loadingText: {
    fontSize: 14,
    color:
      colors.neutral[500],
  },


  loadingInline: {
    paddingVertical: 45,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },


  loadingInlineText: {
    fontSize: 13,
    color:
      colors.neutral[500],
  },


  // ===================================================
  // ERROR
  // ===================================================

  errorInline: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },


  errorTitle: {
    fontSize: 16,
    fontWeight: '800',
    color:
      colors.neutral[900],
    textAlign: 'center',
  },


  errorMessage: {
    marginTop: 6,
    fontSize: 13,
    color:
      colors.neutral[500],
    textAlign: 'center',
  },


  retryButton: {
    marginTop: 15,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor:
      colors.primary[500],
  },


  retryButtonText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '800',
  },


  errorText: {
    fontSize: 15,
    color: '#D32F2F',
    textAlign: 'center',
  },


  backButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor:
      colors.primary[500],
  },


  backButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },


  // ===================================================
  // FAB
  // ===================================================

  fab: {
    position: 'absolute',
    right: 20,
    bottom: 88,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor:
      colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor:
      colors.primary[700],
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 7,
  },


  bottomSpace: {
    height: 100,
  },


  // ===================================================
  // MODAL
  // ===================================================

  modalOverlay: {
    flex: 1,
    backgroundColor:
      'rgba(16,24,16,0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },


  modalCard: {
    width: '100%',
    maxHeight: '80%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 15,
  },


  modalHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent:
      'space-between',
  },


  modalHeaderText: {
    flex: 1,
    paddingRight: 12,
  },


  modalTitle: {
    fontSize: 19,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },


  modalSubtitle: {
    marginTop: 5,
    fontSize: 12.5,
    lineHeight: 18,
    color:
      colors.neutral[500],
  },


  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor:
      colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },


  modalDivider: {
    height: 1,
    backgroundColor:
      colors.border.default,
    marginVertical: 14,
  },


  modalParcellesScroll: {
    maxHeight: 430,
  },


  modalParcelleItem: {
    minHeight: 68,
    marginBottom: 9,
    paddingHorizontal: 11,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor:
      colors.border.default,
    borderRadius: 13,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },


  modalParcelleItemSelected: {
    borderColor:
      colors.primary[500],
    backgroundColor:
      colors.primary[50],
  },


  modalParcelleIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor:
      colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },


  modalParcelleInfo: {
    flex: 1,
  },


  modalParcelleNom: {
    fontSize: 14,
    fontWeight: '800',
    color:
      colors.neutral[900],
  },


  modalParcelleSuperficie: {
    marginTop: 3,
    fontSize: 11.5,
    color:
      colors.neutral[500],
  },


  modalCheck: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor:
      colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },


  modalLoading: {
    paddingVertical: 35,
    alignItems: 'center',
    gap: 12,
  },


  modalLoadingText: {
    color:
      colors.neutral[500],
    fontSize: 13,
  },


  modalEmpty: {
    paddingVertical: 30,
    alignItems: 'center',
  },


  modalEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color:
      colors.neutral[900],
    textAlign: 'center',
  },


  modalEmptyText: {
    marginTop: 6,
    fontSize: 13,
    color:
      colors.neutral[500],
    textAlign: 'center',
    lineHeight: 19,
  },

});