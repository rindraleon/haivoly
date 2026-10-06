/* eslint-disable react/no-unescaped-entities */

import { useCallback, useMemo, useState, } from 'react';

import { ActivityIndicator, Alert, Image, Modal, Pressable, RefreshControl, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';

import { CalendarDays, Camera, Check, ChevronDown, ChevronRight, Clock3, FileText, MapPin, Pencil, Plus, Search, SlidersHorizontal, Sprout, Trash2, X,} from 'lucide-react-native';

import * as ImagePicker from 'expo-image-picker';

import { router, useFocusEffect, useLocalSearchParams,} from 'expo-router';

import { useQueries } from '@tanstack/react-query';

import { useDeleteObservation, useObservations,} from '@/hooks/useObservations';

import { useDeletePhotoObservation, usePhotosObservation, useUploadPhotoObservation,} from '@/hooks/usePhotosObservations';

import { useParcelles } from '@/hooks/useParcelles';

import { useCultures } from '@/hooks/useCultures';

import { getCultures, type Culture, } from '@/api/cultures';

import { getObservations, } from '@/api/observations';

import type { Observation, PhotoObservation, } from '@/api/observations';

import { AppBottomBar } from '@/components/layout/AppBottomBar';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ScreenHeader } from '@/components/ui/ScreenHeader';

import { colors, radius, } from '@/design/tokens';

import { getMediaUrl } from '@/utils/mediaUrl';

// ======================================================
// TYPES
// ======================================================

type StatutCulture =
  | 'PLANIFIEE'
  | 'EN_COURS'
  | 'RECOLTEE'
  | 'ABANDONNEE'
  | 'SUPPRIMEE';

interface CultureGlobale extends Culture {
  parcelleId: string;
  parcelleNom: string;
}

interface ObservationGlobale {
  observation: Observation;
  parcelleId: string;
  parcelleNom: string;
  cultureId: string;
  cultureNom: string;
  statutCulture: StatutCulture;
}

// ======================================================
// OUTILS
// ======================================================

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
// ECRAN
// ======================================================

