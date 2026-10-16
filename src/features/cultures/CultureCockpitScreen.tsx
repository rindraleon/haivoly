import { useQueryClient } from '@tanstack/react-query';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import {
  Camera,
  ChevronRight,
  ClipboardList,
  CloudUpload,
  Eye,
  MapPinned,
  Pencil,
  PenTool,
  Sprout,
  TriangleAlert,
  Wheat,
  Wrench,
  type LucideIcon,
} from 'lucide-react-native';
import { useCallback, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { etatSynchroEntite } from '@/features/commun/regles';
import { CarteParcelle } from '@/features/parcelles/CarteParcelle';
import { useCulture, useInterventions, useObservations, usePointsGPSCulture } from '@/hooks';
import type { Culture, Intervention, Observation, Paginated, Parcelle } from '@/types';
import {
  AlertCard,
  Badge,
  Card,
  CropStatusBadge,
  DetailScreen,
  EmptyState,
  KpiCard,
  PrimaryButton,
  ProgressBar,
  SectionHeader,
  Skeleton,
  Text,
  Touchable,
  useTheme,
} from '@/ui';
import { daysBetween, formatDate, formatDateTime, todayDateOnly } from '@/utils/date';
import { formatNombre } from '@/utils/formatNombre';
import { centroid } from '@/utils/parcelle';

import { ChangementStatutCultureSheet, ICONES_STATUT_CULTURE } from './ChangementStatutCultureSheet';
import {
  dureeCycle,
  echeanceRecolte,
  ficheModifiable,
  libelleEcheance,
  peutEnregistrerRecolte,
  progressionCulture,
  raisonsAlerte,
  statutVisuel,
  suiviModifiable,
  transitionsStatutCulture,
  type StatutCibleCulture,
} from './regles';

/** Éléments récents montrés dans le cockpit avant « Tout afficher ». */
const APERCU = 3;
const SOMMETS_MINIMUM = 3;

function parDateDecroissante<T extends { date: string }>(elements: readonly T[]): T[] {
  return [...elements].sort((a, b) => (Date.parse(b.date) || 0) - (Date.parse(a.date) || 0));
}

/**
 * Détail culture V2 « cockpit » (lot 3). Parité V1 (`CultureDetailScreen`,
 * F-29) : cycle de vie, informations, interventions, « Enregistrer la
 * récolte », « Modifier ». Ajouts, sur les données existantes :
 * - alertes (récolte en retard, échec d'envoi, dates manquantes) avec action ;
 * - actions rapides Observer / Intervenir / Récolter (≤ 2 taps) ;
 * - observations de la culture (jusque-là seulement dans l'onglet Suivi) ;
 * - fiche de récolte (F-46 : route `/recoltes` jusque-là orpheline) ;
 * - zone tracée de la culture + « Délimiter » (F-28 : délimitation jusque-là
 *   accessible seulement juste après la création) ;
 * - statut : démarrer, abandonner, reprendre (transitions acceptées par le
 *   serveur ; « Récoltée » passe par la fiche de récolte, UX-13).
 * Saisie fermée sur un cycle terminé, comme le serveur (F-38, F-44).
 */
export function CultureCockpitScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const client = useQueryClient();
  const params = useLocalSearchParams<{ id?: string; cultureId?: string; parcelleId?: string }>();
  const idCulture = params.id ?? params.cultureId;
  const culture = useCulture(params.parcelleId, idCulture);
  const parcelleId = params.parcelleId ?? culture.data?.parcelleId;
  const interventions = useInterventions(idCulture);
  const observations = useObservations(idCulture);
  const points = usePointsGPSCulture(parcelleId, idCulture);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [cibleStatut, setCibleStatut] = useState<StatutCibleCulture | null>(null);
  const [toutesObservations, setToutesObservations] = useState(false);

  // Retour de l'écran de délimitation (V1) : le tracé est relu au retour.
  const premiereFocalisation = useRef(true);
  const relirePoints = points.refetch;
  useFocusEffect(
    useCallback(() => {
      if (premiereFocalisation.current) {
        premiereFocalisation.current = false;
        return;
      }
      void relirePoints();
    }, [relirePoints]),
  );

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/cultures'));
  const libelleRetour = t('commun.actions.retour');

  // Données déjà affichées : un rafraîchissement en échec (réseau coupé) ne
  // remplace jamais le cockpit par un écran d'erreur.
  if (!culture.data && culture.isLoading) {
    return (
      <DetailScreen title={t('cultures.chargementCulture')} onBack={retour} backLabel={libelleRetour}>
        <SqueletteCockpit />
      </DetailScreen>
    );
  }

  if (!culture.data) {
    return (
      <DetailScreen title={t('libelles.cultureIntrouvable')} onBack={retour} backLabel={libelleRetour}>
        <AlertCard
          tone="error"
          title={t('libelles.cultureIntrouvable')}
          message={t('parcelles.verifiezConnexion')}
          actionLabel={t('commun.actions.reessayer')}
          onAction={() => culture.refetch()}
          actionLoading={culture.isFetching}
          testID="culture-erreur"
        />
      </DetailScreen>
    );
  }

  const data: Culture = culture.data;
  const aujourdhui = todayDateOnly();
  const echeance = echeanceRecolte(data, aujourdhui);
  const raisons = raisonsAlerte(data, aujourdhui);
  const synchro = etatSynchroEntite(data);
  const enCours = data.statut === 'EN_COURS';
  const progression = enCours ? progressionCulture(data) : data.statut === 'RECOLTEE' ? 1 : null;
  const duree = dureeCycle(data);
  const joursDepuisPlantation =
    data.datePlantation && data.datePlantation <= aujourdhui && (enCours || data.statut === 'RECOLTEE')
      ? daysBetween(data.datePlantation, data.recolte?.dateRecolte ?? aujourdhui)
      : null;
  const saisieOuverte = suiviModifiable(data);
  const modifiable = ficheModifiable(data);
  const recoltable = peutEnregistrerRecolte(data);
  const transitions = transitionsStatutCulture(data.statut);

  const nomParcelle =
    data.parcelle?.nom ??
    client
      .getQueriesData<Paginated<Parcelle>>({ queryKey: ['parcelles'] })
      .flatMap(([, page]) => page?.items ?? [])
      .find((parcelle) => parcelle.id === data.parcelleId)?.nom ??
    null;

  const listeInterventions = parDateDecroissante(interventions.data ?? []);
  const listeObservations = parDateDecroissante(observations.data ?? []);
  const observationsVisibles = toutesObservations ? listeObservations : listeObservations.slice(0, APERCU);
  const trace = points.data ?? [];
  const centreTrace =
    centroid(trace) ??
    (data.parcelle?.latitude != null && data.parcelle?.longitude != null
      ? { latitude: Number(data.parcelle.latitude), longitude: Number(data.parcelle.longitude) }
      : null);

  // Paramètres attendus par les écrans V1 de suivi (mode « culture »).
  const contexte = {
    parcelleId: data.parcelleId,
    cultureId: data.id,
    parcelleNom: nomParcelle ?? '',
    cultureNom: data.nom,
    statut: data.statut,
  };

  const rafraichir = async () => {
    setRafraichissement(true);
    try {
      await Promise.all([culture.refetch(), interventions.refetch(), observations.refetch(), points.refetch()]);
    } finally {
      setRafraichissement(false);
    }
  };

  const modifier = () =>
    router.push({
      pathname: '/modifier-culture',
      params: { parcelleId: data.parcelleId, cultureId: data.id, parcelleNom: nomParcelle ?? '' },
    });
  const observer = () => router.push({ pathname: '/ajout-observation', params: contexte });
  const intervenir = () =>
    router.push({ pathname: '/ajout-intervention', params: { cultureId: data.id, parcelleId: data.parcelleId } });
  const recolter = () =>
    router.push({ pathname: '/ajout-recolte', params: { cultureId: data.id, parcelleId: data.parcelleId } });
  const voirRecolte = () => router.push({ pathname: '/recoltes', params: { cultureId: data.id } });
  const voirInterventions = () => router.push({ pathname: '/interventions-culture', params: contexte });
  const delimiter = () =>
    router.push({
      pathname: '/delimiter-culture',
      params: { parcelleId: data.parcelleId, cultureId: data.id, cultureNom: data.nom },
    });
  const modifierObservation = (observation: Observation) =>
    router.push({ pathname: '/modifier-observation', params: { ...contexte, observationId: observation.id } });
  // Lot 4 : la ligne d'intervention du cockpit ouvre le formulaire V2 pré-rempli
  // (route `/modifier-intervention` reliée — résorption de route orpheline).
  const modifierIntervention = (intervention: Intervention) =>
    router.push({ pathname: '/modifier-intervention', params: { ...contexte, interventionId: intervention.id } });

  // Action principale du pied, selon l'étape du cycle : libellé court (deux
  // boutons tiennent à 375 px), libellé complet pour les lecteurs d'écran.
  const actionPrincipale: { label: string; a11y: string; icone: LucideIcon; onPress: () => void; testID: string } | null =
    recoltable
      ? { label: t('ecranCultures.detail.recolter'), a11y: t('recoltes.enregistrer'), icone: Wheat, onPress: recolter, testID: 'culture-recolter' }
      : data.statut === 'PLANIFIEE'
        ? {
            label: t('ecranCultures.detail.demarrer'),
            a11y: t('ecranCultures.statut.actions.EN_COURS'),
            icone: ICONES_STATUT_CULTURE.EN_COURS,
            onPress: () => setCibleStatut('EN_COURS'),
            testID: 'culture-demarrer',
          }
        : data.statut === 'ABANDONNEE'
          ? {
              label: t('ecranCultures.detail.reprendre'),
              a11y: t('ecranCultures.statut.actions.PLANIFIEE'),
              icone: ICONES_STATUT_CULTURE.PLANIFIEE,
              onPress: () => setCibleStatut('PLANIFIEE'),
              testID: 'culture-reprendre',
            }
          : data.statut === 'RECOLTEE'
            ? {
                label: t('ecranCultures.detail.voirRecolte'),
                a11y: t('ecranCultures.detail.voirRecolte'),
                icone: Wheat,
                onPress: voirRecolte,
                testID: 'culture-voir-recolte',
              }
            : null;

  const titre = data.variete ? `${data.nom} · ${data.variete}` : data.nom;

  return (
    <DetailScreen
      title={titre}
      subtitle={nomParcelle ? t('ecranCultures.detail.parcelle', { nom: nomParcelle }) : undefined}
      onBack={retour}
      backLabel={libelleRetour}
      refreshing={rafraichissement}
      onRefresh={rafraichir}
      testID="ecran-culture-v2"
      footer={
        modifiable || actionPrincipale ? (
          <View style={styles.actions}>
            {modifiable ? (
              <PrimaryButton
                label={t('commun.actions.modifier')}
                icon={Pencil}
                variant="outline"
                size="md"
                onPress={modifier}
                style={styles.flex}
                testID="culture-modifier"
              />
            ) : null}
            {actionPrincipale ? (
              <PrimaryButton
                label={actionPrincipale.label}
                accessibilityLabel={actionPrincipale.a11y}
                icon={actionPrincipale.icone}
                size="md"
                onPress={actionPrincipale.onPress}
                style={styles.flex}
                testID={actionPrincipale.testID}
              />
            ) : null}
          </View>
        ) : undefined
      }
    >
      <View style={styles.badges}>
        {data.statut === 'SUPPRIMEE' ? (
          <Badge label={t('statuts.SUPPRIMEE')} tone="erreur" />
        ) : (
          <CropStatusBadge status={statutVisuel(data, aujourdhui)} />
        )}
        {synchro === 'aSynchroniser' ? (
          <Badge label={t('ecranParcelles.liste.aSynchroniser')} tone="info" icon={CloudUpload} />
        ) : null}
        {synchro === 'echec' ? <Badge label={t('commun.etats.echec')} tone="erreur" icon={TriangleAlert} /> : null}
      </View>

      {raisons.includes('recolteRetard') && echeance.type === 'retard' ? (
        <AlertCard
          tone="error"
          title={t('ecranCultures.detail.alerte.recolteRetard.titre', { count: echeance.jours })}
          message={t('ecranCultures.detail.alerte.recolteRetard.message')}
          actionLabel={recoltable ? t('ecranCultures.detail.recolter') : undefined}
          onAction={recoltable ? recolter : undefined}
          testID="culture-alerte-retard"
        />
      ) : null}
      {raisons.includes('synchroEchec') ? (
        <AlertCard
          tone="error"
          title={t('ecranCultures.detail.alerte.synchroEchec.titre')}
          message={t('ecranCultures.detail.alerte.synchroEchec.message')}
          testID="culture-alerte-synchro"
        />
      ) : null}
      {raisons.includes('datesManquantes') ? (
        <AlertCard
          tone="warning"
          title={t('ecranCultures.detail.alerte.datesManquantes.titre')}
          message={t('ecranCultures.detail.alerte.datesManquantes.message')}
          actionLabel={modifiable ? t('ecranCultures.detail.alerte.datesManquantes.action') : undefined}
          onAction={modifiable ? modifier : undefined}
          testID="culture-alerte-dates"
        />
      ) : null}

      <Card testID="culture-cycle">
        <View style={styles.carteCycle}>
          <Text variant="h3" accessibilityRole="header">
            {t('ecranCultures.detail.cycle')}
          </Text>
          <EtapesCycle statut={data.statut} />
          {typeof progression === 'number' ? (
            <View style={styles.progression}>
              <ProgressBar
                value={progression}
                tone={enCours && echeance.type === 'retard' ? 'erreur' : 'primaire'}
                accessibilityLabel={`${t('ecranCultures.detail.avancement')} : ${Math.round(progression * 100)} %`}
              />
              <View style={styles.ligneEcheance}>
                <Text variant="caption" color="texteSecondaire" tabular>
                  {Math.round(progression * 100)} %
                </Text>
                {enCours ? (
                  <Text variant="caption" color={echeance.type === 'retard' ? 'erreur' : 'texte'} numberOfLines={1}>
                    {libelleEcheance(t, echeance)}
                  </Text>
                ) : null}
              </View>
            </View>
          ) : null}
          <View style={styles.dates}>
            <DateCycle libelle={t('ecranCultures.detail.plantation')} valeur={data.datePlantation} />
            <DateCycle libelle={t('ecranCultures.detail.recoltePrevue')} valeur={data.datePrevueRecolte} alignement="droite" />
          </View>
          {duree != null || joursDepuisPlantation != null ? (
            <Text variant="caption" color="texteSecondaire" tabular>
              {[
                duree != null ? t('ecranCultures.detail.duree', { count: duree }) : null,
                joursDepuisPlantation == null
                  ? null
                  : data.statut === 'RECOLTEE'
                    ? t('ecranCultures.detail.recolteeApres', { count: joursDepuisPlantation })
                    : `${t('ecranCultures.detail.kpiJours')} : ${formatNombre(joursDepuisPlantation)}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : null}
        </View>
      </Card>

      {saisieOuverte ? (
        <View style={styles.section}>
          <SectionHeader title={t('ecranCultures.detail.actionsRapides')} />
          <View style={styles.tuiles}>
            <TuileAction
              icone={Eye}
              libelle={t('ecranCultures.detail.observer')}
              aide={t('ecranCultures.detail.observerAide')}
              onPress={observer}
              testID="culture-observer"
            />
            <TuileAction
              icone={Wrench}
              libelle={t('ecranCultures.detail.intervenir')}
              aide={t('ecranCultures.detail.intervenirAide')}
              onPress={intervenir}
              testID="culture-intervenir"
            />
            {recoltable ? (
              <TuileAction
                icone={Wheat}
                libelle={t('ecranCultures.detail.recolter')}
                aide={t('ecranCultures.detail.recolterAide')}
                onPress={recolter}
                testID="culture-tuile-recolter"
              />
            ) : null}
          </View>
        </View>
      ) : (
        <AlertCard tone="info" title={t('ecranCultures.detail.lectureSeule')} testID="culture-lecture-seule" />
      )}

      <View style={styles.kpis}>
        <View style={styles.flex}>
          <KpiCard
            label={t('ecranCultures.detail.kpiInterventions')}
            value={interventions.data ? listeInterventions.length : '—'}
            icon={Wrench}
            tone="primaire"
            loading={interventions.isLoading}
            testID="culture-kpi-interventions"
          />
        </View>
        <View style={styles.flex}>
          <KpiCard
            label={t('ecranCultures.detail.kpiObservations')}
            value={observations.data ? listeObservations.length : '—'}
            icon={ClipboardList}
            tone="info"
            loading={observations.isLoading}
            testID="culture-kpi-observations"
          />
        </View>
      </View>

      <Card testID="culture-recolte">
        <View style={styles.carteRecolte}>
          <View style={styles.ligneTitreCarte}>
            <Wheat size={18} color={theme.couleurs.primaire} />
            <Text variant="h3" accessibilityRole="header" style={styles.flex}>
              {t('ecranCultures.detail.recolte')}
            </Text>
          </View>
          {data.recolte ? (
            <>
              <View style={styles.valeurRecolte} accessible>
                <Text variant="kpi" tabular>
                  {formatNombre(data.recolte.quantite)}
                </Text>
                <Text variant="bodyStrong" color="texteSecondaire">
                  {data.recolte.unite}
                </Text>
              </View>
              <Text variant="bodySmall" color="texteSecondaire">
                {[
                  t('ecranCultures.detail.recolteFaite', { date: formatDate(data.recolte.dateRecolte) }),
                  data.recolte.prixVente != null
                    ? `${t('ecranCultures.detail.prixVente')} : ${formatNombre(data.recolte.prixVente)} ${t('commun.unites.ariary')}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
              <PrimaryButton
                label={t('ecranCultures.detail.voirRecolte')}
                icon={ChevronRight}
                iconPosition="right"
                variant="ghost"
                size="sm"
                onPress={voirRecolte}
                style={styles.lienDroite}
                testID="culture-recolte-voir"
              />
            </>
          ) : (
            <>
              <Text variant="bodyStrong">{t('ecranCultures.detail.recolteAFaire')}</Text>
              <Text variant="bodySmall" color="texteSecondaire">
                {recoltable
                  ? t('ecranCultures.detail.recolteAide')
                  : data.statut === 'PLANIFIEE'
                    ? t('ecranCultures.detail.recoltePlanifiee')
                    : t('ecranCultures.detail.recolteNonFaite')}
              </Text>
            </>
          )}
        </View>
      </Card>

      <View style={styles.section}>
        <SectionHeader
          title={t('ecranCultures.detail.interventions')}
          actionLabel={listeInterventions.length > 0 ? t('commun.actions.voirTout') : undefined}
          onAction={listeInterventions.length > 0 ? voirInterventions : undefined}
        />
        {interventions.isLoading ? (
          <Skeleton height={72} radius={theme.rayon.lg} />
        ) : interventions.isError ? (
          <AlertCard
            tone="error"
            title={t('ecranCultures.detail.interventionsErreur')}
            actionLabel={t('commun.actions.reessayer')}
            onAction={() => interventions.refetch()}
            actionLoading={interventions.isFetching}
          />
        ) : listeInterventions.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              title={t('ecranCultures.detail.aucuneIntervention')}
              message={t('ecranCultures.detail.interventionsAide')}
              actionLabel={saisieOuverte ? t('ecranCultures.detail.intervenir') : undefined}
              onAction={saisieOuverte ? intervenir : undefined}
              testID="culture-interventions-vide"
            />
          </Card>
        ) : (
          <Card padding="none" testID="culture-interventions">
            {listeInterventions.slice(0, APERCU).map((intervention, index) => (
              <LigneIntervention
                key={intervention.id}
                intervention={intervention}
                derniere={index === Math.min(APERCU, listeInterventions.length) - 1}
                onPress={() => modifierIntervention(intervention)}
              />
            ))}
          </Card>
        )}
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={t('ecranCultures.detail.observations')}
          actionLabel={
            listeObservations.length > APERCU && !toutesObservations
              ? `${t('commun.actions.voirTout')} (${listeObservations.length})`
              : undefined
          }
          onAction={listeObservations.length > APERCU ? () => setToutesObservations(true) : undefined}
        />
        {observations.isLoading ? (
          <Skeleton height={72} radius={theme.rayon.lg} />
        ) : observations.isError ? (
          <AlertCard
            tone="error"
            title={t('ecranCultures.detail.observationsErreur')}
            actionLabel={t('commun.actions.reessayer')}
            onAction={() => observations.refetch()}
            actionLoading={observations.isFetching}
          />
        ) : listeObservations.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              title={t('ecranCultures.detail.aucuneObservation')}
              message={t('ecranCultures.detail.observationsAide')}
              actionLabel={saisieOuverte ? t('ecranCultures.detail.observer') : undefined}
              onAction={saisieOuverte ? observer : undefined}
              testID="culture-observations-vide"
            />
          </Card>
        ) : (
          <Card padding="none" testID="culture-observations">
            {observationsVisibles.map((observation, index) => (
              <LigneObservation
                key={observation.id}
                observation={observation}
                derniere={index === observationsVisibles.length - 1}
                onPress={saisieOuverte ? () => modifierObservation(observation) : undefined}
              />
            ))}
          </Card>
        )}
      </View>

      <Card padding="none" radius="xl" style={styles.carteCarte} testID="culture-zone">
        {trace.length >= SOMMETS_MINIMUM ? (
          <CarteParcelle
            points={trace}
            centre={centreTrace}
            hauteur={180}
            libelleApercu={t('ecranParcelles.detail.apercuWeb')}
            libelleSansContour={t('ecranCultures.detail.sansTrace')}
          />
        ) : null}
        <View
          style={[
            styles.piedCarte,
            trace.length >= SOMMETS_MINIMUM ? { borderTopColor: theme.couleurs.bordure, borderTopWidth: 1 } : null,
          ]}
        >
          <View style={styles.ligneTitreCarte}>
            <MapPinned size={16} color={theme.couleurs.primaire} />
            <Text variant="bodyStrong" style={styles.flex}>
              {t('ecranCultures.detail.zone')}
            </Text>
            {trace.length >= SOMMETS_MINIMUM ? (
              <Text variant="caption" color="texteSecondaire" tabular>
                {t('ecranCultures.detail.sommets', { count: trace.length })}
              </Text>
            ) : null}
          </View>
          {trace.length >= SOMMETS_MINIMUM ? null : (
            <Text variant="bodySmall" color="texteSecondaire">
              {points.isLoading ? t('commun.etats.chargement') : t('ecranCultures.detail.traceAide')}
            </Text>
          )}
          {modifiable ? (
            <PrimaryButton
              label={trace.length >= SOMMETS_MINIMUM ? t('ecranCultures.detail.modifierTrace') : t('ecranCultures.detail.delimiter')}
              icon={PenTool}
              variant="secondary"
              size="sm"
              onPress={delimiter}
              style={styles.lienGauche}
              testID="culture-delimiter"
            />
          ) : null}
        </View>
      </Card>

      <Card>
        <Text variant="h3" accessibilityRole="header" style={styles.titreCarte}>
          {t('libelles.informations')}
        </Text>
        <LigneInfo libelle={t('ecranCultures.detail.statut')} valeur={t(`statuts.${data.statut}`)} />
        <LigneInfo libelle={t('ecranCultures.detail.type')} valeur={data.type ?? t('domaine.nonPrecise')} />
        <LigneInfo libelle={t('ecranCultures.detail.variete')} valeur={data.variete ?? t('cultures.nonPrecisee')} />
        <LigneInfo libelle={t('ecranCultures.detail.stade')} valeur={data.stade ?? t('domaine.nonPrecise')} />
        <LigneInfo libelle={t('ecranCultures.detail.creeeLe')} valeur={formatDate(data.creeA)} />
        <LigneInfo
          libelle={t('ecranCultures.detail.modifieeLe')}
          valeur={formatDate(data.modifieA)}
          derniere={!data.description && !data.raisonSuppression}
        />
        {data.description ? (
          <LigneInfo
            libelle={t('ecranCultures.detail.description')}
            valeur={data.description}
            empilee
            derniere={!data.raisonSuppression}
          />
        ) : null}
        {data.raisonSuppression ? (
          <LigneInfo libelle={t('ecranCultures.detail.raisonSuppression')} valeur={data.raisonSuppression} empilee derniere />
        ) : null}
      </Card>

      <Card variant="outlined" testID="culture-statut">
        <View style={styles.zoneStatut}>
          <Text variant="h3" accessibilityRole="header">
            {t('ecranCultures.statut.titre')}
          </Text>
          <Text variant="bodySmall" color="texteSecondaire">
            {t(`ecranCultures.statut.aide.${data.statut}`)}
          </Text>
          {transitions.length > 0 ? (
            <View style={styles.boutonsStatut}>
              {transitions.map((cible) => (
                <PrimaryButton
                  key={cible}
                  label={t(`ecranCultures.statut.actions.${cible}`)}
                  icon={ICONES_STATUT_CULTURE[cible]}
                  variant={cible === 'ABANDONNEE' ? 'outline' : 'secondary'}
                  size="md"
                  onPress={() => setCibleStatut(cible)}
                  style={styles.boutonStatut}
                  testID={`culture-statut-${cible}`}
                />
              ))}
            </View>
          ) : null}
        </View>
      </Card>

      <ChangementStatutCultureSheet culture={data} cible={cibleStatut} onFermer={() => setCibleStatut(null)} />
    </DetailScreen>
  );
}

