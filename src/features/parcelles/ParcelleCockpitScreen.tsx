import { useQueries } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { ClipboardList, CloudUpload, Map, MapPinned, Pencil, PenTool, Ruler, Sprout, Trash2, TriangleAlert, Wrench } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { echeanceRecolte, libelleEcheance, progressionCulture, statutVisuel } from '@/features/cultures/regles';
import { useCulturesDeParcelle, useParcelle, useRecoltesDuCompte, interventionsQueryOptions, observationsQueryOptions } from '@/hooks';
import { convertirEnKg } from '@/features/recoltes/regles';
import {
  AlertCard,
  Badge,
  Card,
  CropCard,
  DetailScreen,
  EmptyState,
  KpiCard,
  IconButton,
  PrimaryButton,
  SectionHeader,
  Touchable,
  Skeleton,
  Text,
  useTheme,
} from '@/ui';
import { formatDate, todayDateOnly } from '@/utils/date';
import { formatNombre, formatNombreDecimal } from '@/utils/formatNombre';
import { formatSuperficieValue } from '@/utils/parcelle';

import { CarteParcelle } from './CarteParcelle';
import { ChangementStatutSheet, ICONES_STATUT } from './ChangementStatutSheet';
import {
  SOMMETS_MINIMUM,
  centreParcelle,
  compterCulturesEnCours,
  etatSynchroEntite,
  nombreSommets,
  tonStatutParcelle,
  transitionsStatutParcelle,
  trierCulturesParcelle,
  type StatutCibleParcelle,
} from './regles';

/**
 * Détail parcelle V2 « cockpit » (lot 2). Parité V1 (`ParcelleDetailScreen`,
 * F-19) : carte Leaflet d'origine sur mobile (standard/satellite, recentrage,
 * F-62 ; aperçu SVG sur le web),
 * sommets, superficie, informations, cultures, actions Modifier/Délimiter.
 * Corrige P0-2 : les cultures viennent de `GET /parcelles/:id/cultures`
 * (`useCulturesDeParcelle`, file hors ligne fusionnée) au lieu de
 * `GET /cultures?parcelleId`, refusé par le serveur (400).
 * Relie la suppression avec motif (F-23), route jusque-là orpheline.
 */
