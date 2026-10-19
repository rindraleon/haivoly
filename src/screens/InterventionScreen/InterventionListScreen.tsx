 
import { i18n } from '@/i18n/instance';

import { useCallback, useMemo, useState } from 'react';

import { Alert, Text, TouchableOpacity, View } from 'react-native';





import {
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';

import { useQueries } from '@tanstack/react-query';


import {
  queryKeys,
  useCreateIntervention,
  useCulturesDeParcelle,
  useDeleteIntervention,
  useInterventions,
  useParcelles,
  useUpdateIntervention,
} from '@/hooks';

import { useStylesInterventions } from './stylesInterventions';
import { interventionPhotosApi } from '@/services';
import { envoyerPhotosEnAttente } from '@/utils/envoiPhotos';
import type { PhotoBrouillon } from '@/components/CommonComponent/PhotosSelection';

import { ContexteFormulaire, CultureGlobale, Intervention, InterventionGlobale, StatutCulture, interventionDate, normaliserErreur } from '@/screens/InterventionScreen/InterventionListScreen.helpers';

import { InterventionCard } from '@/components/InterventionComponent/InterventionCard';
import { ResumeInterventions } from '@/components/InterventionComponent/ResumeInterventions';
import { VueInterventions } from '@/components/InterventionComponent/VueInterventions';
import { VueInterventionsCulture } from '@/components/InterventionComponent/VueInterventionsCulture';
import { interventionsCulturesApi } from './interventionsCulturesApi';
import { logger } from '@/utils/logger';
const maintenant = Date.now();







export default function InterventionsCultureScreen() {
  const styles = useStylesInterventions();
  const params = useLocalSearchParams<{
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

  const modeGlobal = !parcelleId || !cultureId;


  const [parcelleSelectionnee, setParcelleSelectionnee] =
    useState('');

  const [cultureSelectionnee, setCultureSelectionnee] =
    useState('');

  const [parcelleTemporaire, setParcelleTemporaire] =
    useState('');

  const [cultureTemporaire, setCultureTemporaire] =
    useState('');

  const [selectionParcelleOuverte, setSelectionParcelleOuverte] =
    useState(false);

  const [selectionCultureOuverte, setSelectionCultureOuverte] =
    useState(false);

  const [filtreOuvert, setFiltreOuvert] = useState(false);

  const [modeAjoutGlobal, setModeAjoutGlobal] = useState(false);

  const [recherche, setRecherche] = useState('');

  const [refreshing, setRefreshing] = useState(false);

  const parcellesQuery = useParcelles({ limit: 200 });
  /** `useParcelles` renvoie une page paginée : l'écran travaille sur la liste. */
  const parcelles = useMemo(
    () => parcellesQuery.data?.items ?? [],
    [parcellesQuery.data],
  );

  const culturesFiltreQuery =
    useCulturesDeParcelle(parcelleTemporaire);
  const culturesFiltre = culturesFiltreQuery.data ?? [];


  const culturesGlobalesQueries = useQueries({
    queries: parcelles.map(parcelle => ({
      queryKey: queryKeys.culturesParcelle(parcelle.id),
      queryFn: () => interventionsCulturesApi(parcelle.id),
      enabled: !!parcelle.id,
    })),
  });

  const culturesGlobales = useMemo<CultureGlobale[]>(() => {
    const resultat: CultureGlobale[] = [];

    parcelles.forEach((parcelle, index) => {
      const cultures = culturesGlobalesQueries[index]?.data ?? [];

      cultures.forEach(culture => {
        if (culture.statut === 'SUPPRIMEE') {
          return;
        }

        resultat.push({
          ...culture,
          parcelleId: parcelle.id,
          parcelleNom: parcelle.nom,
        });
      });
    });

    return resultat;
  }, [culturesGlobalesQueries, parcelles]);


  const interventionsGlobalesQueries = useQueries({
    queries: culturesGlobales.map(culture => ({
      queryKey: queryKeys.interventions(culture.id),
      queryFn: () => interventionsCulturesApi.interventions(culture.id),
      enabled: !!culture.parcelleId && !!culture.id,
    })),
  });

  const interventionsGlobales = useMemo<InterventionGlobale[]>(() => {
    const resultat: InterventionGlobale[] = [];

    culturesGlobales.forEach((culture, index) => {
      const interventions =
        interventionsGlobalesQueries[index]?.data ?? [];

      interventions.forEach(rawIntervention => {
        const intervention = rawIntervention as Intervention;

        resultat.push({
          intervention,
          parcelleId: culture.parcelleId,
          parcelleNom: culture.parcelleNom,
          cultureId: culture.id,
          cultureNom: culture.nom,
          statutCulture: culture.statut as StatutCulture,
        });
      });
    });

    return resultat.sort(
      (a, b) =>
        new Date(interventionDate(b.intervention) ?? 0).getTime() -
        new Date(interventionDate(a.intervention) ?? 0).getTime(),
    );
  }, [
    culturesGlobales,
    interventionsGlobalesQueries,
  ]);

  const interventionsGlobalesFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    return interventionsGlobales.filter(item => {
      const texte = [
        item.intervention.type,
        item.intervention.description,
        item.intervention.produit,
        item.intervention.unite,
        item.intervention.quantite,
        item.intervention.cout,
        item.cultureNom,
        item.parcelleNom,
        item.statutCulture,
      ]
        .filter(value => value !== undefined && value !== null)
        .join(' ')
        .toLowerCase();

      const correspondRecherche =
        !terme || texte.includes(terme);

      const correspondParcelle =
        !parcelleSelectionnee ||
        item.parcelleId === parcelleSelectionnee;

      const correspondCulture =
        !cultureSelectionnee ||
        item.cultureId === cultureSelectionnee;

      return (
        correspondRecherche &&
        correspondParcelle &&
        correspondCulture
      );
    });
  }, [
    interventionsGlobales,
    recherche,
    parcelleSelectionnee,
    cultureSelectionnee,
  ]);

  const statistiquesGlobales = useMemo(() => {
    const total = interventionsGlobales.length;
    const septJours = 7 * 24 * 60 * 60 * 1000;

    const recentes = interventionsGlobales.filter(item => {
      const timestamp = new Date(
        interventionDate(item.intervention) ?? '',
      ).getTime();

      return (
        Number.isFinite(timestamp) &&
        maintenant - timestamp <= septJours
      );
    }).length;

    return { total, recentes };
  }, [interventionsGlobales]);

  const chargementGlobal =
    parcellesQuery.isLoading ||
    culturesGlobalesQueries.some(query => query.isLoading) ||
    interventionsGlobalesQueries.some(query => query.isLoading);

  const erreurGlobal =
    parcellesQuery.isError ||
    culturesGlobalesQueries.some(query => query.isError) ||
    interventionsGlobalesQueries.some(query => query.isError);

  const filtreActif =
    !!parcelleSelectionnee ||
    !!cultureSelectionnee;


  const interventionsQuery = useInterventions(cultureId);

  const createMutation = useCreateIntervention();
  const updateMutation = useUpdateIntervention();
  const deleteMutation = useDeleteIntervention();

  const interventions: Intervention[] = useMemo(() => {
    return [...((interventionsQuery.data ?? []) as Intervention[])].sort(
      (a, b) =>
        new Date(b.date ?? 0).getTime() -
        new Date(a.date ?? 0).getTime(),
    );
  }, [interventionsQuery.data]);

  const interventionsFiltrees = useMemo(() => {
    const terme = recherche.trim().toLowerCase();

    if (!terme) {
      return interventions;
    }

    return interventions.filter(intervention => {
      const texte = [
        intervention.type,
        intervention.description,
        intervention.produit,
        intervention.unite,
        intervention.quantite,
        intervention.cout,
      ]
        .filter(value => value !== undefined && value !== null)
        .join(' ')
        .toLowerCase();

      return texte.includes(terme);
    });
  }, [interventions, recherche]);

  const statistiquesCourantes = useMemo(() => {
    const total = interventions.length;
    const septJours = 7 * 24 * 60 * 60 * 1000;

    const recentes = interventions.filter(intervention => {
      const timestamp = new Date(
        interventionDate(intervention) ?? '',
      ).getTime();

      return (
        Number.isFinite(timestamp) &&
        maintenant - timestamp <= septJours
      );
    }).length;

    return { total, recentes };
  }, [interventions]);


  const cultureSupprimee = statut === 'SUPPRIMEE';
  const lectureSeule =
    statut === 'RECOLTEE' ||
    statut === 'ABANDONNEE';
  const modificationAutorisee =
    !cultureSupprimee && !lectureSeule;


  const [formOuvert, setFormOuvert] = useState(false);

  const [interventionEnModification, setInterventionEnModification] =
    useState<Intervention | null>(null);

  const [contexteFormulaire, setContexteFormulaire] =
    useState<ContexteFormulaire | null>(null);

  const [type, setType] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [produit, setProduit] = useState('');
  const [quantite, setQuantite] = useState('');
  const [unite, setUnite] = useState('');
  const [cout, setCout] = useState('');
  // Photos mises en attente à la création (vue globale), envoyées après
  // que l'intervention existe côté serveur.
  const [photosBrouillon, setPhotosBrouillon] = useState<PhotoBrouillon[]>([]);


  const chargerInterventions = useCallback(async () => {
    if (parcelleId && cultureId) {
      await interventionsQuery.refetch();
    }
  }, [cultureId, interventionsQuery, parcelleId]);

  useFocusEffect(
    useCallback(() => {
      chargerInterventions();
    }, [chargerInterventions]),
  );

  const actualiser = useCallback(async () => {
    setRefreshing(true);

    try {
      const requetes: Promise<unknown>[] = [
        parcellesQuery.refetch(),
        ...culturesGlobalesQueries.map(query => query.refetch()),
        ...interventionsGlobalesQueries.map(query => query.refetch()),
      ];

      if (parcelleId && cultureId) {
        requetes.push(interventionsQuery.refetch());
      }

      await Promise.all(requetes);
    } finally {
      setRefreshing(false);
    }
  }, [
    parcellesQuery,
    culturesGlobalesQueries,
    interventionsGlobalesQueries,
    interventionsQuery,
    parcelleId,
    cultureId,
  ]);


  const ouvrirFiltre = () => {
    setModeAjoutGlobal(false);
    setParcelleTemporaire(parcelleSelectionnee);
    setCultureTemporaire(cultureSelectionnee);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(true);
  };

  const fermerFiltre = () => {
    setModeAjoutGlobal(false);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(false);
  };

  const appliquerFiltre = () => {
    setParcelleSelectionnee(parcelleTemporaire);
    setCultureSelectionnee(cultureTemporaire);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(false);
  };

  const reinitialiserFiltre = () => {
    setParcelleTemporaire('');
    setCultureTemporaire('');
    setParcelleSelectionnee('');
    setCultureSelectionnee('');
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(false);
  };

  const ouvrirAjout = () => {
    if (!parcelleId || !cultureId) {
      return;
    }

    if (!modificationAutorisee) {
      Alert.alert(
        i18n.t('divers.actionImpossible'),
        i18n.t('cultures.cultureLectureSeule'),
      );
      return;
    }

    setInterventionEnModification(null);
    setContexteFormulaire({
      parcelleId,
      cultureId,
      statut: statut ?? 'EN_COURS',
    });

    setType('');
    setDescription('');
    setDate(new Date().toISOString());
    setProduit('');
    setQuantite('');
    setUnite('');
    setCout('');
    setFormOuvert(true);
  };

  const ouvrirModification = (
    intervention: Intervention,
  ) => {
    if (!modificationAutorisee) {
      return;
    }

    setInterventionEnModification(intervention);
    setContexteFormulaire({
      parcelleId,
      cultureId,
      statut: statut ?? 'EN_COURS',
    });

    setType(intervention.type ?? '');
    setDescription(intervention.description ?? '');
    setDate(interventionDate(intervention) ?? new Date().toISOString());
    setProduit(intervention.produit ?? '');
    setQuantite(
      intervention.quantite === undefined ||
        intervention.quantite === null
        ? ''
        : String(intervention.quantite),
    );
    setUnite(intervention.unite ?? '');
    setCout(
      intervention.cout === undefined ||
        intervention.cout === null
        ? ''
        : String(intervention.cout),
    );
    setFormOuvert(true);
  };

  const ouvrirModificationGlobale = (
    item: InterventionGlobale,
  ) => {
    const autorisee =
      item.statutCulture !== 'SUPPRIMEE' &&
      item.statutCulture !== 'RECOLTEE' &&
      item.statutCulture !== 'ABANDONNEE';

    if (!autorisee) {
      return;
    }

    setInterventionEnModification(item.intervention);
    setContexteFormulaire({
      parcelleId: item.parcelleId,
      cultureId: item.cultureId,
      statut: item.statutCulture,
    });

    const intervention = item.intervention;

    setType(intervention.type ?? '');
    setDescription(intervention.description ?? '');
    setDate(interventionDate(intervention) ?? new Date().toISOString());
    setProduit(intervention.produit ?? '');
    setQuantite(
      intervention.quantite === undefined ||
        intervention.quantite === null
        ? ''
        : String(intervention.quantite),
    );
    setUnite(intervention.unite ?? '');
    setCout(
      intervention.cout === undefined ||
        intervention.cout === null
        ? ''
        : String(intervention.cout),
    );

    setFormOuvert(true);
  };

  const fermerFormulaire = () => {
    setPhotosBrouillon([]);
    setFormOuvert(false);
    setInterventionEnModification(null);
    setContexteFormulaire(null);
    setType('');
    setDescription('');
    setDate('');
    setProduit('');
    setQuantite('');
    setUnite('');
    setCout('');
  };

  const enregistrerIntervention = async () => {
    const contexte = contexteFormulaire;

    if (!contexte) {
      return;
    }

    if (!modificationAutorisee && contexte.parcelleId === parcelleId) {
      Alert.alert(
        i18n.t('divers.actionImpossible'),
        i18n.t('cultures.cultureLectureSeule'),
      );
      return;
    }

    if (!type.trim()) {
      Alert.alert(
        i18n.t('domaine.champObligatoire'),
        i18n.t('interventions.veuillezSaisirTypeD2'),
      );
      return;
    }

    if (!date.trim()) {
      Alert.alert(
        i18n.t('domaine.champObligatoire'),
        i18n.t('domaine.veuillezSaisirDate'),
      );
      return;
    }

    let quantiteValue: number | undefined;
    if (quantite.trim()) {
      quantiteValue = Number(
        quantite.replace(/\s/g, '').replace(',', '.'),
      );

      if (
        Number.isNaN(quantiteValue) ||
        quantiteValue < 0
      ) {
        Alert.alert(
          i18n.t('domaine.quantiteInvalide'),
          i18n.t('domaine.quantiteNumerique'),
        );
        return;
      }
    }

    let coutValue: number | undefined;
    if (cout.trim()) {
      coutValue = Number(
        cout.replace(/\s/g, '').replace(',', '.'),
      );

      if (
        Number.isNaN(coutValue) ||
        coutValue < 0
      ) {
        Alert.alert(
          i18n.t('domaine.coutInvalide'),
          i18n.t('domaine.coutNumerique'),
        );
        return;
      }
    }

    const data = {
      type: type.trim(),
      description: description.trim() || undefined,
      date: date.trim(),
      produit: produit.trim() || undefined,
      quantite: quantiteValue,
      unite: unite.trim() || undefined,
      cout: coutValue,
    };

    try {
      if (interventionEnModification) {
        await updateMutation.mutateAsync({
          id: interventionEnModification.id,
          cultureId: contexte.cultureId,
          body: data,
        });

        Alert.alert(
          i18n.t('domaine.succes'),
          i18n.t('interventions.modifieeSucces'),
        );
      } else {
        const creee = await createMutation.mutateAsync({
          cultureId: contexte.cultureId,
          body: data,
        });

        // Photos jointes : envoyées une fois l'intervention créée (hors-ligne
        // — intervention locale sans identifiant serveur — elles resteront à
        // ajouter depuis la fiche de l'intervention).
        setPhotosBrouillon([]);
        if (
          photosBrouillon.length > 0 &&
          creee?.id &&
          !creee._localOnly &&
          contexte.parcelleId
        ) {
          try {
            const bilan = await envoyerPhotosEnAttente(
              photosBrouillon,
              (fichier) =>
                interventionPhotosApi.upload(
                  contexte.parcelleId,
                  contexte.cultureId,
                  creee.id,
                  fichier,
                ),
            );

            if (bilan.echouees > 0) {
              Alert.alert(
                i18n.t('domaine.succes'),
                i18n.t('photos.photosJointesPartiel', {
                  envoyees: bilan.envoyees,
                  echouees: bilan.echouees,
                }),
              );
              return;
            }
          } catch {
            logger.warn('InterventionListScreen', "Échec de l'envoi des photos");
          }
        }

        Alert.alert(
          i18n.t('domaine.succes'),
          i18n.t('interventions.ajouteeSucces'),
        );
      }

      fermerFormulaire();

      if (
        contexte.parcelleId === parcelleId &&
        contexte.cultureId === cultureId
      ) {
        await interventionsQuery.refetch();
      }

      await Promise.all(
        interventionsGlobalesQueries.map(query =>
          query.refetch(),
        ),
      );
    } catch (error: any) {
      logger.warn('InterventionListScreen', 'Échec du chargement des interventions');

      Alert.alert(
        i18n.t('domaine.erreur'),
        normaliserErreur(error),
      );
    }
  };

  const supprimerIntervention = (
    intervention: Intervention,
  ) => {
    if (lectureSeule) {
      Alert.alert(
        i18n.t('divers.lectureSeule'),
        i18n.t('interventions.cultureNonModifiable'),
      );
      return;
    }

    if (cultureSupprimee) {
      Alert.alert(
        i18n.t('divers.actionImpossible'),
        i18n.t('interventions.cultureSupprimee'),
      );
      return;
    }

    Alert.alert(
      i18n.t('interventions.supprimerUne'),
      i18n.t('interventions.voulezVraimentSupprimerIntervention'),
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: i18n.t('libelles.supprimer'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                id: intervention.id,
                cultureId,
              });

              await interventionsQuery.refetch();

              await Promise.all(
                interventionsGlobalesQueries.map(query =>
                  query.refetch(),
                ),
              );
            } catch (error: any) {
              logger.warn('InterventionListScreen', "Échec de la suppression de l'intervention");

              Alert.alert(
                i18n.t('domaine.erreur'),
                normaliserErreur(error),
              );
            }
          },
        },
      ],
    );
  };

  const supprimerInterventionGlobale = (
    item: InterventionGlobale,
  ) => {
    const autorisee =
      item.statutCulture !== 'SUPPRIMEE' &&
      item.statutCulture !== 'RECOLTEE' &&
      item.statutCulture !== 'ABANDONNEE';

    if (!autorisee) {
      Alert.alert(
        i18n.t('divers.lectureSeule'),
        i18n.t('interventions.lectureSeule'),
      );
      return;
    }

    Alert.alert(
      i18n.t('interventions.supprimerUne'),
      i18n.t('interventions.voulezVraimentSupprimerIntervention'),
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: i18n.t('libelles.supprimer'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMutation.mutateAsync({
                id: item.intervention.id,
                cultureId: item.cultureId,
              });

              await Promise.all(
                interventionsGlobalesQueries.map(query =>
                  query.refetch(),
                ),
              );
            } catch (error: any) {
              logger.warn('InterventionListScreen', 'Échec de la suppression groupée');
              Alert.alert(i18n.t('domaine.erreur'), normaliserErreur(error));
            }
          },
        },
      ],
    );
  };

  const ouvrirAjoutGlobal = () => {
    setModeAjoutGlobal(true);
    setParcelleTemporaire('');
    setCultureTemporaire('');
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);
    setFiltreOuvert(true);
  };

  const continuerAjoutGlobal = () => {
    if (!parcelleTemporaire) {
      Alert.alert(
        i18n.t('domaine.selectionIncomplete'),
        i18n.t('domaine.selectionParcelleRequise'),
      );
      return;
    }

    if (!cultureTemporaire) {
      Alert.alert(
        i18n.t('domaine.selectionIncomplete'),
        i18n.t('domaine.selectionCultureRequise'),
      );
      return;
    }

    const parcelle = parcelles.find(
      item => item.id === parcelleTemporaire,
    );

    const culture = culturesFiltre.find(
      item => item.id === cultureTemporaire,
    );

    if (!parcelle || !culture) {
      Alert.alert(
        i18n.t('domaine.erreur'),
        i18n.t('domaine.entiteIntrouvable'),
      );
      return;
    }

    const autorisee =
      culture.statut !== 'SUPPRIMEE' &&
      culture.statut !== 'RECOLTEE' &&
      culture.statut !== 'ABANDONNEE';

    if (!autorisee) {
      Alert.alert(
        i18n.t('divers.actionImpossible'),
        i18n.t('cultures.cultureLectureSeuleNe'),
      );
      return;
    }

    setModeAjoutGlobal(false);
    setFiltreOuvert(false);
    setSelectionParcelleOuverte(false);
    setSelectionCultureOuverte(false);

    router.push({
      pathname: '/ajout-intervention',
      params: {
        parcelleId: parcelle.id,
        cultureId: culture.id,
        parcelleNom: parcelle.nom,
        cultureNom: culture.nom,
        statut: culture.statut,
      },
    });
  };

  const contexteValideGlobal =
    contexteFormulaire &&
    contexteFormulaire.statut !== 'RECOLTEE' &&
    contexteFormulaire.statut !== 'ABANDONNEE' &&
    contexteFormulaire.statut !== 'SUPPRIMEE';

  const renderFormulaireInline = (
    cultureLabel: string,
    parcelleLabel: string,
  ) => {
    if (!formOuvert || !contexteValideGlobal) {
      return null;
    }

    return (
      <VueInterventions
        cout={cout}
        createMutation={createMutation}
        cultureLabel={cultureLabel}
        date={date}
        description={description}
        enregistrerIntervention={enregistrerIntervention}
        fermerFormulaire={fermerFormulaire}
        interventionEnModification={interventionEnModification}
        parcelleId={contexteFormulaire?.parcelleId}
        cultureId={contexteFormulaire?.cultureId}
        photosBrouillon={photosBrouillon}
        onChangePhotosBrouillon={setPhotosBrouillon}
        parcelleLabel={parcelleLabel}
        produit={produit}
        quantite={quantite}
        setCout={setCout}
        setDate={setDate}
        setDescription={setDescription}
        setProduit={setProduit}
        setQuantite={setQuantite}
        setType={setType}
        setUnite={setUnite}
        type={type}
        unite={unite}
        updateMutation={updateMutation}
      />
    );
  };

  const voirSuivi = () => {
    if (!parcelleTemporaire) {
      Alert.alert(
        i18n.t('domaine.selectionIncomplete'),
        i18n.t('domaine.selectionParcelleRequise'),
      );
      return;
    }

    if (!cultureTemporaire) {
      Alert.alert(
        i18n.t('domaine.selectionIncomplete'),
        i18n.t('domaine.selectionCultureRequise'),
      );
      return;
    }

    const parcelle = parcelles.find(
      item => item.id === parcelleTemporaire,
    );

    const culture = culturesFiltre.find(
      item => item.id === cultureTemporaire,
    );

    if (!parcelle || !culture) {
      Alert.alert(
        i18n.t('domaine.erreur'),
        i18n.t('domaine.entiteIntrouvable'),
      );
      return;
    }

    setFiltreOuvert(false);

    router.push({
      pathname: '/interventions-culture',
      params: {
        parcelleId: parcelle.id,
        cultureId: culture.id,
        parcelleNom: parcelle.nom,
        cultureNom: culture.nom,
        statut: culture.statut,
      },
    });
  };


  const renderCarteIntervention = (
    item: InterventionGlobale,
  ) => (
    <InterventionCard
      key={`${item.parcelleId}-${item.cultureId}-${item.intervention.id}`}
      intervention={item.intervention}
      parcelleId={item.parcelleId}
      cultureId={item.cultureId}
      parcelleNom={item.parcelleNom}
      cultureNom={item.cultureNom}
      statutCulture={item.statutCulture}
      modificationAutorisee={
        item.statutCulture !== 'SUPPRIMEE' &&
        item.statutCulture !== 'RECOLTEE' &&
        item.statutCulture !== 'ABANDONNEE'
      }
      onModifier={() => ouvrirModificationGlobale(item)}
      onSupprimer={() => supprimerInterventionGlobale(item)}
    />
  );


  if (cultureSupprimee) {
    return (
      <View style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.blockedIcon}>🚫</Text>
          <Text style={styles.blockedTitle}>
            Culture supprimée
          </Text>
          <Text style={styles.blockedText}>
            Cette culture est supprimée. Les interventions ne peuvent plus être
            modifiées.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.85}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }


  if (modeGlobal) {
    return (
      <VueInterventionsCulture
        actualiser={actualiser}
        appliquerFiltre={appliquerFiltre}
        chargementGlobal={chargementGlobal}
        contexteFormulaire={contexteFormulaire}
        contexteValideGlobal={contexteValideGlobal}
        continuerAjoutGlobal={continuerAjoutGlobal}
        cultureSelectionnee={cultureSelectionnee}
        cultureTemporaire={cultureTemporaire}
        culturesFiltre={culturesFiltre}
        culturesFiltreQuery={culturesFiltreQuery}
        culturesGlobales={culturesGlobales}
        erreurGlobal={erreurGlobal}
        fermerFiltre={fermerFiltre}
        filtreActif={filtreActif}
        filtreOuvert={filtreOuvert}
        formOuvert={formOuvert}
        interventionsGlobalesFiltrees={interventionsGlobalesFiltrees}
        modeAjoutGlobal={modeAjoutGlobal}
        ouvrirAjoutGlobal={ouvrirAjoutGlobal}
        ouvrirFiltre={ouvrirFiltre}
        parcelleSelectionnee={parcelleSelectionnee}
        parcelleTemporaire={parcelleTemporaire}
        parcelles={parcelles}
        parcellesQuery={parcellesQuery}
        recherche={recherche}
        refreshing={refreshing}
        reinitialiserFiltre={reinitialiserFiltre}
        renderCarteIntervention={renderCarteIntervention}
        renderFormulaireInline={renderFormulaireInline}
        selectionCultureOuverte={selectionCultureOuverte}
        selectionParcelleOuverte={selectionParcelleOuverte}
        setCultureTemporaire={setCultureTemporaire}
        setParcelleTemporaire={setParcelleTemporaire}
        setRecherche={setRecherche}
        setSelectionCultureOuverte={setSelectionCultureOuverte}
        setSelectionParcelleOuverte={setSelectionParcelleOuverte}
        statistiquesGlobales={statistiquesGlobales}
        voirSuivi={voirSuivi}
      />
    );
  }


  return (
    <ResumeInterventions
      actualiser={actualiser}
      cultureId={cultureId}
      cultureNom={cultureNom}
      interventionsFiltrees={interventionsFiltrees}
      interventionsQuery={interventionsQuery}
      lectureSeule={lectureSeule}
      modificationAutorisee={modificationAutorisee}
      ouvrirAjout={ouvrirAjout}
      ouvrirModification={ouvrirModification}
      parcelleId={parcelleId}
      parcelleNom={parcelleNom}
      recherche={recherche}
      refreshing={refreshing}
      renderFormulaireInline={renderFormulaireInline}
      setRecherche={setRecherche}
      statistiquesCourantes={statistiquesCourantes}
      statut={statut}
      supprimerIntervention={supprimerIntervention}
    />
  );
}