/** Étapes du cycle : Planifiée → En cours → Récoltée (abandon signalé à part). */
function EtapesCycle({ statut }: Readonly<{ statut: Culture['statut'] }>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const etapes = ['PLANIFIEE', 'EN_COURS', 'RECOLTEE'] as const;
  const rang = statut === 'RECOLTEE' ? 2 : statut === 'EN_COURS' ? 1 : 0;
  const interrompue = statut === 'ABANDONNEE' || statut === 'SUPPRIMEE';
  const resume = interrompue
    ? t(`statuts.${statut}`)
    : etapes.map((etape, index) => `${t(`statuts.${etape}`)}${index === rang ? ' ✓' : ''}`).join(' → ');

  return (
    <View style={styles.etapes} accessible accessibilityLabel={resume} testID="culture-etapes">
      {etapes.map((etape, index) => {
        const atteinte = !interrompue && index <= rang;
        const couleur = atteinte ? theme.couleurs.primaire : theme.couleurs.bordureForte;
        return (
          <View key={etape} style={styles.etape}>
            <View style={styles.ligneEtape}>
              <View style={[styles.trait, { backgroundColor: index === 0 ? 'transparent' : couleur }]} />
              <View
                style={[
                  styles.point,
                  { borderColor: couleur, backgroundColor: atteinte ? couleur : theme.couleurs.surface },
                  index === rang && !interrompue ? styles.pointCourant : null,
                ]}
              />
              <View
                style={[
                  styles.trait,
                  {
                    backgroundColor:
                      index === etapes.length - 1
                        ? 'transparent'
                        : !interrompue && index < rang
                          ? theme.couleurs.primaire
                          : theme.couleurs.bordureForte,
                  },
                ]}
              />
            </View>
            <Text
              variant="caption"
              color={atteinte ? 'texte' : 'texteTertiaire'}
              numberOfLines={1}
              style={styles.libelleEtape}
            >
              {t(`statuts.${etape}`)}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

function DateCycle({ libelle, valeur, alignement = 'gauche' }: Readonly<{ libelle: string; valeur: string | null; alignement?: 'gauche' | 'droite' }>) {
  const { t } = useTranslation();
  return (
    <View style={[styles.dateCycle, alignement === 'droite' ? styles.dateDroite : null]}>
      <Text variant="caption" color="texteSecondaire">
        {libelle}
      </Text>
      <Text variant="bodyStrong" tabular>
        {valeur ? formatDate(valeur) : t('cultures.nonRenseignee')}
      </Text>
    </View>
  );
}

function TuileAction({
  icone: Icone,
  libelle,
  aide,
  onPress,
  testID,
}: Readonly<{ icone: LucideIcon; libelle: string; aide: string; onPress: () => void; testID: string }>) {
  const theme = useTheme();
  return (
    <Touchable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={libelle}
      accessibilityHint={aide}
      testID={testID}
      style={[
        styles.tuile,
        { backgroundColor: theme.couleurs.surface, borderColor: theme.couleurs.bordure, borderRadius: theme.rayon.lg },
      ]}
    >
      <View style={[styles.iconeTuile, { backgroundColor: theme.couleurs.primaireConteneur, borderRadius: theme.rayon.pill }]}>
        <Icone size={20} color={theme.couleurs.surPrimaireConteneur} />
      </View>
      <Text variant="label" numberOfLines={1}>
        {libelle}
      </Text>
    </Touchable>
  );
}

function LigneIntervention({
  intervention,
  derniere,
  onPress,
}: Readonly<{ intervention: Intervention; derniere: boolean; onPress: () => void }>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const type = t(`ecranCultures.typesIntervention.${intervention.type}`, { defaultValue: intervention.type });
  const statut = t(`ecranCultures.statutsIntervention.${intervention.statut}`, { defaultValue: intervention.statut });
  const detail = [
    formatDate(intervention.date),
    intervention.produit ?? t('ecranCultures.detail.sansProduit'),
    intervention.quantite != null ? `${formatNombre(intervention.quantite)} ${intervention.unite ?? ''}`.trim() : null,
  ]
    .filter(Boolean)
    .join(' · ');
  const ton = intervention.statut === 'TERMINEE' ? 'succes' : intervention.statut === 'PLANIFIEE' ? 'alerte' : 'info';

  return (
    <Touchable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${type}, ${detail}, ${statut}`}
      testID={`culture-intervention-${intervention.id}`}
      style={[styles.ligneListe, derniere ? null : { borderBottomColor: theme.couleurs.bordure, borderBottomWidth: 1 }]}
    >
      <View style={[styles.iconeListe, { backgroundColor: theme.couleurs.fond, borderRadius: theme.rayon.sm }]}>
        <Wrench size={18} color={theme.couleurs.texteSecondaire} />
      </View>
      <View style={styles.flex}>
        <Text variant="bodyStrong" numberOfLines={1}>
          {type}
        </Text>
        <Text variant="caption" color="texteSecondaire" numberOfLines={1}>
          {detail}
        </Text>
      </View>
      <Badge label={statut} tone={ton} size="sm" />
    </Touchable>
  );
}

function LigneObservation({
  observation,
  derniere,
  onPress,
}: Readonly<{ observation: Observation; derniere: boolean; onPress?: () => void }>) {
  const { t } = useTranslation();
  const theme = useTheme();
  const nombrePhotos = observation.photos?.length ?? 0;
  const contenu = (
    <>
      <View style={[styles.iconeListe, { backgroundColor: theme.couleurs.fond, borderRadius: theme.rayon.sm }]}>
        <Sprout size={18} color={theme.couleurs.texteSecondaire} />
      </View>
      <View style={styles.flex}>
        <Text variant="body" numberOfLines={2}>
          {observation.description}
        </Text>
        <View style={styles.metaObservation}>
          <Text variant="caption" color="texteSecondaire" tabular>
            {formatDateTime(observation.date)}
          </Text>
          {nombrePhotos > 0 ? (
            <View style={styles.photos}>
              <Camera size={12} color={theme.couleurs.texteSecondaire} />
              <Text variant="caption" color="texteSecondaire">
                {t('ecranCultures.detail.photos', { count: nombrePhotos })}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
      {onPress ? <ChevronRight size={18} color={theme.couleurs.texteTertiaire} /> : null}
    </>
  );
  const style = [styles.ligneListe, derniere ? null : { borderBottomColor: theme.couleurs.bordure, borderBottomWidth: 1 }];

  return onPress ? (
    <Touchable
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      testID={`culture-observation-${observation.id}`}
      style={style}
    >
      {contenu}
    </Touchable>
  ) : (
    <View style={style} accessible testID={`culture-observation-${observation.id}`}>
      {contenu}
    </View>
  );
}

function LigneInfo({
  libelle,
  valeur,
  derniere = false,
  empilee = false,
}: Readonly<{ libelle: string; valeur: string; derniere?: boolean; empilee?: boolean }>): ReactNode {
  const theme = useTheme();
  return (
    <View
      style={[
        empilee ? styles.ligneEmpilee : styles.ligneInfo,
        derniere ? null : { borderBottomColor: theme.couleurs.bordure, borderBottomWidth: 1 },
      ]}
      accessible
      accessibilityLabel={`${libelle} : ${valeur}`}
    >
      <Text variant="bodySmall" color="texteSecondaire" style={empilee ? null : styles.libelleInfo}>
        {libelle}
      </Text>
      <Text variant={empilee ? 'body' : 'bodyStrong'} style={empilee ? null : styles.valeurInfo} numberOfLines={empilee ? 8 : 3}>
        {valeur}
      </Text>
    </View>
  );
}

function SqueletteCockpit() {
  const theme = useTheme();
  return (
    <View style={styles.squelette}>
      <Skeleton width={120} height={26} radius={theme.rayon.pill} />
      <Skeleton height={170} radius={theme.rayon.lg} />
      <View style={styles.tuiles}>
        <View style={styles.flex}>
          <Skeleton height={84} radius={theme.rayon.lg} />
        </View>
        <View style={styles.flex}>
          <Skeleton height={84} radius={theme.rayon.lg} />
        </View>
        <View style={styles.flex}>
          <Skeleton height={84} radius={theme.rayon.lg} />
        </View>
      </View>
      <Skeleton height={120} radius={theme.rayon.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  carteCycle: { gap: 14 },
  progression: { gap: 6 },
  ligneEcheance: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  dates: { flexDirection: 'row', gap: 12 },
  dateCycle: { flex: 1, gap: 2 },
  dateDroite: { alignItems: 'flex-end' },
  etapes: { flexDirection: 'row' },
  etape: { flex: 1, alignItems: 'center', gap: 6 },
  ligneEtape: { flexDirection: 'row', alignItems: 'center', alignSelf: 'stretch' },
  trait: { flex: 1, height: 2 },
  point: { width: 14, height: 14, borderRadius: 7, borderWidth: 2 },
  pointCourant: { width: 18, height: 18, borderRadius: 9 },
  libelleEtape: { textAlign: 'center' },
  section: { gap: 12 },
  tuiles: { flexDirection: 'row', gap: 10 },
  tuile: { flex: 1, alignItems: 'center', gap: 8, paddingVertical: 14, paddingHorizontal: 6, borderWidth: 1, minHeight: 88 },
  iconeTuile: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  kpis: { flexDirection: 'row', gap: 12 },
  carteRecolte: { gap: 8 },
  ligneTitreCarte: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  valeurRecolte: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  lienDroite: { alignSelf: 'flex-end' },
  ligneListe: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 60 },
  iconeListe: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  metaObservation: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 },
  photos: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  carteCarte: { overflow: 'hidden' },
  piedCarte: { gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  lienGauche: { alignSelf: 'flex-start' },
  titreCarte: { marginBottom: 4 },
  ligneInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  libelleInfo: { width: 112 },
  valeurInfo: { flex: 1, textAlign: 'right' },
  ligneEmpilee: { gap: 4, paddingVertical: 12 },
  zoneStatut: { gap: 10 },
  boutonsStatut: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  boutonStatut: { flexGrow: 1, flexBasis: 140 },
  squelette: { gap: 20 },
});