export function ParcelleCockpitScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ id?: string; parcelleId?: string }>();
  const id = params.id ?? params.parcelleId;
  const parcelle = useParcelle(id);
  const cultures = useCulturesDeParcelle(id);
  const [rafraichissement, setRafraichissement] = useState(false);
  const [cibleStatut, setCibleStatut] = useState<StatutCibleParcelle | null>(null);
  // Lot 6 : activité récente et cumul des récoltes de la parcelle.
  // Agrégation par culture (useQueries) : les hooks unitaires sont désactivés
  // sans identifiant de culture.
  const idsCulturesParcelle = (cultures.data ?? []).map((culture) => culture.id);
  const observationsQueries = useQueries({
    queries: idsCulturesParcelle.map((cultureId) => observationsQueryOptions(cultureId)),
  });
  const interventionsQueries = useQueries({
    queries: idsCulturesParcelle.map((cultureId) => interventionsQueryOptions(cultureId)),
  });
  const recoltes = useRecoltesDuCompte();

  const retour = () => (router.canGoBack() ? router.back() : router.replace('/parcelles'));
  const libelleRetour = t('commun.actions.retour');

  // Données déjà affichées : un rafraîchissement en échec (réseau coupé) ne
  // remplace jamais le cockpit par un écran d'erreur.
  if (!parcelle.data && parcelle.isLoading) {
    return (
      <DetailScreen title={t('parcelles.chargementParcelle')} onBack={retour} backLabel={libelleRetour}>
        <SqueletteCockpit />
      </DetailScreen>
    );
  }

  if (!parcelle.data) {
    return (
      <DetailScreen title={t('libelles.parcelleIntrouvable')} onBack={retour} backLabel={libelleRetour}>
        <AlertCard
          tone="error"
          title={t('libelles.parcelleIntrouvable')}
          message={t('parcelles.parcelleNExistePas')}
          actionLabel={t('commun.actions.reessayer')}
          onAction={() => parcelle.refetch()}
          actionLoading={parcelle.isFetching}
          testID="parcelle-erreur"
        />
      </DetailScreen>
    );
  }

  const data = parcelle.data;
  const aujourdhui = todayDateOnly();
  const superficie = formatSuperficieValue(data.superficie);
  const centre = centreParcelle(data);
  const sommets = nombreSommets(data);
  const listeCultures = trierCulturesParcelle(cultures.data ?? [], aujourdhui);
  const enCours = compterCulturesEnCours(listeCultures);

  const idsCultures = new Set(listeCultures.map((culture) => culture.id));
  const activite = [
    ...observationsQueries.flatMap((requete) => requete.data ?? [])
      .filter((item) => idsCultures.has(item.cultureId))
      .map((item) => ({ id: item.id, icone: 'observation' as const, titre: item.description, date: item.date })),
    ...interventionsQueries.flatMap((requete) => requete.data ?? [])
      .filter((item) => idsCultures.has(item.cultureId))
      .map((item) => ({ id: item.id, icone: 'intervention' as const, titre: item.type, date: item.date })),
  ]
    .sort((a, b) => (a.date > b.date ? -1 : 1))
    .slice(0, 4);
  const recoltesParcelle = (recoltes.data ?? []).filter((item) => idsCultures.has(item.cultureId));
  let cumulKg = 0;
  let cumulConvertible = true;
  let cumulMontant = 0;
  for (const item of recoltesParcelle) {
    const enKg = convertirEnKg(item.quantite, item.unite);
    if (enKg === null) cumulConvertible = false;
    else cumulKg += enKg;
    cumulMontant += item.prixVente ?? 0;
  }
  const cumul = { nombre: recoltesParcelle.length, kg: cumulConvertible ? cumulKg : null, montant: cumulMontant };
  const synchro = etatSynchroEntite(data);
  const libelleStatut = t(`statuts.${data.statut}`);
  const transitions = transitionsStatutParcelle(data.statut);

  const rafraichir = async () => {
    setRafraichissement(true);
    try {
      await Promise.all([parcelle.refetch(), cultures.refetch()]);
    } finally {
      setRafraichissement(false);
    }
  };

  const modifier = () => router.push({ pathname: '/modifier-parcelle', params: { id: data.id } });
  const delimiter = () => router.push({ pathname: '/delimiter-parcelle', params: { id: data.id } });
  const ajouterCulture = () =>
    router.push({ pathname: '/ajout-culture', params: { parcelleId: data.id, parcelleNom: data.nom } });

  // Superficie lisible en KPI : hectares au-delà de 1 ha (règle V1 de `formatSuperficieValue`).
  const kpiSuperficie =
    data.superficie == null
      ? { valeur: '—', unite: undefined, aide: t('parcelles.nonCalculee') }
      : data.superficie >= 10_000
        ? { valeur: formatNombreDecimal(data.superficie / 10_000, 2), unite: t('commun.unites.hectares'), aide: undefined }
        : { valeur: formatNombre(data.superficie), unite: t('commun.unites.metresCarres'), aide: undefined };

  return (
    <DetailScreen
      title={data.nom}
      subtitle={superficie ? `${t('ecranParcelles.detail.superficie')} ${superficie}` : t('parcelles.superficieNonCalculee')}
      onBack={retour}
      backLabel={libelleRetour}
      refreshing={rafraichissement}
      onRefresh={rafraichir}
      testID="ecran-parcelle-v2"
      footer={
        <View style={styles.actions}>
          <PrimaryButton
            label={t('commun.actions.modifier')}
            icon={Pencil}
            variant="outline"
            size="md"
            onPress={modifier}
            style={styles.flex}
            testID="parcelle-modifier"
          />
          <PrimaryButton
            label={t('ecranParcelles.detail.delimiter')}
            icon={PenTool}
            size="md"
            onPress={delimiter}
            style={styles.flex}
            testID="parcelle-delimiter"
          />
        </View>
      }
    >
      <View style={styles.badges}>
        <Badge label={libelleStatut} tone={tonStatutParcelle(data.statut)} />
        {synchro === 'aSynchroniser' ? (
          <Badge label={t('ecranParcelles.liste.aSynchroniser')} tone="info" icon={CloudUpload} />
        ) : null}
        {synchro === 'echec' ? <Badge label={t('commun.etats.echec')} tone="erreur" icon={TriangleAlert} /> : null}
      </View>

      <Card padding="none" radius="xl" style={styles.carteCarte}>
        <View style={styles.enteteCarte}>
          <Text variant="label" color="texteSecondaire">
            {t('ecranParcelles.detail.carte')}
          </Text>
          <IconButton
            icon={Map}
            accessibilityLabel={t('ecranParcelles.detail.cartePleinEcran')}
            onPress={() => router.push({ pathname: '/carte-parcelles', params: { parcelleId: data.id } })}
            testID="parcelle-carte-plein-ecran"
          />
        </View>
        <CarteParcelle
          points={data.pointsGPS ?? []}
          centre={centre}
          hauteur={220}
          libelleApercu={t('ecranParcelles.detail.apercuWeb')}
          libelleSansContour={t('ecranParcelles.liste.sansContour')}
        />
        <View style={[styles.piedCarte, { borderTopColor: theme.couleurs.bordure }]}>
          <View style={styles.statCarte}>
            <MapPinned size={16} color={theme.couleurs.primaire} />
            <Text variant="label" tabular>
              {t('ecranParcelles.detail.sommets', { count: sommets })}
            </Text>
          </View>
          <View style={styles.statCarte}>
            <Ruler size={16} color={theme.couleurs.texteSecondaire} />
            <Text variant="label" tabular>
              {superficie ?? '—'}
            </Text>
          </View>
        </View>
      </Card>

      {data.statut === 'ACTIVE' && sommets < SOMMETS_MINIMUM ? (
        <AlertCard
          tone="warning"
          title={t('ecranParcelles.detail.contourTitre')}
          message={t('ecranParcelles.detail.contourMessage')}
          actionLabel={t('ecranParcelles.detail.delimiter')}
          onAction={delimiter}
          testID="parcelle-a-delimiter"
        />
      ) : null}

      <View style={styles.kpis}>
        <View style={styles.flex}>
          <KpiCard
            label={t('ecranParcelles.detail.superficie')}
            value={kpiSuperficie.valeur}
            unit={kpiSuperficie.unite}
            hint={kpiSuperficie.aide}
            icon={Ruler}
            tone="primaire"
          />
        </View>
        <View style={styles.flex}>
          <KpiCard
            label={t('ecranParcelles.detail.culturesEnCours')}
            value={cultures.data ? enCours : '—'}
            hint={cultures.data ? t('ecranParcelles.liste.cultures', { count: listeCultures.length }) : undefined}
            icon={Sprout}
            tone="succes"
            loading={cultures.isLoading}
          />
        </View>
      </View>

      <View style={styles.section}>
        <SectionHeader
          title={t('ecranParcelles.detail.cultures')}
          actionLabel={t('commun.actions.ajouter')}
          onAction={ajouterCulture}
          actionAccessibilityLabel={t('ecranParcelles.detail.ajouterCultureA11y', { nom: data.nom })}
        />
        {cultures.isLoading ? (
          <View style={styles.liste}>
            <Skeleton height={96} radius={theme.rayon.lg} />
            <Skeleton height={96} radius={theme.rayon.lg} />
          </View>
        ) : cultures.isError ? (
          <AlertCard
            tone="error"
            title={t('ecranParcelles.detail.culturesErreur')}
            actionLabel={t('commun.actions.reessayer')}
            onAction={() => cultures.refetch()}
            actionLoading={cultures.isFetching}
            testID="parcelle-cultures-erreur"
          />
        ) : listeCultures.length === 0 ? (
          <Card variant="outlined">
            <EmptyState
              title={t('libelles.aucuneCulture')}
              message={t('parcelles.ajoutezCultureSuivreCycle')}
              actionLabel={t('cultures.ajouterCulture')}
              onAction={ajouterCulture}
              testID="parcelle-cultures-vide"
            />
          </Card>
        ) : (
          <View style={styles.liste}>
            {listeCultures.map((culture) => {
              const echeance = echeanceRecolte(culture, aujourdhui);
              const avecEcheance = culture.statut === 'EN_COURS';
              return (
                <CropCard
                  key={culture.id}
                  nom={culture.nom}
                  variete={culture.variete}
                  type={culture.type}
                  statut={statutVisuel(culture, aujourdhui)}
                  progression={avecEcheance ? progressionCulture(culture) : null}
                  libelleEcheance={avecEcheance ? libelleEcheance(t, echeance) : null}
                  tonEcheance={echeance.type === 'retard' ? 'erreur' : 'primaire'}
                  onPress={() =>
                    router.push({ pathname: '/detail-culture', params: { parcelleId: data.id, id: culture.id } })
                  }
                  accessibilityHint={t('ecranParcelles.detail.ouvrirCultureAide')}
                  testID={`parcelle-culture-${culture.id}`}
                />
              );
            })}
          </View>
        )}
      </View>

      <Card>
        <Text variant="h3" accessibilityRole="header" style={styles.titreCarte}>
          {t('libelles.informations')}
        </Text>
        <LigneInfo libelle={t('ecranParcelles.detail.statut')}>
          <Badge label={libelleStatut} tone={tonStatutParcelle(data.statut)} size="sm" />
        </LigneInfo>
        <LigneInfo libelle={t('ecranParcelles.detail.typeSol')} valeur={data.typeSol ?? t('domaine.nonRenseigne')} />
        <LigneInfo libelle={t('ecranParcelles.detail.latitude')} valeur={centre ? centre.latitude.toFixed(6) : '—'} />
        <LigneInfo libelle={t('ecranParcelles.detail.longitude')} valeur={centre ? centre.longitude.toFixed(6) : '—'} />
        <LigneInfo libelle={t('parcelles.creeeLe')} valeur={formatDate(data.creeA)} />
        <LigneInfo
          libelle={t('ecranParcelles.detail.modifieeLe')}
          valeur={formatDate(data.modifieA)}
          derniere={!data.description}
        />
        {data.description ? (
          <LigneInfo libelle={t('ecranParcelles.detail.description')} valeur={data.description} derniere empilee />
        ) : null}
      </Card>

      <View style={styles.section} testID="parcelle-activite">
        <SectionHeader
          title={t('ecranParcelles.detail.activite')}
          actionLabel={t('ecranParcelles.detail.activiteVoirTout')}
          onAction={() => router.push('/observations')}
          actionAccessibilityLabel={t('ecranParcelles.detail.activiteVoirTout')}
        />
        <Card variant="outlined" radius="lg" style={styles.liste}>
          {activite.length === 0 ? (
            <Text variant="bodySmall" color="texteSecondaire" testID="parcelle-activite-vide">
              {t('ecranParcelles.detail.activiteVide')}
            </Text>
          ) : (
            activite.map((evenement, index) => (
              <Touchable
                key={evenement.id}
                onPress={() => router.push('/observations')}
                feedback="opacity"
                accessibilityRole="link"
                accessibilityLabel={`${evenement.titre} — ${formatDate(evenement.date)}`}
                testID={`parcelle-activite-${evenement.id}`}
              >
                <View style={styles.ligneActivite}>
                  <View style={styles.iconeActivite}>
                    {evenement.icone === 'observation' ? (
                      <ClipboardList size={16} color={theme.couleurs.texteSecondaire} />
                    ) : (
                      <Wrench size={16} color={theme.couleurs.texteSecondaire} />
                    )}
                  </View>
                  <View style={styles.flex}>
                    <Text variant="body" numberOfLines={1}>
                      {evenement.titre}
                    </Text>
                    <Text variant="caption" color="texteSecondaire" tabular>
                      {formatDate(evenement.date)}
                    </Text>
                  </View>
                </View>
                {index < activite.length - 1 ? <View style={styles.separateurActivite} /> : null}
              </Touchable>
            ))
          )}
        </Card>
      </View>

      {cumul.nombre > 0 ? (
        <Card variant="outlined" testID="parcelle-recoltes-cumul">
          <Text variant="label" color="texteSecondaire">
            {t('ecranParcelles.detail.cumulTitre', { count: cumul.nombre })}
          </Text>
          <View style={styles.ligneCumul}>
            <Text variant="h3" tabular>
              {cumul.kg !== null ? t('ecranParcelles.detail.cumulKg', { valeur: formatNombre(cumul.kg) }) : t('ecranParcelles.detail.cumulNonConvertible')}
            </Text>
            <Text variant="body" color="texteSecondaire" tabular>
              {t('ecranParcelles.detail.cumulMontant', { montant: formatNombreDecimal(cumul.montant, 0) })}
            </Text>
          </View>
        </Card>
      ) : null}

      {transitions.length > 0 ? (
        <Card variant="outlined" testID="parcelle-statut">
          <View style={styles.zoneSensible}>
            <Text variant="h3" accessibilityRole="header">
              {t('ecranParcelles.statut.titre')}
            </Text>
            <Text variant="bodySmall" color="texteSecondaire">
              {t(`ecranParcelles.statut.aide.${data.statut}`)}
            </Text>
            <View style={styles.boutonsStatut}>
              {transitions.map((cible) => (
                <PrimaryButton
                  key={cible}
                  label={t(`ecranParcelles.statut.actions.${cible}`)}
                  icon={ICONES_STATUT[cible]}
                  variant={cible === 'ACTIVE' ? 'secondary' : 'outline'}
                  size="md"
                  onPress={() => setCibleStatut(cible)}
                  style={styles.boutonStatut}
                  testID={`parcelle-statut-${cible}`}
                />
              ))}
            </View>
          </View>
        </Card>
      ) : null}

      {data.statut === 'SUPPRIMEE' ? null : (
        <Card variant="outlined">
          <View style={styles.zoneSensible}>
            <Text variant="h3" accessibilityRole="header">
              {t('ecranParcelles.detail.actionsSensibles')}
            </Text>
            <Text variant="bodySmall" color="texteSecondaire">
              {t('ecranParcelles.detail.supprimerAide')}
            </Text>
            <PrimaryButton
              label={t('ecranParcelles.detail.supprimer')}
              icon={Trash2}
              variant="danger"
              size="md"
              onPress={() =>
                router.push({ pathname: '/confirmation-suppression', params: { parcelleId: data.id, nom: data.nom } })
              }
              testID="parcelle-supprimer"
            />
          </View>
        </Card>
      )}

      <ChangementStatutSheet parcelle={data} cible={cibleStatut} onFermer={() => setCibleStatut(null)} />
    </DetailScreen>
  );
}