export default function ObservationsScreen() {
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
      : undefined;

  // ====================================================
  // FILTRE
  // ====================================================

  const [
    filtreOuvert,
    setFiltreOuvert,
  ] =
    useState(false);

  const [
    parcelleSelectionnee,
    setParcelleSelectionnee,
  ] =
    useState('');

  const [
    cultureSelectionnee,
    setCultureSelectionnee,
  ] =
    useState('');

  const [
    parcelleTemporaire,
    setParcelleTemporaire,
  ] =
    useState('');

  const [
    cultureTemporaire,
    setCultureTemporaire,
  ] =
    useState('');

  const [
    selectionParcelleOuverte,
    setSelectionParcelleOuverte,
  ] =
    useState(false);

  const [
    selectionCultureOuverte,
    setSelectionCultureOuverte,
  ] =
    useState(false);

  // ====================================================
  // AJOUT GLOBAL
  // ====================================================

  const [
    ajoutOuvert,
    setAjoutOuvert,
  ] =
    useState(false);

  const [
    parcelleAjout,
    setParcelleAjout,
  ] =
    useState('');

  const [
    cultureAjout,
    setCultureAjout,
  ] =
    useState('');

  const [
    selectionParcelleAjoutOuverte,
    setSelectionParcelleAjoutOuverte,
  ] =
    useState(false);

  const [
    selectionCultureAjoutOuverte,
    setSelectionCultureAjoutOuverte,
  ] =
    useState(false);

  const [
    recherche,
    setRecherche,
  ] =
    useState('');

  // ====================================================
  // PARCELLES
  // ====================================================

  const parcellesQuery =
    useParcelles();

  const parcelles =
    parcellesQuery.data ?? [];

  // ====================================================
  // CULTURES FILTRE
  // ====================================================

  const culturesQuery =
    useCultures(
      parcelleTemporaire,
    );

  const culturesFiltre =
    culturesQuery.data ?? [];

  // ====================================================
  // CULTURES AJOUT
  // ====================================================

  const culturesAjoutQuery =
    useCultures(
      parcelleAjout,
    );

  const culturesAjout =
    culturesAjoutQuery.data ?? [];

  // ====================================================
  // CULTURES GLOBALES
  // ====================================================

  const culturesGlobalesQueries =
    useQueries({
      queries:
        parcelles.map(
          parcelle => ({
            queryKey: [
              'cultures',
              parcelle.id,
            ],

            queryFn: () =>
              getCultures(
                parcelle.id,
              ),

            enabled:
              !!parcelle.id,
          }),
        ),
    });

  const culturesGlobales =
    useMemo<CultureGlobale[]>(() => {
      const resultat: CultureGlobale[] =
        [];

      parcelles.forEach(
        (
          parcelle,
          index,
        ) => {
          const culturesParcelle =
            culturesGlobalesQueries[
              index
            ]?.data ?? [];

          culturesParcelle.forEach(
            culture => {
              if (
                culture.statut ===
                'SUPPRIMEE'
              ) {
                return;
              }

              resultat.push({
                ...culture,

                parcelleId:
                  parcelle.id,

                parcelleNom:
                  parcelle.nom,
              });
            },
          );
        },
      );

      return resultat;
    }, [
      parcelles,
      culturesGlobalesQueries,
    ]);

  // ====================================================
  // OBSERVATIONS GLOBALES
  // ====================================================

  const observationsGlobalesQueries =
    useQueries({
      queries:
        culturesGlobales.map(
          culture => ({
            queryKey: [
              'observations',
              culture.parcelleId,
              culture.id,
            ],

            queryFn: () =>
              getObservations(
                culture.parcelleId,
                culture.id,
              ),

            enabled:
              !!culture.parcelleId &&
              !!culture.id,
          }),
        ),
    });

  const observationsGlobales =
    useMemo<ObservationGlobale[]>(() => {
      const resultat: ObservationGlobale[] =
        [];

      culturesGlobales.forEach(
        (
          culture,
          index,
        ) => {
          const observations =
            observationsGlobalesQueries[
              index
            ]?.data ?? [];

          observations.forEach(
            observation => {
              resultat.push({
                observation,

                parcelleId:
                  culture.parcelleId,

                parcelleNom:
                  culture.parcelleNom,

                cultureId:
                  culture.id,

                cultureNom:
                  culture.nom,

                statutCulture:
                  culture.statut as StatutCulture,
              });
            },
          );
        },
      );

      return resultat.sort(
        (a, b) =>
          new Date(
            b.observation.date,
          ).getTime() -
          new Date(
            a.observation.date,
          ).getTime(),
      );
    }, [
      culturesGlobales,
      observationsGlobalesQueries,
    ]);

  // ====================================================
  // FILTRE GLOBAL
  // ====================================================

  const observationsGlobalesFiltrees =
    useMemo(() => {
      const terme =
        recherche
          .trim()
          .toLowerCase();

      return observationsGlobales.filter(
        item => {
          const correspondRecherche =
            !terme ||
            item.observation.description
              ?.toLowerCase()
              .includes(terme) ||
            item.cultureNom
              ?.toLowerCase()
              .includes(terme) ||
            item.parcelleNom
              ?.toLowerCase()
              .includes(terme);

          const correspondParcelle =
            !parcelleSelectionnee ||
            item.parcelleId ===
              parcelleSelectionnee;

          const correspondCulture =
            !cultureSelectionnee ||
            item.cultureId ===
              cultureSelectionnee;

          return (
            correspondRecherche &&
            correspondParcelle &&
            correspondCulture
          );
        },
      );
    }, [
      observationsGlobales,
      recherche,
      parcelleSelectionnee,
      cultureSelectionnee,
    ]);

  const filtreActif =
    !!parcelleSelectionnee ||
    !!cultureSelectionnee;

  // ====================================================
  // STATISTIQUES
  // ====================================================

  const statistiquesGlobales =
    useMemo(() => {
      const total =
        observationsGlobales.length;

      const recentes =
        observationsGlobales.filter(
          item => {
            const timestamp =
              new Date(
                item.observation.date,
              ).getTime();

            const septJours =
              7 *
              24 *
              60 *
              60 *
              1000;

            return (
              Number.isFinite(
                timestamp,
              ) &&
              Date.now() -
                timestamp <=
                septJours
            );
          },
        ).length;

      return {
        total,
        recentes,
      };
    }, [
      observationsGlobales,
    ]);

  // ====================================================
  // CHARGEMENT GLOBAL
  // ====================================================

  const chargementGlobal =
    parcellesQuery.isLoading ||
    culturesGlobalesQueries.some(
      query =>
        query.isLoading,
    ) ||
    observationsGlobalesQueries.some(
      query =>
        query.isLoading,
    );

  const erreurGlobal =
    parcellesQuery.isError ||
    culturesGlobalesQueries.some(
      query =>
        query.isError,
    ) ||
    observationsGlobalesQueries.some(
      query =>
        query.isError,
    );

  // ====================================================
  // REGLES CULTURE
  // ====================================================

  const cultureSupprimee =
    statut === 'SUPPRIMEE';

  const lectureSeule =
    statut === 'RECOLTEE' ||
    statut === 'ABANDONNEE';

  const modificationAutorisee =
    !cultureSupprimee &&
    !lectureSeule;

  // ====================================================
  // REFRESH
  // ====================================================

  const [
    refreshing,
    setRefreshing,
  ] =
    useState(false);

  // ====================================================
  // OBSERVATIONS CULTURE
  // ====================================================

  const observationsQuery =
    useObservations(
      parcelleId,
      cultureId,
    );

  const observations =
    observationsQuery.data ?? [];

  const observationsFiltrees =
    useMemo(() => {
      const terme =
        recherche
          .trim()
          .toLowerCase();

      if (!terme) {
        return observations;
      }

      return observations.filter(
        item =>
          item.description
            ?.toLowerCase()
            .includes(terme),
      );
    }, [
      observations,
      recherche,
    ]);

  // ====================================================
  // DELETE
  // ====================================================

  const deleteMutation =
    useDeleteObservation();

  // ====================================================
  // CHARGEMENT
  // ====================================================

  const chargerObservations =
    useCallback(
      async () => {
        if (
          !parcelleId ||
          !cultureId
        ) {
          return;
        }

        await observationsQuery.refetch();
      },
      [
        parcelleId,
        cultureId,
        observationsQuery,
      ],
    );

  useFocusEffect(
    useCallback(
      () => {
        if (
          !parcelleId ||
          !cultureId
        ) {
          return;
        }

        chargerObservations();
      },
      [
        parcelleId,
        cultureId,
        chargerObservations,
      ],
    ),
  );

  // ====================================================
  // REFRESH
  // ====================================================

  const actualiser =
    useCallback(
      async () => {
        setRefreshing(true);

        try {
          if (
            parcelleId &&
            cultureId
          ) {
            await observationsQuery.refetch();
          }

          await Promise.all(
            observationsGlobalesQueries.map(
              query =>
                query.refetch(),
            ),
          );
        } finally {
          setRefreshing(false);
        }
      },
      [
        parcelleId,
        cultureId,
        observationsQuery,
        observationsGlobalesQueries,
      ],
    );

  // ====================================================
  // FILTRE
  // ====================================================

  const ouvrirFiltre =
    () => {
      setParcelleTemporaire(
        parcelleSelectionnee,
      );

      setCultureTemporaire(
        cultureSelectionnee,
      );

      setSelectionParcelleOuverte(
        false,
      );

      setSelectionCultureOuverte(
        false,
      );

      setFiltreOuvert(true);
    };

  const fermerFiltre =
    () => {
      setSelectionParcelleOuverte(
        false,
      );

      setSelectionCultureOuverte(
        false,
      );

      setFiltreOuvert(false);
    };

  const appliquerFiltre =
    () => {
      setParcelleSelectionnee(
        parcelleTemporaire,
      );

      setCultureSelectionnee(
        cultureTemporaire,
      );

      setSelectionParcelleOuverte(
        false,
      );

      setSelectionCultureOuverte(
        false,
      );

      setFiltreOuvert(false);
    };

  const reinitialiserFiltre =
    () => {
      setParcelleTemporaire('');
      setCultureTemporaire('');
      setParcelleSelectionnee('');
      setCultureSelectionnee('');

      setSelectionParcelleOuverte(
        false,
      );

      setSelectionCultureOuverte(
        false,
      );
    };

  // ====================================================
  // SELECTION FILTRE
  // ====================================================

  const parcellePourSelection =
    useMemo(() => {
      return parcelles.find(
        item =>
          item.id ===
          parcelleTemporaire,
      );
    }, [
      parcelles,
      parcelleTemporaire,
    ]);

  const culturePourSelection =
    useMemo(() => {
      return culturesFiltre.find(
        item =>
          item.id ===
          cultureTemporaire,
      );
    }, [
      culturesFiltre,
      cultureTemporaire,
    ]);

  // ====================================================
  // VOIR SUIVI
  // ====================================================

  const voirSuivi =
    () => {
      if (
        !parcelleTemporaire
      ) {
        Alert.alert(
          'Sélection incomplète',
          'Veuillez sélectionner une parcelle.',
        );

        return;
      }

      if (
        !cultureTemporaire
      ) {
        Alert.alert(
          'Sélection incomplète',
          'Veuillez sélectionner une culture.',
        );

        return;
      }

      const parcelle =
        parcelles.find(
          item =>
            item.id ===
            parcelleTemporaire,
        );

      const culture =
        culturesFiltre.find(
          item =>
            item.id ===
            cultureTemporaire,
        );

      if (
        !parcelle ||
        !culture
      ) {
        Alert.alert(
          'Erreur',
          'La parcelle ou la culture sélectionnée est introuvable.',
        );

        return;
      }

      setFiltreOuvert(false);

      router.push({
        pathname:
          '/observations',

        params: {
          parcelleId:
            parcelle.id,

          cultureId:
            culture.id,

          parcelleNom:
            parcelle.nom,

          cultureNom:
            culture.nom,

          statut:
            culture.statut,
        },
      });
    };

  // ====================================================
  // AJOUT DEPUIS CULTURE
  // ====================================================

  const ouvrirAjout =
    () => {
      if (
        !parcelleId ||
        !cultureId
      ) {
        return;
      }

      if (!modificationAutorisee) {
        Alert.alert(
          'Action impossible',
          'Cette culture est en lecture seule.',
        );

        return;
      }

      router.push({
        pathname:
          '/ajout-observation',

        params: {
          parcelleId,
          cultureId,
          parcelleNom,
          cultureNom,
          statut:
            statut ??
            'EN_COURS',
        },
      });
    };

  // ====================================================
  // AJOUT GLOBAL
  // ====================================================

  const ouvrirAjoutGlobal =
    () => {
      setParcelleAjout('');
      setCultureAjout('');

      setSelectionParcelleAjoutOuverte(
        false,
      );

      setSelectionCultureAjoutOuverte(
        false,
      );

      setAjoutOuvert(true);
    };

  const fermerAjoutGlobal =
    () => {
      setSelectionParcelleAjoutOuverte(
        false,
      );

      setSelectionCultureAjoutOuverte(
        false,
      );

      setAjoutOuvert(false);
    };

  const continuerAjoutGlobal =
    () => {
      if (!parcelleAjout) {
        Alert.alert(
          'Sélection incomplète',
          'Veuillez sélectionner une parcelle.',
        );

        return;
      }

      if (!cultureAjout) {
        Alert.alert(
          'Sélection incomplète',
          'Veuillez sélectionner une culture.',
        );

        return;
      }

      const parcelle =
        parcelles.find(
          item =>
            item.id ===
            parcelleAjout,
        );

      const culture =
        culturesAjout.find(
          item =>
            item.id ===
            cultureAjout,
        );

      if (
        !parcelle ||
        !culture
      ) {
        Alert.alert(
          'Erreur',
          'La parcelle ou la culture sélectionnée est introuvable.',
        );

        return;
      }

      const autorisee =
        culture.statut !==
          'SUPPRIMEE' &&
        culture.statut !==
          'RECOLTEE' &&
        culture.statut !==
          'ABANDONNEE';

      if (!autorisee) {
        Alert.alert(
          'Action impossible',
          'Cette culture est en lecture seule. Vous ne pouvez pas ajouter une observation.',
        );

        return;
      }

      setAjoutOuvert(false);

      router.push({
        pathname:
          '/ajout-observation',

        params: {
          parcelleId:
            parcelle.id,

          cultureId:
            culture.id,

          parcelleNom:
            parcelle.nom,

          cultureNom:
            culture.nom,

          statut:
            culture.statut,
        },
      });
    };

  // ====================================================
  // MODIFICATION
  // ====================================================

  const ouvrirModification =
    (
      observation: Observation,
    ) => {
      if (!modificationAutorisee) {
        return;
      }

      router.push({
        pathname:
          '/modifier-observation',

        params: {
          parcelleId,
          cultureId,
          observationId:
            observation.id,
          parcelleNom,
          cultureNom,
          statut:
            statut ??
            'EN_COURS',
        },
      });
    };

  const ouvrirModificationGlobale =
    (
      item: ObservationGlobale,
    ) => {
      const autorisee =
        item.statutCulture !==
          'SUPPRIMEE' &&
        item.statutCulture !==
          'RECOLTEE' &&
        item.statutCulture !==
          'ABANDONNEE';

      if (!autorisee) {
        return;
      }

      router.push({
        pathname:
          '/modifier-observation',

        params: {
          parcelleId:
            item.parcelleId,

          cultureId:
            item.cultureId,

          observationId:
            item.observation.id,

          parcelleNom:
            item.parcelleNom,

          cultureNom:
            item.cultureNom,

          statut:
            item.statutCulture,
        },
      });
    };

  // ====================================================
  // SUPPRESSION
  // ====================================================

  const confirmerSuppression =
    (
      observation: Observation,
    ) => {
      if (
        !modificationAutorisee ||
        !parcelleId ||
        !cultureId
      ) {
        return;
      }

      Alert.alert(
        'Supprimer',
        'Voulez-vous vraiment supprimer cette observation ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },

          {
            text: 'Supprimer',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await deleteMutation.mutateAsync(
                    {
                      parcelleId,
                      cultureId,
                      observationId:
                        observation.id,
                    },
                  );

                  Alert.alert(
                    'Succès',
                    'Observation supprimée avec succès.',
                  );

                  await observationsQuery.refetch();

                  await Promise.all(
                    observationsGlobalesQueries.map(
                      query =>
                        query.refetch(),
                    ),
                  );
                } catch (
                  error: any
                ) {
                  console.error(
                    'ERREUR SUPPRESSION OBSERVATION:',
                    error?.response
                      ?.data ||
                      error,
                  );

                  Alert.alert(
                    'Erreur',
                    error?.response
                      ?.data
                      ?.message ||
                      "Impossible de supprimer l'observation.",
                  );
                }
              },
          },
        ],
      );
    };

  const confirmerSuppressionGlobale =
    (
      item: ObservationGlobale,
    ) => {
      const autorisee =
        item.statutCulture !==
          'SUPPRIMEE' &&
        item.statutCulture !==
          'RECOLTEE' &&
        item.statutCulture !==
          'ABANDONNEE';

      if (!autorisee) {
        return;
      }

      Alert.alert(
        'Supprimer',
        'Voulez-vous vraiment supprimer cette observation ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },

          {
            text: 'Supprimer',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await deleteMutation.mutateAsync(
                    {
                      parcelleId:
                        item.parcelleId,

                      cultureId:
                        item.cultureId,

                      observationId:
                        item.observation.id,
                    },
                  );

                  Alert.alert(
                    'Succès',
                    'Observation supprimée avec succès.',
                  );

                  await Promise.all(
                    observationsGlobalesQueries.map(
                      query =>
                        query.refetch(),
                    ),
                  );
                } catch (
                  error: any
                ) {
                  console.error(
                    'ERREUR SUPPRESSION OBSERVATION:',
                    error?.response
                      ?.data ||
                      error,
                  );

                  Alert.alert(
                    'Erreur',
                    error?.response
                      ?.data
                      ?.message ||
                      "Impossible de supprimer l'observation.",
                  );
                }
              },
          },
        ],
      );
    };

  // ====================================================
  // MODE GLOBAL
  // ====================================================

  if (
    !parcelleId ||
    !cultureId
  ) {
    return (
      <View
        style={
          styles.root
        }
      >
        <ScreenHeader
          title="Observations"
          subtitle={`${statistiquesGlobales.total} observation${
            statistiquesGlobales.total >
            1
              ? 's'
              : ''
          } • ${
            statistiquesGlobales.recentes
          } récentes`}
        />

        {/* ==================================================
            BARRE RECHERCHE / FILTRE
        ================================================== */}

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
              style={
                styles.searchContainer
              }
            >
              <Search
                size={19}
                color="#9CA3AF"
                strokeWidth={2}
              />

              <TextInput
                style={
                  styles.searchInput
                }
                placeholder="Rechercher observation, culture, parcelle..."
                placeholderTextColor="#9CA3AF"
                value={
                  recherche
                }
                onChangeText={
                  setRecherche
                }
                returnKeyType="search"
              />

              {recherche ? (
                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={() =>
                    setRecherche('')
                  }
                  style={
                    styles.clearSearchButton
                  }
                >
                  <X
                    size={17}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.filterButton,
                filtreActif &&
                  styles.filterButtonActive,
              ]}
              onPress={
                ouvrirFiltre
              }
            >
              <SlidersHorizontal
                size={19}
                color={
                  filtreActif
                    ? '#FFFFFF'
                    : colors.neutral[700]
                }
                strokeWidth={2}
              />

              {filtreActif ? (
                <View
                  style={
                    styles.filterIndicator
                  }
                />
              ) : null}
            </TouchableOpacity>
          </View>

          {/* FILTRE OUVERT */}

          {filtreOuvert ? (
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
                  Filtrer les observations
                </Text>

                <TouchableOpacity
                  activeOpacity={0.75}
                  onPress={
                    fermerFiltre
                  }
                >
                  <X
                    size={17}
                    color={
                      colors.neutral[500]
                    }
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                style={
                  styles.filterSelect
                }
                onPress={() => {
                  setSelectionParcelleOuverte(
                    value =>
                      !value,
                  );

                  setSelectionCultureOuverte(
                    false,
                  );
                }}
              >
                <View
                  style={
                    styles.filterSelectLeft
                  }
                >
                  <View
                    style={
                      styles.filterSelectIcon
                    }
                  >
                    <MapPin
                      size={17}
                      color={
                        colors.primary[600]
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.filterSelectText,
                      !parcelleTemporaire &&
                        styles.filterSelectPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {parcellePourSelection?.nom ??
                      'Sélectionner une parcelle'}
                  </Text>
                </View>

                <ChevronDown
                  size={18}
                  color={
                    colors.neutral[500]
                  }
                  style={
                    selectionParcelleOuverte
                      ? styles.chevronRotated
                      : undefined
                  }
                />
              </TouchableOpacity>

              {selectionParcelleOuverte ? (
                <View
                  style={
                    styles.filterDropdown
                  }
                >
                  {parcellesQuery.isLoading ? (
                    <View
                      style={
                        styles.dropdownLoading
                      }
                    >
                      <ActivityIndicator
                        color={
                          colors.primary[600]
                        }
                      />
                    </View>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled
                      style={
                        styles.filterDropdownScroll
                      }
                    >
                      {parcelles.length ===
                      0 ? (
                        <Text
                          style={
                            styles.dropdownEmpty
                          }
                        >
                          Aucune parcelle disponible.
                        </Text>
                      ) : (
                        parcelles.map(
                          item => (
                            <TouchableOpacity
                              key={
                                item.id
                              }
                              activeOpacity={0.7}
                              style={[
                                styles.filterDropdownItem,
                                parcelleTemporaire ===
                                  item.id &&
                                  styles.filterDropdownItemSelected,
                              ]}
                              onPress={() => {
                                setParcelleTemporaire(
                                  item.id,
                                );

                                setCultureTemporaire(
                                  '',
                                );

                                setSelectionParcelleOuverte(
                                  false,
                                );
                              }}
                            >
                              <View
                                style={
                                  styles.dropdownItemLeft
                                }
                              >
                                <MapPin
                                  size={15}
                                  color={
                                    parcelleTemporaire ===
                                    item.id
                                      ? colors.primary[600]
                                      : colors.neutral[400]
                                  }
                                />

                                <Text
                                  style={[
                                    styles.filterDropdownItemText,
                                    parcelleTemporaire ===
                                      item.id &&
                                      styles.filterDropdownItemTextSelected,
                                  ]}
                                >
                                  {
                                    item.nom
                                  }
                                </Text>
                              </View>

                              {parcelleTemporaire ===
                              item.id ? (
                                <Check
                                  size={17}
                                  color={
                                    colors.primary[600]
                                  }
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              ) : null}
                            </TouchableOpacity>
                          ),
                        )
                      )}
                    </ScrollView>
                  )}
                </View>
              ) : null}

              <TouchableOpacity
                activeOpacity={
                  parcelleTemporaire
                    ? 0.8
                    : 1
                }
                disabled={
                  !parcelleTemporaire
                }
                style={[
                  styles.filterSelect,
                  styles.filterSelectSecond,
                  !parcelleTemporaire &&
                    styles.filterSelectDisabled,
                ]}
                onPress={() => {
                  setSelectionCultureOuverte(
                    value =>
                      !value,
                  );

                  setSelectionParcelleOuverte(
                    false,
                  );
                }}
              >
                <View
                  style={
                    styles.filterSelectLeft
                  }
                >
                  <View
                    style={[
                      styles.filterSelectIcon,
                      !parcelleTemporaire &&
                        styles.filterSelectIconDisabled,
                    ]}
                  >
                    <Sprout
                      size={17}
                      color={
                        parcelleTemporaire
                          ? colors.primary[600]
                          : colors.neutral[400]
                      }
                    />
                  </View>

                  <Text
                    style={[
                      styles.filterSelectText,
                      !cultureTemporaire &&
                        styles.filterSelectPlaceholder,
                    ]}
                    numberOfLines={1}
                  >
                    {parcelleTemporaire
                      ? culturePourSelection?.nom ??
                        'Sélectionner une culture'
                      : 'Choisissez d’abord une parcelle'}
                  </Text>
                </View>

                <ChevronDown
                  size={18}
                  color={
                    parcelleTemporaire
                      ? colors.neutral[500]
                      : colors.neutral[300]
                  }
                  style={
                    selectionCultureOuverte
                      ? styles.chevronRotated
                      : undefined
                  }
                />
              </TouchableOpacity>

              {selectionCultureOuverte &&
              parcelleTemporaire ? (
                <View
                  style={
                    styles.filterDropdown
                  }
                >
                  {culturesQuery.isLoading ? (
                    <View
                      style={
                        styles.dropdownLoading
                      }
                    >
                      <ActivityIndicator
                        color={
                          colors.primary[600]
                        }
                      />

                      <Text
                        style={
                          styles.dropdownLoadingText
                        }
                      >
                        Chargement des cultures...
                      </Text>
                    </View>
                  ) : culturesQuery.isError ? (
                    <View
                      style={
                        styles.dropdownLoading
                      }
                    >
                      <Text
                        style={
                          styles.dropdownError
                        }
                      >
                        Impossible de charger les
                        cultures.
                      </Text>
                    </View>
                  ) : (
                    <ScrollView
                      nestedScrollEnabled
                      style={
                        styles.filterDropdownScroll
                      }
                    >
                      {culturesFiltre
                        .filter(
                          culture =>
                            culture.statut !==
                            'SUPPRIMEE',
                        )
                        .map(
                          culture => (
                            <TouchableOpacity
                              key={
                                culture.id
                              }
                              activeOpacity={0.7}
                              style={[
                                styles.filterCultureItem,
                                cultureTemporaire ===
                                  culture.id &&
                                  styles.filterCultureItemSelected,
                              ]}
                              onPress={() => {
                                setCultureTemporaire(
                                  culture.id,
                                );

                                setSelectionCultureOuverte(
                                  false,
                                );
                              }}
                            >
                              <View
                                style={
                                  styles.filterCultureInfo
                                }
                              >
                                <View
                                  style={
                                    styles.filterCultureNameRow
                                  }
                                >
                                  <Sprout
                                    size={15}
                                    color={
                                      colors.primary[600]
                                    }
                                  />

                                  <Text
                                    style={
                                      styles.filterCultureName
                                    }
                                    numberOfLines={1}
                                  >
                                    {
                                      culture.nom
                                    }
                                  </Text>
                                </View>

                                <Text
                                  style={
                                    styles.filterCultureStatus
                                  }
                                >
                                  {nomStatut(
                                    culture.statut,
                                  )}
                                </Text>
                              </View>

                              {cultureTemporaire ===
                              culture.id ? (
                                <View
                                  style={
                                    styles.selectedCheckCircle
                                  }
                                >
                                  <Check
                                    size={15}
                                    color="#FFFFFF"
                                    strokeWidth={2.8}
                                  />
                                </View>
                              ) : null}
                            </TouchableOpacity>
                          ),
                        )}
                    </ScrollView>
                  )}
                </View>
              ) : null}

              <View
                style={
                  styles.filterPanelActions
                }
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.resetSmallButton
                  }
                  onPress={
                    reinitialiserFiltre
                  }
                >
                  <Text
                    style={
                      styles.resetSmallButtonText
                    }
                  >
                    Réinitialiser
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={
                    styles.applySmallButton
                  }
                  onPress={
                    appliquerFiltre
                  }
                >
                  <Check
                    size={16}
                    color="#FFFFFF"
                    strokeWidth={2.5}
                  />

                  <Text
                    style={
                      styles.applySmallButtonText
                    }
                  >
                    Appliquer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* STATS */}

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
                  observationsGlobalesFiltrees.length
                }
              </Text>

              <Text
                style={
                  styles.statPillLabel
                }
              >
                résultat
                {observationsGlobalesFiltrees.length >
                1
                  ? 's'
                  : ''}
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
                : filtreActif
                  ? 'Filtre actif'
                  : 'Triées par date récente'}
            </Text>
          </View>
        </View>

        {/* ==================================================
            LISTE
        ================================================== */}

        <View
          style={
            styles.listArea
          }
        >
          <ScrollView
            style={
              styles.listScroll
            }
            contentContainerStyle={
              styles.listScrollContent
            }
            showsVerticalScrollIndicator={
              false
            }
            nestedScrollEnabled
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

          {filtreActif ? (
            <View
              style={
                styles.activeFilterCard
              }
            >
              <View
                style={
                  styles.activeFilterIcon
                }
              >
                <SlidersHorizontal
                  size={16}
                  color={
                    colors.primary[600]
                  }
                />
              </View>

              <View
                style={
                  styles.activeFilterContent
                }
              >
                <Text
                  style={
                    styles.activeFilterLabel
                  }
                >
                  Filtre actuel
                </Text>

                <Text
                  style={
                    styles.activeFilterText
                  }
                  numberOfLines={2}
                >
                  {parcelleSelectionnee
                    ? parcelles.find(
                        item =>
                          item.id ===
                          parcelleSelectionnee,
                      )?.nom
                    : 'Toutes les parcelles'}

                  {cultureSelectionnee
                    ? ` • ${
                        culturesGlobales.find(
                          item =>
                            item.id ===
                            cultureSelectionnee,
                        )?.nom ??
                        'Culture'
                      }`
                    : ''}
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={
                  reinitialiserFiltre
                }
                style={
                  styles.clearFilterButton
                }
              >
                <X
                  size={16}
                  color={
                    colors.primary[600]
                  }
                />
              </TouchableOpacity>
            </View>
          ) : null}

          {chargementGlobal ? (
            <View
              style={
                styles.loadingInline
              }
            >
              <ActivityIndicator
                size="large"
                color={
                  colors.primary[600]
                }
              />

              <Text
                style={
                  styles.loadingInlineText
                }
              >
                Chargement des observations...
              </Text>
            </View>
          ) : erreurGlobal ? (
            <View
              style={
                styles.emptyInline
              }
            >
              <Text
                style={
                  styles.errorTitle
                }
              >
                Impossible de charger les
                observations
              </Text>

              <Text
                style={
                  styles.errorMessage
                }
              >
                Vérifiez votre connexion puis
                réessayez.
              </Text>

              <TouchableOpacity
                style={
                  styles.retryButtonInline
                }
                onPress={
                  actualiser
                }
              >
                <Text
                  style={
                    styles.retryButtonInlineText
                  }
                >
                  Réessayer
                </Text>
              </TouchableOpacity>
            </View>
          ) : observationsGlobalesFiltrees.length ===
            0 ? (
            <View
              style={
                styles.emptyInline
              }
            >
              <Text
                style={
                  styles.emptyIcon
                }
              >
                📝
              </Text>

              <Text
                style={
                  styles.emptyTitle
                }
              >
                Aucune observation
              </Text>

              <Text
                style={
                  styles.emptyText
                }
              >
                {filtreActif
                  ? 'Aucune observation ne correspond aux filtres sélectionnés.'
                  : "Aucune observation n'a encore été enregistrée dans vos cultures."}
              </Text>

              {filtreActif ? (
                <TouchableOpacity
                  style={
                    styles.resetEmptyButton
                  }
                  onPress={
                    reinitialiserFiltre
                  }
                >
                  <Text
                    style={
                      styles.resetEmptyButtonText
                    }
                  >
                    Réinitialiser
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : (
            <View
              style={
                styles.listContent
              }
            >
              {observationsGlobalesFiltrees.map(
                item => (
                  <ObservationCard
                    key={`${item.parcelleId}-${item.cultureId}-${item.observation.id}`}
                    observation={
                      item.observation
                    }
                    parcelleId={
                      item.parcelleId
                    }
                    cultureId={
                      item.cultureId
                    }
                    cultureNom={
                      item.cultureNom
                    }
                    parcelleNom={
                      item.parcelleNom
                    }
                    statutCulture={
                      item.statutCulture
                    }
                    modificationAutorisee={
                      item.statutCulture !==
                        'SUPPRIMEE' &&
                      item.statutCulture !==
                        'RECOLTEE' &&
                      item.statutCulture !==
                        'ABANDONNEE'
                    }
                    onModifier={() =>
                      ouvrirModificationGlobale(
                        item,
                      )
                    }
                    onSupprimer={() =>
                      confirmerSuppressionGlobale(
                        item,
                      )
                    }
                  />
                ),
              )}
            </View>
          )}

          </ScrollView>

          {/* FAB : attaché à la zone de liste */}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajouter une observation"
            onPress={
              ouvrirAjoutGlobal
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
        </View>

        <AppBottomBar />

        {/* ==================================================
            MODAL FILTRE
        ================================================== */}

        <Modal
          visible={
            filtreOuvert
          }
          transparent
          animationType="slide"
          onRequestClose={
            fermerFiltre
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <TouchableOpacity
              style={
                styles.modalBackdrop
              }
              activeOpacity={1}
              onPress={
                fermerFiltre
              }
            />

            <View
              style={
                styles.filterSheet
              }
            >
              <View
                style={
                  styles.sheetHandle
                }
              />

              <View
                style={
                  styles.sheetHeader
                }
              >
                <View>
                  <Text
                    style={
                      styles.sheetTitle
                    }
                  >
                    Filtrer les observations
                  </Text>

                  <Text
                    style={
                      styles.sheetSubtitle
                    }
                  >
                    Parcelle puis culture
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    fermerFiltre
                  }
                  style={
                    styles.sheetCloseButton
                  }
                >
                  <X
                    size={20}
                    color="#374151"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.sheetContent
                }
              >
                <Text
                  style={
                    styles.filterLabel
                  }
                >
                  PARCELLE
                </Text>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.filterSelectModal,
                    selectionParcelleOuverte &&
                      styles.filterSelectOpen,
                  ]}
                  onPress={() => {
                    setSelectionParcelleOuverte(
                      previous =>
                        !previous,
                    );

                    setSelectionCultureOuverte(
                      false,
                    );
                  }}
                >
                  <View
                    style={
                      styles.filterSelectLeft
                    }
                  >
                    <View
                      style={
                        styles.filterSelectIcon
                      }
                    >
                      <MapPin
                        size={18}
                        color="#166534"
                      />
                    </View>

                    <Text
                      style={[
                        styles.filterSelectText,
                        !parcelleTemporaire &&
                          styles.filterSelectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {parcellePourSelection?.nom ??
                        'Sélectionner une parcelle'}
                    </Text>
                  </View>

                  <ChevronDown
                    size={19}
                    color="#6B7280"
                    style={
                      selectionParcelleOuverte
                        ? styles.chevronRotated
                        : undefined
                    }
                  />
                </TouchableOpacity>

                {selectionParcelleOuverte ? (
                  <View
                    style={
                      styles.filterDropdown
                    }
                  >
                    {parcellesQuery.isLoading ? (
                      <View
                        style={
                          styles.dropdownLoading
                        }
                      >
                        <ActivityIndicator
                          color="#166534"
                        />
                      </View>
                    ) : parcelles.length ===
                      0 ? (
                      <Text
                        style={
                          styles.dropdownEmpty
                        }
                      >
                        Aucune parcelle disponible.
                      </Text>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled
                        style={
                          styles.filterDropdownScroll
                        }
                      >
                        {parcelles.map(
                          item => (
                            <TouchableOpacity
                              key={
                                item.id
                              }
                              activeOpacity={
                                0.7
                              }
                              style={[
                                styles.filterDropdownItem,
                                parcelleTemporaire ===
                                  item.id &&
                                  styles.filterDropdownItemSelected,
                              ]}
                              onPress={() => {
                                setParcelleTemporaire(
                                  item.id,
                                );

                                setCultureTemporaire(
                                  '',
                                );

                                setSelectionParcelleOuverte(
                                  false,
                                );
                              }}
                            >
                              <View
                                style={
                                  styles.dropdownItemLeft
                                }
                              >
                                <MapPin
                                  size={16}
                                  color={
                                    parcelleTemporaire ===
                                    item.id
                                      ? '#166534'
                                      : '#9CA3AF'
                                  }
                                />

                                <Text
                                  style={[
                                    styles.filterDropdownItemText,
                                    parcelleTemporaire ===
                                      item.id &&
                                      styles.filterDropdownItemTextSelected,
                                  ]}
                                >
                                  {
                                    item.nom
                                  }
                                </Text>
                              </View>

                              {parcelleTemporaire ===
                              item.id ? (
                                <Check
                                  size={18}
                                  color="#166534"
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              ) : null}
                            </TouchableOpacity>
                          ),
                        )}
                      </ScrollView>
                    )}
                  </View>
                ) : null}

                <Text
                  style={[
                    styles.filterLabel,
                    styles.filterLabelCulture,
                  ]}
                >
                  CULTURE
                </Text>

                <TouchableOpacity
                  activeOpacity={
                    parcelleTemporaire
                      ? 0.8
                      : 1
                  }
                  disabled={
                    !parcelleTemporaire
                  }
                  style={[
                    styles.filterSelectModal,
                    !parcelleTemporaire &&
                      styles.filterSelectDisabled,
                    selectionCultureOuverte &&
                      styles.filterSelectOpen,
                  ]}
                  onPress={() => {
                    setSelectionCultureOuverte(
                      previous =>
                        !previous,
                    );

                    setSelectionParcelleOuverte(
                      false,
                    );
                  }}
                >
                  <View
                    style={
                      styles.filterSelectLeft
                    }
                  >
                    <View
                      style={[
                        styles.filterSelectIcon,
                        !parcelleTemporaire &&
                          styles.filterSelectIconDisabled,
                      ]}
                    >
                      <Sprout
                        size={18}
                        color={
                          parcelleTemporaire
                            ? '#166534'
                            : '#9CA3AF'
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.filterSelectText,
                        !cultureTemporaire &&
                          styles.filterSelectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {parcelleTemporaire
                        ? culturePourSelection?.nom ??
                          'Sélectionner une culture'
                        : 'Choisissez d’abord une parcelle'}
                    </Text>
                  </View>

                  <ChevronDown
                    size={19}
                    color={
                      parcelleTemporaire
                        ? '#6B7280'
                        : '#D1D5DB'
                    }
                  />
                </TouchableOpacity>

                {selectionCultureOuverte &&
                parcelleTemporaire ? (
                  <View
                    style={
                      styles.filterDropdown
                    }
                  >
                    {culturesQuery.isLoading ? (
                      <View
                        style={
                          styles.dropdownLoading
                        }
                      >
                        <ActivityIndicator
                          color="#166534"
                        />

                        <Text
                          style={
                            styles.dropdownLoadingText
                          }
                        >
                          Chargement des cultures...
                        </Text>
                      </View>
                    ) : culturesQuery.isError ? (
                      <View
                        style={
                          styles.dropdownLoading
                        }
                      >
                        <Text
                          style={
                            styles.dropdownError
                          }
                        >
                          Impossible de charger
                          les cultures.
                        </Text>
                      </View>
                    ) : culturesFiltre.filter(
                        culture =>
                          culture.statut !==
                          'SUPPRIMEE',
                      ).length === 0 ? (
                      <Text
                        style={
                          styles.dropdownEmpty
                        }
                      >
                        Aucune culture dans cette
                        parcelle.
                      </Text>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled
                        style={
                          styles.filterDropdownScroll
                        }
                      >
                        {culturesFiltre
                          .filter(
                            culture =>
                              culture.statut !==
                              'SUPPRIMEE',
                          )
                          .map(
                            culture => (
                              <TouchableOpacity
                                key={
                                  culture.id
                                }
                                activeOpacity={
                                  0.7
                                }
                                style={[
                                  styles.filterCultureItem,
                                  cultureTemporaire ===
                                    culture.id &&
                                    styles.filterCultureItemSelected,
                                ]}
                                onPress={() => {
                                  setCultureTemporaire(
                                    culture.id,
                                  );

                                  setSelectionCultureOuverte(
                                    false,
                                  );
                                }}
                              >
                                <View
                                  style={
                                    styles.filterCultureInfo
                                  }
                                >
                                  <View
                                    style={
                                      styles.filterCultureNameRow
                                    }
                                  >
                                    <Sprout
                                      size={16}
                                      color="#166534"
                                    />

                                    <Text
                                      style={
                                        styles.filterCultureName
                                      }
                                      numberOfLines={
                                        1
                                      }
                                    >
                                      {
                                        culture.nom
                                      }
                                    </Text>
                                  </View>

                                  <Text
                                    style={
                                      styles.filterCultureStatus
                                    }
                                  >
                                    {nomStatut(
                                      culture.statut,
                                    )}
                                  </Text>
                                </View>

                                {cultureTemporaire ===
                                culture.id ? (
                                  <View
                                    style={
                                      styles.selectedCheckCircle
                                    }
                                  >
                                    <Check
                                      size={
                                        15
                                      }
                                      color="#FFFFFF"
                                      strokeWidth={
                                        2.8
                                      }
                                    />
                                  </View>
                                ) : null}
                              </TouchableOpacity>
                            ),
                          )}
                      </ScrollView>
                    )}
                  </View>
                ) : null}

                <View
                  style={
                    styles.followSection
                  }
                >
                  <Text
                    style={
                      styles.filterLabel
                    }
                  >
                    SUIVI
                  </Text>

                  <TouchableOpacity
                    activeOpacity={
                      parcelleTemporaire &&
                      cultureTemporaire
                        ? 0.85
                        : 1
                    }
                    disabled={
                      !parcelleTemporaire ||
                      !cultureTemporaire
                    }
                    onPress={
                      voirSuivi
                    }
                    style={[
                      styles.followButton,
                      (!parcelleTemporaire ||
                        !cultureTemporaire) &&
                        styles.followButtonDisabled,
                    ]}
                  >
                    <View
                      style={
                        styles.followButtonIcon
                      }
                    >
                      <Sprout
                        size={20}
                        color="#FFFFFF"
                        strokeWidth={
                          2.3
                        }
                      />
                    </View>

                    <View
                      style={
                        styles.followButtonContent
                      }
                    >
                      <Text
                        style={
                          styles.followButtonTitle
                        }
                      >
                        Voir le suivi
                      </Text>

                      <Text
                        style={
                          styles.followButtonSubtitle
                        }
                        numberOfLines={1}
                      >
                        {cultureTemporaire
                          ? `${
                              culturePourSelection?.nom ??
                              'Culture'
                            } • ${
                              parcellePourSelection?.nom ??
                              'Parcelle'
                            }`
                          : 'Sélectionnez une parcelle et une culture'}
                      </Text>
                    </View>

                    <ChevronRight
                      size={22}
                      color={
                        parcelleTemporaire &&
                        cultureTemporaire
                          ? '#FFFFFF'
                          : '#9CA3AF'
                      }
                    />
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <View
                style={
                  styles.sheetActions
                }
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.resetButton
                  }
                  onPress={
                    reinitialiserFiltre
                  }
                >
                  <Text
                    style={
                      styles.resetButtonText
                    }
                  >
                    Réinitialiser
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={
                    styles.applyButton
                  }
                  onPress={
                    appliquerFiltre
                  }
                >
                  <Check
                    size={18}
                    color="#FFFFFF"
                    strokeWidth={
                      2.5
                    }
                  />

                  <Text
                    style={
                      styles.applyButtonText
                    }
                  >
                    Appliquer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ==================================================
            MODAL AJOUT
        ================================================== */}

        <Modal
          visible={
            ajoutOuvert
          }
          transparent
          animationType="slide"
          onRequestClose={
            fermerAjoutGlobal
          }
        >
          <View
            style={
              styles.modalOverlay
            }
          >
            <TouchableOpacity
              style={
                styles.modalBackdrop
              }
              activeOpacity={1}
              onPress={
                fermerAjoutGlobal
              }
            />

            <View
              style={
                styles.addSheet
              }
            >
              <View
                style={
                  styles.sheetHandle
                }
              />

              <View
                style={
                  styles.sheetHeader
                }
              >
                <View
                  style={
                    styles.addSheetTitleBlock
                  }
                >
                  <Text
                    style={
                      styles.sheetTitle
                    }
                  >
                    Nouvelle observation
                  </Text>

                  <Text
                    style={
                      styles.sheetSubtitle
                    }
                  >
                    Sélectionnez d'abord la parcelle
                  </Text>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={
                    fermerAjoutGlobal
                  }
                  style={
                    styles.sheetCloseButton
                  }
                >
                  <X
                    size={20}
                    color="#374151"
                  />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={
                  false
                }
                contentContainerStyle={
                  styles.sheetContent
                }
              >
                <View
                  style={
                    styles.stepHeader
                  }
                >
                  <View
                    style={
                      styles.stepNumber
                    }
                  >
                    <Text
                      style={
                        styles.stepNumberText
                      }
                    >
                      1
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.stepTitle
                      }
                    >
                      Parcelle
                    </Text>

                    <Text
                      style={
                        styles.stepSubtitle
                      }
                    >
                      Où se trouve l'observation ?
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.filterSelectModal,
                    selectionParcelleAjoutOuverte &&
                      styles.filterSelectOpen,
                  ]}
                  onPress={() => {
                    setSelectionParcelleAjoutOuverte(
                      previous =>
                        !previous,
                    );

                    setSelectionCultureAjoutOuverte(
                      false,
                    );
                  }}
                >
                  <View
                    style={
                      styles.filterSelectLeft
                    }
                  >
                    <View
                      style={
                        styles.filterSelectIcon
                      }
                    >
                      <MapPin
                        size={18}
                        color="#166534"
                      />
                    </View>

                    <Text
                      style={[
                        styles.filterSelectText,
                        !parcelleAjout &&
                          styles.filterSelectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {parcelles.find(
                        item =>
                          item.id ===
                          parcelleAjout,
                      )?.nom ??
                        'Sélectionner une parcelle'}
                    </Text>
                  </View>

                  <ChevronDown
                    size={19}
                    color="#6B7280"
                    style={
                      selectionParcelleAjoutOuverte
                        ? styles.chevronRotated
                        : undefined
                    }
                  />
                </TouchableOpacity>

                {selectionParcelleAjoutOuverte ? (
                  <View
                    style={
                      styles.filterDropdown
                    }
                  >
                    {parcellesQuery.isLoading ? (
                      <View
                        style={
                          styles.dropdownLoading
                        }
                      >
                        <ActivityIndicator
                          color="#166534"
                        />
                      </View>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled
                        style={
                          styles.filterDropdownScroll
                        }
                      >
                        {parcelles.map(
                          item => (
                            <TouchableOpacity
                              key={
                                item.id
                              }
                              activeOpacity={
                                0.7
                              }
                              style={[
                                styles.filterDropdownItem,
                                parcelleAjout ===
                                  item.id &&
                                  styles.filterDropdownItemSelected,
                              ]}
                              onPress={() => {
                                setParcelleAjout(
                                  item.id,
                                );

                                setCultureAjout(
                                  '',
                                );

                                setSelectionParcelleAjoutOuverte(
                                  false,
                                );
                              }}
                            >
                              <View
                                style={
                                  styles.dropdownItemLeft
                                }
                              >
                                <MapPin
                                  size={16}
                                  color={
                                    parcelleAjout ===
                                    item.id
                                      ? '#166534'
                                      : '#9CA3AF'
                                  }
                                />

                                <Text
                                  style={[
                                    styles.filterDropdownItemText,
                                    parcelleAjout ===
                                      item.id &&
                                      styles.filterDropdownItemTextSelected,
                                  ]}
                                >
                                  {
                                    item.nom
                                  }
                                </Text>
                              </View>

                              {parcelleAjout ===
                              item.id ? (
                                <Check
                                  size={18}
                                  color="#166534"
                                  strokeWidth={
                                    2.5
                                  }
                                />
                              ) : null}
                            </TouchableOpacity>
                          ),
                        )}
                      </ScrollView>
                    )}
                  </View>
                ) : null}

                <View
                  style={[
                    styles.stepHeader,
                    styles.stepHeaderSecond,
                  ]}
                >
                  <View
                    style={
                      styles.stepNumber
                    }
                  >
                    <Text
                      style={
                        styles.stepNumberText
                      }
                    >
                      2
                    </Text>
                  </View>

                  <View>
                    <Text
                      style={
                        styles.stepTitle
                      }
                    >
                      Culture
                    </Text>

                    <Text
                      style={
                        styles.stepSubtitle
                      }
                    >
                      Choisissez la culture concernée
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  activeOpacity={
                    parcelleAjout
                      ? 0.8
                      : 1
                  }
                  disabled={
                    !parcelleAjout
                  }
                  style={[
                    styles.filterSelectModal,
                    !parcelleAjout &&
                      styles.filterSelectDisabled,
                    selectionCultureAjoutOuverte &&
                      styles.filterSelectOpen,
                  ]}
                  onPress={() => {
                    setSelectionCultureAjoutOuverte(
                      previous =>
                        !previous,
                    );

                    setSelectionParcelleAjoutOuverte(
                      false,
                    );
                  }}
                >
                  <View
                    style={
                      styles.filterSelectLeft
                    }
                  >
                    <View
                      style={[
                        styles.filterSelectIcon,
                        !parcelleAjout &&
                          styles.filterSelectIconDisabled,
                      ]}
                    >
                      <Sprout
                        size={18}
                        color={
                          parcelleAjout
                            ? '#166534'
                            : '#9CA3AF'
                        }
                      />
                    </View>

                    <Text
                      style={[
                        styles.filterSelectText,
                        !cultureAjout &&
                          styles.filterSelectPlaceholder,
                      ]}
                      numberOfLines={1}
                    >
                      {parcelleAjout
                        ? culturesAjout.find(
                            item =>
                              item.id ===
                              cultureAjout,
                          )?.nom ??
                          'Sélectionner une culture'
                        : 'Choisissez d’abord une parcelle'}
                    </Text>
                  </View>

                  <ChevronDown
                    size={19}
                    color={
                      parcelleAjout
                        ? '#6B7280'
                        : '#D1D5DB'
                    }
                  />
                </TouchableOpacity>

                {selectionCultureAjoutOuverte &&
                parcelleAjout ? (
                  <View
                    style={
                      styles.filterDropdown
                    }
                  >
                    {culturesAjoutQuery.isLoading ? (
                      <View
                        style={
                          styles.dropdownLoading
                        }
                      >
                        <ActivityIndicator
                          color="#166534"
                        />

                        <Text
                          style={
                            styles.dropdownLoadingText
                          }
                        >
                          Chargement des cultures...
                        </Text>
                      </View>
                    ) : culturesAjoutQuery.isError ? (
                      <View
                        style={
                          styles.dropdownLoading
                        }
                      >
                        <Text
                          style={
                            styles.dropdownError
                          }
                        >
                          Impossible de charger les
                          cultures.
                        </Text>
                      </View>
                    ) : (
                      <ScrollView
                        nestedScrollEnabled
                        style={
                          styles.filterDropdownScroll
                        }
                      >
                        {culturesAjout
                          .filter(
                            culture =>
                              culture.statut !==
                              'SUPPRIMEE',
                          )
                          .map(
                            culture => {
                              const autorisee =
                                culture.statut !==
                                  'RECOLTEE' &&
                                culture.statut !==
                                  'ABANDONNEE';

                              return (
                                <TouchableOpacity
                                  key={
                                    culture.id
                                  }
                                  activeOpacity={
                                    autorisee
                                      ? 0.7
                                      : 1
                                  }
                                  disabled={
                                    !autorisee
                                  }
                                  style={[
                                    styles.filterCultureItem,
                                    cultureAjout ===
                                      culture.id &&
                                      styles.filterCultureItemSelected,
                                    !autorisee &&
                                      styles.filterCultureItemDisabled,
                                  ]}
                                  onPress={() => {
                                    setCultureAjout(
                                      culture.id,
                                    );

                                    setSelectionCultureAjoutOuverte(
                                      false,
                                    );
                                  }}
                                >
                                  <View
                                    style={
                                      styles.filterCultureInfo
                                    }
                                  >
                                    <View
                                      style={
                                        styles.filterCultureNameRow
                                      }
                                    >
                                      <Sprout
                                        size={16}
                                        color={
                                          autorisee
                                            ? '#166534'
                                            : '#9CA3AF'
                                        }
                                      />

                                      <Text
                                        style={[
                                          styles.filterCultureName,
                                          !autorisee &&
                                            styles.disabledCultureText,
                                        ]}
                                        numberOfLines={
                                          1
                                        }
                                      >
                                        {
                                          culture.nom
                                        }
                                      </Text>
                                    </View>

                                    <Text
                                      style={
                                        styles.filterCultureStatus
                                      }
                                    >
                                      {culture.statut ===
                                      'EN_COURS'
                                        ? 'Culture en cours'
                                        : culture.statut ===
                                          'PLANIFIEE'
                                        ? 'Culture planifiée'
                                        : culture.statut ===
                                          'RECOLTEE'
                                        ? 'Lecture seule • récoltée'
                                        : culture.statut ===
                                          'ABANDONNEE'
                                        ? 'Lecture seule • abandonnée'
                                        : culture.statut}
                                    </Text>
                                  </View>

                                  {cultureAjout ===
                                  culture.id ? (
                                    <View
                                      style={
                                        styles.selectedCheckCircle
                                      }
                                    >
                                      <Check
                                        size={15}
                                        color="#FFFFFF"
                                        strokeWidth={
                                          2.8
                                        }
                                      />
                                    </View>
                                  ) : null}
                                </TouchableOpacity>
                              );
                            },
                          )}
                      </ScrollView>
                    )}
                  </View>
                ) : null}

                {parcelleAjout &&
                cultureAjout ? (
                  <View
                    style={
                      styles.addSummaryCard
                    }
                  >
                    <View
                      style={
                        styles.addSummaryIcon
                      }
                    >
                      <Check
                        size={18}
                        color="#166534"
                        strokeWidth={2.5}
                      />
                    </View>

                    <View
                      style={
                        styles.addSummaryContent
                      }
                    >
                      <Text
                        style={
                          styles.addSummaryLabel
                        }
                      >
                        OBSERVATION POUR
                      </Text>

                      <Text
                        style={
                          styles.addSummaryCulture
                        }
                        numberOfLines={1}
                      >
                        {
                          culturesAjout.find(
                            item =>
                              item.id ===
                              cultureAjout,
                          )?.nom
                        }
                      </Text>

                      <View
                        style={
                          styles.addSummaryParcelRow
                        }
                      >
                        <MapPin
                          size={12}
                          color="#6B7280"
                        />

                        <Text
                          style={
                            styles.addSummaryParcel
                          }
                          numberOfLines={1}
                        >
                          {
                            parcelles.find(
                              item =>
                                item.id ===
                                parcelleAjout,
                            )?.nom
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                ) : null}
              </ScrollView>

              <View
                style={
                  styles.sheetActions
                }
              >
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={
                    styles.resetButton
                  }
                  onPress={
                    fermerAjoutGlobal
                  }
                >
                  <Text
                    style={
                      styles.resetButtonText
                    }
                  >
                    Annuler
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={
                    parcelleAjout &&
                    cultureAjout
                      ? 0.85
                      : 1
                  }
                  disabled={
                    !parcelleAjout ||
                    !cultureAjout
                  }
                  style={[
                    styles.applyButton,
                    (!parcelleAjout ||
                      !cultureAjout) &&
                      styles.applyButtonDisabled,
                  ]}
                  onPress={
                    continuerAjoutGlobal
                  }
                >
                  <Plus
                    size={18}
                    color={
                      parcelleAjout &&
                      cultureAjout
                        ? '#FFFFFF'
                        : '#9CA3AF'
                    }
                    strokeWidth={2.6}
                  />

                  <Text
                    style={[
                      styles.applyButtonText,
                      (!parcelleAjout ||
                        !cultureAjout) &&
                        styles.applyButtonTextDisabled,
                    ]}
                  >
                    Continuer
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }

  // ====================================================
  // CULTURE SUPPRIMEE
  // ====================================================

  if (cultureSupprimee) {
    return (
      <View
        style={
          styles.center
        }
      >
        <Text
          style={
            styles.blockedIcon
          }
        >
          🚫
        </Text>

        <Text
          style={
            styles.blockedTitle
          }
        >
          Culture supprimée
        </Text>

        <Text
          style={
            styles.blockedText
          }
        >
          Les observations de cette culture
          ne sont plus accessibles.
        </Text>

        <TouchableOpacity
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
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // LOADING
  // ====================================================

  if (
    observationsQuery.isLoading
  ) {
    return (
      <View
        style={
          styles.center
        }
      >
        <ActivityIndicator
          size="large"
          color={
            colors.primary[600]
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Chargement des observations...
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
        <Text
          style={
            styles.errorText
          }
        >
          Impossible de charger les
          observations.
        </Text>

        <TouchableOpacity
          style={
            styles.retryButton
          }
          onPress={() =>
            observationsQuery.refetch()
          }
        >
          <Text
            style={
              styles.retryText
            }
          >
            Réessayer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ====================================================
  // MODE CULTURE
  // ====================================================

  return (
    <View
      style={
        styles.root
      }
    >
      <View
        style={
          styles.detailBody
        }
      >
        <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.detailContent
        }
        refreshControl={
          <RefreshControl
            refreshing={
              refreshing
            }
            onRefresh={
              actualiser
            }
            tintColor={
              colors.primary[500]
            }
          />
        }
      >
        {/* HEADER */}

        <ScreenHeader
          title="Observations"
          subtitle={`Parcelle : ${
            parcelleNom ||
            parcelleId
          } • ${
            cultureNom ||
            'Culture'
          }`}
          showBack
        />

        {/* ==================================================
            STATUT
        ================================================== */}

        <View
          style={[
            styles.statusBox,
            lectureSeule
              ? styles.statusReadOnly
              : styles.statusEditable,
          ]}
        >
          <View
            style={
              styles.statusHeader
            }
          >
            <View
              style={[
                styles.statusDot,
                lectureSeule
                  ? styles.statusDotReadonly
                  : styles.statusDotEditable,
              ]}
            />

            <Text
              style={
                styles.statusText
              }
            >
              {statut ===
              'EN_COURS'
                ? 'Culture en cours'
                : statut ===
                  'RECOLTEE'
                ? 'Culture récoltée'
                : statut ===
                  'ABANDONNEE'
                ? 'Culture abandonnée'
                : `Statut : ${
                    statut ||
                    'INCONNU'
                  }`}
            </Text>
          </View>

          <Text
            style={
              styles.statusDescription
            }
          >
            {lectureSeule
              ? 'Consultation uniquement. Les observations et leurs photos peuvent être consultées.'
              : 'Les observations peuvent être ajoutées, modifiées et supprimées.'}
          </Text>
        </View>

        {/* ==================================================
            SECTION HISTORIQUE
        ================================================== */}

        <View
          style={
            styles.sectionHeader
          }
        >
          <View
            style={
              styles.sectionTitleBlock
            }
          >
            <Text
              style={
                styles.sectionTitle
              }
            >
              Historique
            </Text>

            <Text
              style={
                styles.sectionSubtitle
              }
            >
              Observations de cette culture
            </Text>
          </View>

          <Text
            style={
              styles.countText
            }
          >
            {
              observationsFiltrees.length
            }{' '}
            observation
            {observationsFiltrees.length >
            1
              ? 's'
              : ''}
          </Text>
        </View>

        {observationsFiltrees.length ===
        0 ? (
          <View
            style={
              styles.emptyCard
            }
          >
            <Text
              style={
                styles.emptyIcon
              }
            >
              📝
            </Text>

            <Text
              style={
                styles.emptyTitle
              }
            >
              Aucune observation
            </Text>

            <Text
              style={
                styles.emptyText
              }
            >
              Aucune observation n’a encore
              été enregistrée pour cette
              culture.
            </Text>
          </View>
        ) : (
          <View
            style={
              styles.listAreaDetail
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

            <View
              style={
                styles.listContent
              }
            >
              {observationsFiltrees.map(
                observation => (
                  <ObservationCard
                    key={
                      observation.id
                    }
                    observation={
                      observation
                    }
                    parcelleId={
                      parcelleId
                    }
                    cultureId={
                      cultureId
                    }
                    cultureNom={
                      cultureNom ||
                      'Culture'
                    }
                    parcelleNom={
                      parcelleNom ||
                      'Parcelle'
                    }
                    statutCulture={
                      statut
                    }
                    modificationAutorisee={
                      modificationAutorisee
                    }
                    onModifier={
                      ouvrirModification
                    }
                    onSupprimer={
                      confirmerSuppression
                    }
                  />
                ),
              )}
            </View>
          </View>
        )}
        </ScrollView>

        {modificationAutorisee ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Ajouter une observation"
            onPress={
              ouvrirAjout
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
        ) : null}
      </View>

      <AppBottomBar />
    </View>
  );
}

// ======================================================
// CARTE OBSERVATION
// ======================================================

function ObservationCard({
  observation,
  parcelleId,
  cultureId,
  cultureNom,
  parcelleNom,
  statutCulture,
  modificationAutorisee,
  onModifier,
  onSupprimer,
}: {
  observation: Observation;
  parcelleId: string;
  cultureId: string;
  cultureNom: string;
  parcelleNom: string;
  statutCulture?: StatutCulture;
  modificationAutorisee: boolean;
  onModifier: (
    observation: Observation,
  ) => void;
  onSupprimer: (
    observation: Observation,
  ) => void;
}) {
  const photosQuery =
    usePhotosObservation(
      parcelleId,
      cultureId,
      observation.id,
    );

  const uploadPhoto =
    useUploadPhotoObservation(
      parcelleId,
      cultureId,
      observation.id,
    );

  const deletePhoto =
    useDeletePhotoObservation(
      parcelleId,
      cultureId,
      observation.id,
    );

  const [
    photoEnCours,
    setPhotoEnCours,
  ] =
    useState(false);

  const envoyerPhoto =
    async (
      uri: string,
    ) => {
      if (!modificationAutorisee) {
        return;
      }

      setPhotoEnCours(true);

      try {
        await uploadPhoto.mutateAsync(
          uri,
        );

        await photosQuery.refetch();

        Alert.alert(
          'Succès',
          'Photo ajoutée avec succès.',
        );
      } catch (
        error: any
      ) {
        console.error(
          'ERREUR UPLOAD PHOTO OBSERVATION:',
          error?.response?.data ||
            error,
        );

        Alert.alert(
          'Erreur',
          error?.response?.data
            ?.message ||
            "Impossible d'envoyer la photo.",
        );
      } finally {
        setPhotoEnCours(false);
      }
    };

  const choisirGalerie =
    async () => {
      if (!modificationAutorisee) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Permission refusée',
            'L’accès à la galerie est nécessaire pour sélectionner une photo.',
          );

          return;
        }

        const result =
          await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
          });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        await envoyerPhoto(
          result.assets[0].uri,
        );
      } catch (
        error
      ) {
        console.error(
          'ERREUR GALERIE OBSERVATION:',
          error,
        );

        Alert.alert(
          'Erreur',
          "Impossible de sélectionner l'image.",
        );
      }
    };

  const prendrePhoto =
    async () => {
      if (!modificationAutorisee) {
        return;
      }

      try {
        const permission =
          await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            'Permission refusée',
            'L’accès à la caméra est nécessaire pour prendre une photo.',
          );

          return;
        }

        const result =
          await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            quality: 0.8,
          });

        if (
          result.canceled ||
          !result.assets?.length
        ) {
          return;
        }

        await envoyerPhoto(
          result.assets[0].uri,
        );
      } catch (
        error
      ) {
        console.error(
          'ERREUR CAMERA OBSERVATION:',
          error,
        );

        Alert.alert(
          'Erreur',
          "Impossible de prendre la photo.",
        );
      }
    };

  const choisirPhoto =
    () => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        'Ajouter une photo',
        'Choisissez une source.',
        [
          {
            text: 'Galerie',
            onPress:
              choisirGalerie,
          },

          {
            text: 'Caméra',
            onPress:
              prendrePhoto,
          },

          {
            text: 'Annuler',
            style: 'cancel',
          },
        ],
      );
    };

  const confirmerSuppressionPhoto =
    (
      photo: PhotoObservation,
    ) => {
      if (!modificationAutorisee) {
        return;
      }

      Alert.alert(
        'Supprimer la photo',
        'Voulez-vous vraiment supprimer cette photo ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },

          {
            text: 'Supprimer',
            style: 'destructive',

            onPress:
              async () => {
                try {
                  await deletePhoto.mutateAsync(
                    photo.id,
                  );

                  await photosQuery.refetch();

                  Alert.alert(
                    'Succès',
                    'Photo supprimée.',
                  );
                } catch (
                  err: any
                ) {
                  console.error(
                    'ERREUR SUPPRESSION PHOTO OBSERVATION:',
                    err,
                  );

                  Alert.alert(
                    'Erreur',
                    err?.response
                      ?.data
                      ?.message ||
                      'Impossible de supprimer la photo.',
                  );
                }
              },
          },
        ],
      );
    };

  const photos =
    photosQuery.data ?? [];

  return (
    <Pressable
      onPress={() => {}}
      style={({ pressed }) => [
        pressed && {
          opacity: 0.97,
          transform: [
            {
              scale: 0.995,
            },
          ],
        },
      ]}
    >
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
    </Pressable>
  );
}

