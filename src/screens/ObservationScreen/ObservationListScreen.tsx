/**
 * ObservationListScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
 

import { useCallback, useMemo, useState, } from 'react';

import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from 'react-native';





import { router, useFocusEffect, useLocalSearchParams,} from 'expo-router';

import { useQueries } from '@tanstack/react-query';

import {
  queryKeys,
  useCulturesDeParcelle,
  useDeleteObservation,
  useObservations,
  useParcelles,
} from '@/hooks';











import { colors } from '@/theme';



import { styles } from './ObservationListScreen.styles';
import { CultureGlobale, ObservationGlobale, StatutCulture , ouvrirModificationGlobale } from '@/screens/ObservationScreen/ObservationListScreen.helpers';

import { ModeCulture } from '@/components/ObservationComponent/ModeCulture';
import { VueObservations } from '@/components/ObservationComponent/VueObservations';
import type {
  Observation,
} from '@/types';
import { observationsCulturesApi } from './observationsCulturesApi';
/**
 * Instant de référence du rendu.
 * Capturé une fois au chargement du module afin de garder le rendu **pur**
 * (les règles React interdisent `Date.now()` pendant le rendu).
 */
const maintenant = Date.now();

// ======================================================
// TYPES
// ======================================================

// ======================================================
// OUTILS
// ======================================================

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
    useParcelles({ limit: 200 });

  /** `useParcelles` renvoie une page paginée : l'écran travaille sur la liste. */
  const parcelles = useMemo(
    () => parcellesQuery.data?.items ?? [],
    [parcellesQuery.data],
  );

  // ====================================================
  // CULTURES FILTRE
  // ====================================================

  const culturesQuery =
    useCulturesDeParcelle(
      parcelleTemporaire,
    );

  const culturesFiltre = useMemo(
    () => culturesQuery.data ?? [],
    [culturesQuery.data],
  );

  // ====================================================
  // CULTURES AJOUT
  // ====================================================

  const culturesAjoutQuery =
    useCulturesDeParcelle(
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
            queryKey:
              queryKeys.culturesParcelle(parcelle.id),

            queryFn: () =>
              observationsCulturesApi(
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
            queryKey:
              queryKeys.observations(culture.id),

            queryFn: () =>
              observationsCulturesApi.observations(
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
              maintenant -
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
    useObservations(cultureId);

  const observations = useMemo(
    () => observationsQuery.data ?? [],
    [observationsQuery.data],
  );

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
                      id: observation.id,
                      cultureId,
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
                      id:
                        item.observation.id,

                      cultureId:
                        item.cultureId,
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
      <VueObservations
        actualiser={actualiser}
        ajoutOuvert={ajoutOuvert}
        appliquerFiltre={appliquerFiltre}
        chargementGlobal={chargementGlobal}
        confirmerSuppressionGlobale={confirmerSuppressionGlobale}
        continuerAjoutGlobal={continuerAjoutGlobal}
        cultureAjout={cultureAjout}
        culturePourSelection={culturePourSelection}
        cultureSelectionnee={cultureSelectionnee}
        cultureTemporaire={cultureTemporaire}
        culturesAjout={culturesAjout}
        culturesAjoutQuery={culturesAjoutQuery}
        culturesFiltre={culturesFiltre}
        culturesGlobales={culturesGlobales}
        culturesQuery={culturesQuery}
        erreurGlobal={erreurGlobal}
        fermerAjoutGlobal={fermerAjoutGlobal}
        fermerFiltre={fermerFiltre}
        filtreActif={filtreActif}
        filtreOuvert={filtreOuvert}
        observationsGlobalesFiltrees={observationsGlobalesFiltrees}
        ouvrirAjoutGlobal={ouvrirAjoutGlobal}
        ouvrirFiltre={ouvrirFiltre}
        ouvrirModificationGlobale={ouvrirModificationGlobale}
        parcelleAjout={parcelleAjout}
        parcellePourSelection={parcellePourSelection}
        parcelleSelectionnee={parcelleSelectionnee}
        parcelleTemporaire={parcelleTemporaire}
        parcelles={parcelles}
        parcellesQuery={parcellesQuery}
        recherche={recherche}
        reinitialiserFiltre={reinitialiserFiltre}
        selectionCultureAjoutOuverte={selectionCultureAjoutOuverte}
        selectionCultureOuverte={selectionCultureOuverte}
        selectionParcelleAjoutOuverte={selectionParcelleAjoutOuverte}
        selectionParcelleOuverte={selectionParcelleOuverte}
        setCultureAjout={setCultureAjout}
        setCultureTemporaire={setCultureTemporaire}
        setParcelleAjout={setParcelleAjout}
        setParcelleTemporaire={setParcelleTemporaire}
        setRecherche={setRecherche}
        setSelectionCultureAjoutOuverte={setSelectionCultureAjoutOuverte}
        setSelectionCultureOuverte={setSelectionCultureOuverte}
        setSelectionParcelleAjoutOuverte={setSelectionParcelleAjoutOuverte}
        setSelectionParcelleOuverte={setSelectionParcelleOuverte}
        statistiquesGlobales={statistiquesGlobales}
        voirSuivi={voirSuivi}
      />
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
    <ModeCulture
      actualiser={actualiser}
      confirmerSuppression={confirmerSuppression}
      cultureId={cultureId}
      cultureNom={cultureNom}
      lectureSeule={lectureSeule}
      modificationAutorisee={modificationAutorisee}
      observationsFiltrees={observationsFiltrees}
      ouvrirAjout={ouvrirAjout}
      ouvrirModification={ouvrirModification}
      parcelleId={parcelleId}
      parcelleNom={parcelleNom}
      refreshing={refreshing}
      statut={statut}
    />
  );
}

// ======================================================
// CARTE OBSERVATION
// ======================================================

// ======================================================
// STYLES
// ======================================================