function LigneInfo({
  libelle,
  valeur,
  children,
  derniere = false,
  empilee = false,
}: Readonly<{ libelle: string; valeur?: string; children?: ReactNode; derniere?: boolean; empilee?: boolean }>) {
  const theme = useTheme();
  return (
    <View
      style={[
        empilee ? styles.ligneEmpilee : styles.ligneInfo,
        derniere ? null : { borderBottomColor: theme.couleurs.bordure, borderBottomWidth: 1 },
      ]}
      accessible
      accessibilityLabel={valeur ? `${libelle} : ${valeur}` : undefined}
    >
      <Text variant="bodySmall" color="texteSecondaire" style={empilee ? null : styles.libelleInfo}>
        {libelle}
      </Text>
      {valeur == null ? (
        <View style={styles.valeurComposant}>{children}</View>
      ) : (
        // Texte long (description) : empilé et aligné à gauche pour rester lisible.
        <Text variant={empilee ? 'body' : 'bodyStrong'} style={empilee ? null : styles.valeurInfo} numberOfLines={empilee ? 8 : 3}>
          {valeur}
        </Text>
      )}
    </View>
  );
}

function SqueletteCockpit() {
  const theme = useTheme();
  return (
    <View style={styles.squelette}>
      <Skeleton width={96} height={26} radius={theme.rayon.pill} />
      <Skeleton height={262} radius={theme.rayon.xl} />
      <View style={styles.kpis}>
        <View style={styles.flex}>
          <Skeleton height={108} radius={theme.rayon.lg} />
        </View>
        <View style={styles.flex}>
          <Skeleton height={108} radius={theme.rayon.lg} />
        </View>
      </View>
      <Skeleton height={96} radius={theme.rayon.lg} />
    </View>
  );
}

const styles = StyleSheet.create({
  enteteCarte: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 12 },
  ligneActivite: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 4 },
  iconeActivite: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  separateurActivite: { height: 1, opacity: 0.08 },
  ligneCumul: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 6 },
  flex: { flex: 1 },
  actions: { flexDirection: 'row', gap: 12 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  carteCarte: { overflow: 'hidden' },
  piedCarte: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  statCarte: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kpis: { flexDirection: 'row', gap: 12 },
  section: { gap: 12 },
  liste: { gap: 12 },
  titreCarte: { marginBottom: 4 },
  ligneInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 },
  libelleInfo: { width: 112 },
  valeurInfo: { flex: 1, textAlign: 'right' },
  // Rangée justifiée à droite : le badge garde son `alignSelf` sans casser l'alignement.
  valeurComposant: { flex: 1, flexDirection: 'row', justifyContent: 'flex-end' },
  ligneEmpilee: { gap: 4, paddingVertical: 12 },
  zoneSensible: { gap: 10 },
  boutonsStatut: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  boutonStatut: { flexGrow: 1, flexBasis: 140 },
  squelette: { gap: 20 },
});