// ======================================================
// STYLES
// ======================================================

const styles =
  StyleSheet.create({

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
    // même logique que cultures.tsx
    // ===================================================

    topBar: {
      paddingHorizontal: 16,
      paddingTop: 12,
      gap: 12,
      backgroundColor:
        '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor:
        colors.border.default,
      paddingBottom: 12,
    },

    searchRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
    },

    searchContainer: {
      flex: 1,
      minHeight: 44,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        colors.border.default,
      borderRadius: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      paddingHorizontal: 12,
    },

    searchInput: {
      flex: 1,
      marginLeft: 8,
      paddingVertical: 0,
      fontSize: 14,
      color:
        colors.neutral[800],
    },

    clearSearchButton: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems:
        'center',
      justifyContent:
        'center',
      backgroundColor:
        colors.neutral[100],
    },

    filterButton: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor:
        '#FFFFFF',
      borderWidth: 1,
      borderColor:
        colors.border.default,
      alignItems:
        'center',
      justifyContent:
        'center',
      position: 'relative',
    },

    filterButtonActive: {
      backgroundColor:
        colors.primary[500],
      borderColor:
        colors.primary[500],
    },

    filterIndicator: {
      position: 'absolute',
      width: 7,
      height: 7,
      borderRadius: 4,
      top: 7,
      right: 7,
      backgroundColor:
        colors.primary[700],
      borderWidth: 1,
      borderColor:
        '#FFFFFF',
    },

    // ===================================================
    // FILTRE RAPIDE
    // ===================================================

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
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    filterLabel: {
      fontSize: 11,
      fontWeight: '800',
      color:
        colors.neutral[600],
      letterSpacing: 0.7,
      marginBottom: 8,
    },

    filterSelect: {
      minHeight: 54,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 14,
      borderWidth: 1,
      borderColor:
        colors.border.default,
      paddingHorizontal: 11,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    filterSelectSecond: {
      marginTop: 2,
    },

    filterSelectModal: {
      minHeight: 58,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        '#DDE7DD',
      paddingHorizontal: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
    },

    filterSelectOpen: {
      borderColor:
        colors.primary[500],
    },

    filterSelectDisabled: {
      backgroundColor:
        colors.neutral[100],
      borderColor:
        '#E5E7EB',
    },

    filterSelectLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      minWidth: 0,
    },

    filterSelectIcon: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor:
        '#ECFDF3',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    filterSelectIconDisabled: {
      backgroundColor:
        '#E5E7EB',
    },

    filterSelectText: {
      flex: 1,
      fontSize: 13.5,
      fontWeight: '700',
      color:
        '#1F2937',
    },

    filterSelectPlaceholder: {
      color:
        '#9CA3AF',
      fontWeight: '500',
    },

    chevronRotated: {
      transform: [
        {
          rotate:
            '180deg',
        },
      ],
    },

    filterPanelActions: {
      flexDirection:
        'row',
      gap: 8,
      marginTop: 2,
    },

    resetSmallButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        colors.neutral[200],
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    resetSmallButtonText: {
      color:
        colors.neutral[700],
      fontSize: 12,
      fontWeight: '700',
    },

    applySmallButton: {
      flex: 1,
      minHeight: 42,
      borderRadius: 11,
      backgroundColor:
        colors.primary[500],
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 6,
    },

    applySmallButtonText: {
      color:
        '#FFFFFF',
      fontSize: 12,
      fontWeight: '800',
    },

    // ===================================================
    // STATS
    // ===================================================

    statsBar: {
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 10,
    },

    statPill: {
      flexDirection:
        'row',
      alignItems:
        'center',
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
    // même fond que cultures.tsx
    // ===================================================

    listArea: {
      flex: 1,
      position: 'relative',
      overflow: 'hidden',
      backgroundColor:
        '#DCEBD7',
    },

    listAreaDetail: {
      position: 'relative',
      overflow: 'hidden',
      marginHorizontal: 0,
      borderRadius: 20,
      backgroundColor:
        '#DCEBD7',
      paddingBottom: 4,
    },

    detailBody: {
      flex: 1,
      position: 'relative',
    },

    listScroll: {
      flex: 1,
    },

    listScrollContent: {
      paddingBottom: 84,
    },

    listContent: {
      padding: 12,
      gap: 12,
    },

    activeFilterCard: {
      marginHorizontal: 12,
      marginTop: 12,
      padding: 11,
      borderRadius: 15,
      backgroundColor:
        'rgba(255,255,255,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(218,229,214,0.95)',
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    activeFilterIcon: {
      width: 34,
      height: 34,
      borderRadius: 11,
      backgroundColor:
        '#E8F5E4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    activeFilterContent: {
      flex: 1,
      marginLeft: 9,
      marginRight: 8,
    },

    activeFilterLabel: {
      fontSize: 9,
      color:
        colors.neutral[500],
      fontWeight: '900',
      letterSpacing: 0.6,
      textTransform:
        'uppercase',
    },

    activeFilterText: {
      marginTop: 2,
      color:
        colors.primary[700],
      fontSize: 12,
      fontWeight: '700',
    },

    clearFilterButton: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor:
        '#F0FDF4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    // ===================================================
    // FOND AGRICOLE
    // exactement comme cultures.tsx
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
      backgroundColor:
        '#C5DEBC',
      transform: [
        {
          rotate:
            '-18deg',
        },
      ],
    },

    fieldShapeTwo: {
      width: 300,
      height: 200,
      bottom: 60,
      left: -150,
      backgroundColor:
        '#CBE4C3',
      transform: [
        {
          rotate:
            '18deg',
        },
      ],
    },

    fieldShapeThree: {
      width: 170,
      height: 130,
      top: 260,
      right: -70,
      backgroundColor:
        '#D2E7CB',
      transform: [
        {
          rotate:
            '-12deg',
        },
      ],
    },

    fieldLine: {
      position: 'absolute',
      height: 2,
      borderRadius: 2,
      backgroundColor:
        '#B8D4AE',
      opacity: 0.65,
    },

    fieldLineOne: {
      width: 360,
      top: 125,
      left: -110,
      transform: [
        {
          rotate:
            '-16deg',
        },
      ],
    },

    fieldLineTwo: {
      width: 330,
      top: 150,
      left: -80,
      transform: [
        {
          rotate:
            '-16deg',
        },
      ],
    },

    // ===================================================
    // OBSERVATION CARD
    // même langage que CultureCard
    // ===================================================

    observationCard: {
      padding: 15,
      gap: 0,
      backgroundColor:
        'rgba(255,255,255,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      borderRadius: 20,
      shadowColor:
        '#355D38',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.10,
      shadowRadius: 12,
      elevation: 4,
    },

    observationHeader: {
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      justifyContent:
        'space-between',
      gap: 11,
    },

    observationHeaderLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      minWidth: 0,
    },

    observationIcon: {
      width: 48,
      height: 48,
      borderRadius: 14,
      backgroundColor:
        'rgba(232,245,228,0.95)',
      borderWidth: 1,
      borderColor:
        'rgba(155,190,145,0.40)',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    observationHeaderContent: {
      flex: 1,
      minWidth: 0,
      paddingTop: 1,
      marginLeft: 11,
    },

    observationCultureName: {
      fontSize: 16,
      fontWeight: '900',
      color:
        colors.neutral[900],
      letterSpacing: 0.1,
      textTransform:
        'uppercase',
    },

    observationSubtitleRow: {
      marginTop: 4,
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 4,
      minWidth: 0,
    },

    observationSubtitle: {
      flexShrink: 1,
      fontSize: 11.5,
      color:
        colors.neutral[500],
      fontWeight: '600',
    },

    statusContainer: {
      paddingTop: 1,
      alignItems:
        'flex-end',
    },

    cardSeparator: {
      height: 1,
      backgroundColor:
        'rgba(224,232,221,0.95)',
      marginTop: 15,
      marginBottom: 15,
    },

    // ===================================================
    // INFO CARD
    // ===================================================

    observationDateCard: {
      minHeight: 64,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        'rgba(248,250,247,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(222,230,219,0.95)',
      flexDirection:
        'row',
      alignItems:
        'flex-start',
      gap: 8,
    },

    infoCardIcon: {
      width: 29,
      height: 29,
      borderRadius: 9,
      backgroundColor:
        'rgba(232,245,228,0.95)',
      alignItems:
        'center',
      justifyContent:
        'center',
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

    descriptionCard: {
      marginTop: 10,
      minHeight: 68,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        'rgba(248,250,247,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(222,230,219,0.95)',
    },

    descriptionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },

    observationDescription: {
      marginTop: 8,
      fontSize: 12,
      lineHeight: 18,
      color:
        colors.neutral[800],
      fontWeight: '700',
    },

    // ===================================================
    // PHOTOS
    // ===================================================

    photoSection: {
      marginTop: 10,
      paddingHorizontal: 10,
      paddingVertical: 10,
      borderRadius: 13,
      backgroundColor:
        'rgba(248,250,247,0.92)',
      borderWidth: 1,
      borderColor:
        'rgba(222,230,219,0.95)',
    },

    photoTitleRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    photoTitle: {
      marginLeft: 8,
      fontSize: 8.8,
      color:
        colors.neutral[500],
      fontWeight: '900',
      letterSpacing: 0.55,
    },

    photoCount: {
      marginLeft: 7,
      minWidth: 22,
      textAlign:
        'center',
      backgroundColor:
        '#EAF0E7',
      borderRadius: 11,
      paddingVertical: 2,
      paddingHorizontal: 6,
      fontSize: 10.5,
      color:
        colors.neutral[700],
      fontWeight: '800',
    },

    photoList: {
      gap: 10,
      paddingBottom: 8,
      paddingTop: 10,
    },

    photoContainer: {
      width: 108,
      height: 108,
      borderRadius: 14,
      overflow:
        'hidden',
      position:
        'relative',
      backgroundColor:
        '#F3F4F6',
    },

    photo: {
      width: '100%',
      height: '100%',
    },

    deletePhotoButton: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor:
        'rgba(31,41,55,0.82)',
      justifyContent:
        'center',
      alignItems:
        'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.8)',
    },

    photoLoading: {
      minHeight: 50,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 8,
    },

    photoLoadingText: {
      fontSize: 11.5,
      color:
        colors.neutral[500],
      fontWeight: '600',
    },

    noPhotoText: {
      marginTop: 9,
      color:
        colors.neutral[400],
      fontSize: 12,
    },

    photoAddTile: {
      width: 108,
      height: 108,
      borderRadius: 14,
      borderWidth: 1.5,
      borderStyle: 'dashed',
      borderColor:
        '#86EFAC',
      backgroundColor:
        '#F0FDF4',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    photoAddIcon: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor:
        '#DCFCE7',
      alignItems:
        'center',
      justifyContent:
        'center',
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
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      gap: 10,
    },

    modifiedInfo: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
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
      flexDirection:
        'row',
      alignItems:
        'center',
      gap: 2,
    },

    detailsButtonText: {
      fontSize: 11.5,
      color:
        colors.primary[700],
      fontWeight: '900',
    },

    // ===================================================
    // ACTIONS
    // ===================================================

    actionButtons: {
      flexDirection:
        'row',
      gap: 10,
      marginTop: 10,
    },

    editButton: {
      flex: 1,
      minHeight: 42,
      backgroundColor:
        '#F0FDF4',
      borderWidth: 1,
      borderColor:
        '#BBF7D0',
      borderRadius: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 10,
    },

    editButtonText: {
      marginLeft: 6,
      color:
        '#166534',
      fontWeight: '700',
      fontSize: 13,
    },

    deleteButton: {
      flex: 1,
      minHeight: 42,
      backgroundColor:
        '#FEF2F2',
      borderWidth: 1,
      borderColor:
        '#FECACA',
      borderRadius: 12,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 10,
    },

    deleteButtonText: {
      marginLeft: 6,
      color:
        '#DC2626',
      fontWeight: '700',
      fontSize: 13,
    },

    readOnlyFooter: {
      marginTop: 10,
      paddingTop: 9,
      borderTopWidth: 1,
      borderTopColor:
        'rgba(226,233,224,0.95)',
    },

    readOnlyFooterText: {
      fontSize: 10.5,
      color:
        colors.neutral[400],
      fontWeight: '700',
    },

    // ===================================================
    // SCREEN STATES
    // ===================================================

    center: {
      flex: 1,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 24,
      paddingVertical: 24,
      backgroundColor:
        colors.background.app,
    },

    blockedIcon: {
      fontSize: 52,
      marginBottom: 14,
    },

    blockedTitle: {
      fontSize: 20,
      fontWeight: '800',
      color:
        colors.neutral[800],
      textAlign:
        'center',
      marginBottom: 8,
    },

    blockedText: {
      maxWidth: 320,
      fontSize: 14,
      lineHeight: 21,
      color:
        colors.neutral[500],
      textAlign:
        'center',
      marginBottom: 20,
    },

    backButton: {
      minHeight: 46,
      paddingHorizontal: 24,
      borderRadius: 13,
      backgroundColor:
        '#166534',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    backButtonText: {
      color:
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    loadingText: {
      marginTop: 12,
      fontSize: 13,
      color:
        colors.neutral[500],
      textAlign:
        'center',
    },

    errorText: {
      maxWidth: 320,
      fontSize: 14,
      lineHeight: 21,
      color:
        colors.neutral[700],
      fontWeight: '600',
      textAlign:
        'center',
      marginBottom: 16,
    },

    retryButton: {
      minHeight: 46,
      paddingHorizontal: 24,
      borderRadius: 13,
      backgroundColor:
        '#166534',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    retryText: {
      color:
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    // ===================================================
    // EMPTY / LOADING
    // ===================================================

    loadingInline: {
      paddingVertical: 45,
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 12,
    },

    loadingInlineText: {
      fontSize: 13,
      color:
        colors.neutral[500],
    },

    emptyInline: {
      paddingVertical: 40,
      paddingHorizontal: 20,
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    emptyCard: {
      backgroundColor:
        'rgba(255,255,255,0.92)',
      borderRadius: 20,
      padding: 30,
      alignItems:
        'center',
      borderWidth: 1,
      borderColor:
        'rgba(255,255,255,0.88)',
      shadowColor:
        '#355D38',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.07,
      shadowRadius: 10,
      elevation: 3,
    },

    emptyIcon: {
      fontSize: 42,
      marginBottom: 10,
    },

    emptyTitle: {
      fontSize: 18,
      fontWeight: '800',
      color:
        colors.neutral[800],
      marginBottom: 6,
      textAlign:
        'center',
    },

    emptyText: {
      fontSize: 14,
      color:
        colors.neutral[500],
      textAlign:
        'center',
      lineHeight: 20,
    },

    errorTitle: {
      fontSize: 16,
      fontWeight: '800',
      color:
        colors.neutral[900],
      textAlign:
        'center',
    },

    errorMessage: {
      marginTop: 6,
      fontSize: 13,
      color:
        colors.neutral[500],
      textAlign:
        'center',
    },

    retryButtonInline: {
      marginTop: 15,
      paddingHorizontal: 18,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor:
        colors.primary[500],
    },

    retryButtonInlineText: {
      fontSize: 13,
      color:
        '#FFFFFF',
      fontWeight: '800',
    },

    resetEmptyButton: {
      marginTop: 16,
      paddingHorizontal: 16,
      paddingVertical: 9,
      borderRadius: 12,
      backgroundColor:
        '#F0FDF4',
    },

    resetEmptyButtonText: {
      color:
        '#166534',
      fontSize: 13,
      fontWeight: '700',
    },

    // ===================================================
    // STATUS
    // ===================================================

    statusBox: {
      padding: 14,
      borderRadius: 16,
      marginHorizontal: 16,
      marginTop: 12,
      marginBottom: 18,
      borderWidth: 1,
    },

    statusEditable: {
      backgroundColor:
        '#F0FDF4',
      borderColor:
        '#BBF7D0',
    },

    statusReadOnly: {
      backgroundColor:
        '#FFF7ED',
      borderColor:
        '#FED7AA',
    },

    statusHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    statusDot: {
      width: 9,
      height: 9,
      borderRadius: 5,
      marginRight: 8,
    },

    statusDotEditable: {
      backgroundColor:
        '#22C55E',
    },

    statusDotReadonly: {
      backgroundColor:
        '#F59E0B',
    },

    statusText: {
      fontSize: 15,
      fontWeight: '800',
      color:
        '#374151',
    },

    statusDescription: {
      marginTop: 6,
      color:
        '#6B7280',
      fontSize: 13,
      lineHeight: 19,
    },

    // ===================================================
    // SECTION
    // ===================================================

    sectionHeader: {
      paddingHorizontal: 16,
      marginBottom: 10,
      flexDirection:
        'row',
      justifyContent:
        'space-between',
      alignItems:
        'center',
    },

    sectionTitleBlock: {
      flex: 1,
    },

    sectionTitle: {
      fontSize: 19,
      fontWeight: '800',
      color:
        colors.neutral[900],
      letterSpacing: -0.3,
    },

    sectionSubtitle: {
      marginTop: 4,
      fontSize: 12,
      lineHeight: 18,
      color:
        colors.neutral[500],
    },

    countText: {
      fontSize: 12,
      color:
        colors.neutral[500],
      marginLeft: 8,
    },

    // ===================================================
    // FAB
    // ===================================================

    fab: {
      position: 'absolute',
      right: 18,
      bottom: 18,
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
      elevation: 10,
      zIndex: 50,
    },

    // ===================================================
    // MODALS
    // ===================================================

    modalOverlay: {
      flex: 1,
      justifyContent:
        'flex-end',
    },

    modalBackdrop: {
      ...StyleSheet.absoluteFill,
      backgroundColor:
        'rgba(15,23,42,0.48)',
    },

    filterSheet: {
      backgroundColor:
        '#F8FBF7',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight:
        '88%',
      overflow:
        'hidden',
    },

    addSheet: {
      backgroundColor:
        '#F8FBF7',
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      maxHeight:
        '90%',
      overflow:
        'hidden',
    },

    sheetHandle: {
      width: 42,
      height: 5,
      borderRadius: 3,
      backgroundColor:
        '#D1D5DB',
      alignSelf:
        'center',
      marginTop: 9,
      marginBottom: 5,
    },

    sheetHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 14,
      borderBottomWidth: 1,
      borderBottomColor:
        '#E5EDE5',
    },

    addSheetTitleBlock: {
      flex: 1,
      paddingRight: 10,
    },

    sheetTitle: {
      fontSize: 20,
      fontWeight: '800',
      color:
        '#172018',
    },

    sheetSubtitle: {
      marginTop: 3,
      fontSize: 12,
      color:
        '#7A847A',
    },

    sheetCloseButton: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor:
        '#EEF2EE',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    sheetContent: {
      padding: 20,
      paddingBottom: 30,
    },

    filterLabelCulture: {
      marginTop: 20,
    },

    filterDropdown: {
      marginTop: 7,
      backgroundColor:
        '#FFFFFF',
      borderRadius: 15,
      borderWidth: 1,
      borderColor:
        '#E3EDE3',
      overflow:
        'hidden',
    },

    filterDropdownScroll: {
      maxHeight: 190,
    },

    filterDropdownItem: {
      minHeight: 50,
      paddingHorizontal: 13,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F1',
    },

    filterDropdownItemSelected: {
      backgroundColor:
        '#F0FDF4',
    },

    dropdownItemLeft: {
      flex: 1,
      flexDirection:
        'row',
      alignItems:
        'center',
      minWidth: 0,
    },

    filterDropdownItemText: {
      marginLeft: 9,
      fontSize: 14,
      color:
        '#374151',
      fontWeight: '600',
    },

    filterDropdownItemTextSelected: {
      color:
        '#166534',
      fontWeight: '800',
    },

    dropdownLoading: {
      minHeight: 70,
      alignItems:
        'center',
      justifyContent:
        'center',
      paddingHorizontal: 15,
    },

    dropdownLoadingText: {
      marginTop: 7,
      fontSize: 12,
      color:
        '#6B7280',
    },

    dropdownEmpty: {
      padding: 18,
      fontSize: 13,
      color:
        '#6B7280',
      textAlign:
        'center',
    },

    dropdownError: {
      color:
        '#B91C1C',
      fontSize: 13,
      textAlign:
        'center',
    },

    // ===================================================
    // CULTURE DROPDOWN
    // ===================================================

    filterCultureItem: {
      minHeight: 64,
      paddingHorizontal: 13,
      paddingVertical: 9,
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'space-between',
      borderBottomWidth: 1,
      borderBottomColor:
        '#F1F5F1',
    },

    filterCultureItemSelected: {
      backgroundColor:
        '#F0FDF4',
    },

    filterCultureItemDisabled: {
      backgroundColor:
        '#F9FAF9',
      opacity: 0.65,
    },

    filterCultureInfo: {
      flex: 1,
      marginRight: 8,
    },

    filterCultureNameRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    filterCultureName: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
      color:
        '#1F2937',
      fontWeight: '700',
    },

    filterCultureStatus: {
      marginTop: 4,
      marginLeft: 24,
      fontSize: 11,
      color:
        '#7A847A',
    },

    disabledCultureText: {
      color:
        '#9CA3AF',
    },

    selectedCheckCircle: {
      width: 25,
      height: 25,
      borderRadius: 13,
      backgroundColor:
        '#22C55E',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    // ===================================================
    // SUIVI
    // ===================================================

    followSection: {
      marginTop: 22,
    },

    followButton: {
      minHeight: 68,
      backgroundColor:
        '#166534',
      borderRadius: 17,
      paddingHorizontal: 8,
      flexDirection:
        'row',
      alignItems:
        'center',
    },

    followButtonDisabled: {
      backgroundColor:
        '#E5E7EB',
    },

    followButtonIcon: {
      width: 46,
      height: 46,
      borderRadius: 15,
      backgroundColor:
        '#22C55E',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    followButtonContent: {
      flex: 1,
      marginLeft: 11,
      marginRight: 8,
    },

    followButtonTitle: {
      color:
        '#FFFFFF',
      fontSize: 15,
      fontWeight: '800',
    },

    followButtonSubtitle: {
      marginTop: 3,
      color:
        '#DCFCE7',
      fontSize: 11,
      fontWeight: '500',
    },

    // ===================================================
    // AJOUT — ETAPES
    // ===================================================

    stepHeader: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginBottom: 10,
    },

    stepHeaderSecond: {
      marginTop: 22,
    },

    stepNumber: {
      width: 32,
      height: 32,
      borderRadius: 11,
      backgroundColor:
        '#DCFCE7',
      alignItems:
        'center',
      justifyContent:
        'center',
      marginRight: 10,
    },

    stepNumberText: {
      color:
        '#166534',
      fontSize: 14,
      fontWeight: '800',
    },

    stepTitle: {
      color:
        '#172018',
      fontSize: 14,
      fontWeight: '800',
    },

    stepSubtitle: {
      marginTop: 2,
      color:
        '#7A847A',
      fontSize: 11,
    },

    addSummaryCard: {
      flexDirection:
        'row',
      alignItems:
        'center',
      backgroundColor:
        '#F0FDF4',
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        '#BBF7D0',
      padding: 13,
      marginTop: 20,
    },

    addSummaryIcon: {
      width: 38,
      height: 38,
      borderRadius: 13,
      backgroundColor:
        '#DCFCE7',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    addSummaryContent: {
      flex: 1,
      marginLeft: 10,
    },

    addSummaryLabel: {
      fontSize: 9,
      fontWeight: '800',
      color:
        '#6B7280',
      letterSpacing: 0.7,
    },

    addSummaryCulture: {
      marginTop: 2,
      fontSize: 14,
      fontWeight: '800',
      color:
        '#166534',
    },

    addSummaryParcelRow: {
      flexDirection:
        'row',
      alignItems:
        'center',
      marginTop: 3,
    },

    addSummaryParcel: {
      marginLeft: 4,
      flex: 1,
      fontSize: 11,
      color:
        '#6B7280',
      fontWeight: '600',
    },

    // ===================================================
    // SHEET ACTIONS
    // ===================================================

    sheetActions: {
      flexDirection:
        'row',
      gap: 10,
      paddingHorizontal: 20,
      paddingTop: 12,
      paddingBottom: 20,
      backgroundColor:
        '#FFFFFF',
      borderTopWidth: 1,
      borderTopColor:
        '#E5EDE5',
    },

    resetButton: {
      flex: 1,
      minHeight: 48,
      borderRadius: 14,
      backgroundColor:
        '#F3F4F3',
      alignItems:
        'center',
      justifyContent:
        'center',
    },

    resetButtonText: {
      color:
        '#4B5563',
      fontSize: 13,
      fontWeight: '700',
    },

    applyButton: {
      flex: 1.3,
      minHeight: 48,
      borderRadius: 14,
      backgroundColor:
        '#166534',
      flexDirection:
        'row',
      alignItems:
        'center',
      justifyContent:
        'center',
      gap: 7,
    },

    applyButtonDisabled: {
      backgroundColor:
        '#E5E7EB',
    },

    applyButtonText: {
      color:
        '#FFFFFF',
      fontSize: 14,
      fontWeight: '800',
    },

    applyButtonTextDisabled: {
      color:
        '#9CA3AF',
    },
  });