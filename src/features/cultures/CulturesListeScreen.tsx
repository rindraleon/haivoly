import { useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { CalendarX2, CloudUpload, History, MapPin, Plus, TriangleAlert, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { etatSynchroEntite } from '@/features/commun/regles';
import { useCulturesDuCompte } from '@/hooks';
import type { Culture, Paginated, Parcelle, StatutCulture } from '@/types';
import {
  AlertCard,
  Card,
  CropCard,
  EmptyState,
  Fab,
  FilterChips,
  IconButton,
  SearchField,
  Skeleton,
  Text,
  Touchable,
  useTheme,
  type FieldMapCardBadge,
} from '@/ui';
import { formatDate, todayDateOnly } from '@/utils/date';

import { ChoixParcelleSheet } from './ChoixParcelleSheet';
import {
  FILTRES_CULTURES,
  compterCulturesParFiltre,
  echeanceRecolte,
  filtrerCultures,
  libelleEcheance,
  progressionCulture,
  raisonsAlerte,
  statsCultures,
  statutVisuel,
  type FiltreCultures,
} from './regles';

/**
 * Suivi des cultures V2 (lot 3). Parité V1 (`CultureListScreen`, F-25/F-26) :
 * toutes les cultures ou celles d'une parcelle (`/cultures?parcelleId`),
 * recherche, filtres de statut, résumé, tirer-pour-rafraîchir, ajout avec
 * choix de la parcelle, historique d'une parcelle. Changements :
 * - une seule source `GET /cultures` paginée au lieu d'une requête par
 *   parcelle (N+1) ; cache hors ligne et file locale fusionnés comme avant ;
 * - puces du cahier des charges (Toutes, En croissance, Prêt à récolter,
 *   Alerte) avant les statuts V1, avec effectifs ;
 * - « Alerte » = récolte en retard, échec d'envoi, dates du cycle manquantes
 *   (décision du 14/10), calculée sans requête supplémentaire ;
 * - ordre d'urgence (récoltes en retard puis proches d'abord).
 * Les tracés des cultures (carte Leaflet de la V1, une requête par culture)
 * sont affichés dans le cockpit de chaque culture.
 */
export function CulturesListeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const client = useQueryClient();
  const params = useLocalSearchParams<{ parcelleId?: string; parcelleNom?: string }>();
  const parcelleId = params.parcelleId || null;
  const requete = useCulturesDuCompte();
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<FiltreCultures>('TOUTES');
  const [rafraichissement, setRafraichissement] = useState(false);
  const [choixParcelle, setChoixParcelle] = useState(false);

  const aujourdhui = todayDateOnly();
  const cultures = useMemo(() => requete.data?.items ?? [], [requete.data]);

  // Nom de parcelle : relation renvoyée par le serveur ; pour une culture
  // créée hors ligne, cache des parcelles déjà chargé (aucune requête).
  const nomsParcelles = new Map(
    client
      .getQueriesData<Paginated<Parcelle>>({ queryKey: ['parcelles'] })
      .flatMap(([, page]) => page?.items ?? [])
      .map((parcelle) => [parcelle.id, parcelle.nom] as const),
  );
  const nomParcelle = (culture: Culture) => culture.parcelle?.nom ?? nomsParcelles.get(culture.parcelleId) ?? null;
  const nomParcelleFiltre = parcelleId ? (params.parcelleNom || nomsParcelles.get(parcelleId) || null) : null;

  const libelleStatut = (statut: StatutCulture) => t(`statuts.${statut}`);
  const duPerimetre = parcelleId ? cultures.filter((culture) => culture.parcelleId === parcelleId) : cultures;
  const affichees = filtrerCultures(duPerimetre, { recherche, filtre, aujourdhui, libelleStatut, nomParcelle });
  const compteurs = compterCulturesParFiltre(duPerimetre, aujourdhui);
  const stats = statsCultures(duPerimetre, aujourdhui);
  const tronquee = requete.data && requete.data.total > cultures.length;

  const rafraichir = async () => {
    setRafraichissement(true);
    try {
      await requete.refetch();
    } finally {
      setRafraichissement(false);
    }
  };

  const nouvelleCulture = () => {
    if (parcelleId) {
      router.push({ pathname: '/ajout-culture', params: { parcelleId, parcelleNom: nomParcelleFiltre ?? '' } });
    } else {
      setChoixParcelle(true);
    }
  };

  const ouvrirCulture = (culture: Culture) =>
    router.push({ pathname: '/detail-culture', params: { parcelleId: culture.parcelleId, id: culture.id } });

  const resume = [
    t('ecranCultures.liste.enCours', { count: stats.enCours }),
    t('ecranCultures.liste.aRecolter', { count: stats.aRecolter }),
    stats.alertes > 0 ? t('ecranCultures.liste.alertes', { count: stats.alertes }) : null,
    t('ecranCultures.liste.total', { count: stats.total }),
  ]
    .filter(Boolean)
    .join(' · ');

  const badgesDe = (culture: Culture): FieldMapCardBadge[] => {
    const badges: FieldMapCardBadge[] = [];
    const raisons = raisonsAlerte(culture, aujourdhui);
    // Le retard de récolte est déjà porté par l'échéance (texte et barre rouges).
    if (raisons.includes('synchroEchec')) {
      badges.push({ label: t('ecranCultures.alertes.synchroEchec'), tone: 'erreur', icon: TriangleAlert });
    } else if (etatSynchroEntite(culture) === 'aSynchroniser') {
      badges.push({ label: t('ecranParcelles.liste.aSynchroniser'), tone: 'info', icon: CloudUpload });
    }
    if (raisons.includes('datesManquantes')) {
      badges.push({ label: t('ecranCultures.alertes.datesManquantes'), tone: 'alerte', icon: CalendarX2 });
    }
    return badges;
  };

  const echeanceDe = (culture: Culture): string | null => {
    if (culture.statut === 'EN_COURS') return libelleEcheance(t, echeanceRecolte(culture, aujourdhui));
    if (culture.statut === 'PLANIFIEE' && culture.datePlantation) {
      return t('ecranCultures.liste.plantationLe', { date: formatDate(culture.datePlantation) });
    }
    if (culture.statut === 'RECOLTEE' && culture.recolte?.dateRecolte) {
      return t('ecranCultures.detail.recolteFaite', { date: formatDate(culture.recolte.dateRecolte) });
    }
    return null;
  };

  const entete = (
    <View style={styles.entete}>
      <View style={styles.ligneTitre}>
        <View style={styles.flex}>
          <Text variant="h1" accessibilityRole="header">
            {t('navigation.cultures')}
          </Text>
          {requete.data ? (
            <Text variant="bodySmall" color="texteSecondaire" tabular testID="cultures-resume"
              accessibilityLiveRegion="polite">
              {resume}
            </Text>
          ) : null}
        </View>
        {/* Lot 6 : historique toujours accessible — global sans filtre, de la
            parcelle quand un filtre est actif (comportement V1 conservé). */}
        <IconButton
          icon={History}
          accessibilityLabel={t('ecranCultures.liste.historique')}
          onPress={() =>
            router.push({ pathname: '/historique-cultures', params: parcelleId ? { parcelleId, parcelleNom: nomParcelleFiltre ?? '' } : undefined })
          }
          testID="cultures-historique"
        />
      </View>

      {parcelleId ? (
        <Touchable
          onPress={() => router.setParams({ parcelleId: undefined, parcelleNom: undefined })}
          feedback="opacity"
          accessibilityRole="button"
          accessibilityLabel={`${t('ecranCultures.liste.parcelleFiltre', { nom: nomParcelleFiltre ?? '—' })}. ${t('ecranCultures.liste.toutesParcelles')}`}
          testID="cultures-parcelle-filtre"
          style={[
            styles.pastilleParcelle,
            { backgroundColor: theme.couleurs.primaireConteneur, borderRadius: theme.rayon.pill },
          ]}
        >
          <MapPin size={14} color={theme.couleurs.surPrimaireConteneur} />
          <Text variant="label" style={{ color: theme.couleurs.surPrimaireConteneur }} numberOfLines={1}>
            {t('ecranCultures.liste.parcelleFiltre', { nom: nomParcelleFiltre ?? '—' })}
          </Text>
          <X size={14} color={theme.couleurs.surPrimaireConteneur} />
        </Touchable>
      ) : null}

      <SearchField
        value={recherche}
        onChangeText={setRecherche}
        placeholder={t('cultures.recherchePlaceholder')}
        accessibilityLabel={t('ecranCultures.liste.rechercheA11y')}
        clearLabel={t('ecranCultures.liste.effacerRecherche')}
        testID="cultures-recherche"
      />

      <FilterChips
        options={FILTRES_CULTURES.map((valeur) => ({
          value: valeur,
          label: t(`ecranCultures.liste.filtres.${valeur}`),
          count: requete.data ? compteurs[valeur] : undefined,
        }))}
        value={filtre}
        onChange={setFiltre}
        accessibilityLabel={t('ecranCultures.liste.filtresA11y')}
        inset={theme.dimensions.margeEcran}
        testID="cultures-filtres"
      />

      {affichees.length > 0 ? (
        <Text variant="caption" color="texteTertiaire">
          {t('ecranCultures.liste.triUrgence')}
        </Text>
      ) : null}
      {tronquee ? (
        <Text variant="caption" color="texteSecondaire" testID="cultures-tronquee">
          {t('ecranCultures.liste.tronquee', { affichees: cultures.length, total: requete.data?.total ?? 0 })}
        </Text>
      ) : null}
    </View>
  );

  const etatVide = () => {
    if (requete.isLoading) {
      return (
        <View style={styles.squelettes} accessibilityLabel={t('cultures.chargementCulture')}>
          {[0, 1, 2].map((cle) => (
            <Card key={cle} padding="md">
              <View style={styles.ligneSquelette}>
                <Skeleton width={56} height={56} radius={theme.rayon.md} />
                <View style={[styles.flex, styles.textesSquelette]}>
                  <Skeleton width="60%" height={16} />
                  <Skeleton width="40%" />
                  <Skeleton width={96} height={22} radius={theme.rayon.pill} />
                </View>
              </View>
              <Skeleton height={8} radius={theme.rayon.pill} />
            </Card>
          ))}
        </View>
      );
    }
    if (requete.isError) {
      return (
        <AlertCard
          tone="error"
          title={t('ecranCultures.liste.erreur')}
          message={t('parcelles.verifiezConnexion')}
          actionLabel={t('commun.actions.reessayer')}
          onAction={() => requete.refetch()}
          actionLoading={requete.isFetching}
          testID="cultures-erreur"
        />
      );
    }
    if (duPerimetre.length === 0) {
      return (
        <EmptyState
          title={t('ecranCultures.liste.aucuneCulture')}
          message={t('ecranCultures.liste.premiereCulture')}
          actionLabel={t('cultures.ajouterCulture')}
          onAction={nouvelleCulture}
          testID="cultures-vide"
        />
      );
    }
    if (recherche.trim()) {
      return (
        <EmptyState
          title={t('domaine.aucunResultat')}
          message={t('ecranCultures.liste.aucunResultatPour', { recherche: recherche.trim() })}
          actionLabel={t('ecranCultures.liste.effacerRecherche')}
          onAction={() => setRecherche('')}
          testID="cultures-aucun-resultat"
        />
      );
    }
    return (
      <EmptyState
        title={t('domaine.aucunResultat')}
        message={t('ecranCultures.liste.aucunePourFiltre', { filtre: t(`ecranCultures.liste.filtres.${filtre}`) })}
        actionLabel={t('ecranCultures.liste.voirToutes')}
        onAction={() => setFiltre('TOUTES')}
        testID="cultures-filtre-vide"
      />
    );
  };

  return (
    <View style={[styles.racine, { backgroundColor: theme.couleurs.fond }]} testID="ecran-cultures-v2">
      <FlatList
        data={affichees}
        keyExtractor={(culture) => culture.id}
        renderItem={({ item }) => {
          const echeance = echeanceRecolte(item, aujourdhui);
          const enCours = item.statut === 'EN_COURS';
          return (
            <CropCard
              nom={item.nom}
              variete={item.variete}
              type={item.type}
              parcelle={parcelleId ? null : nomParcelle(item)}
              statut={statutVisuel(item, aujourdhui)}
              progression={enCours ? progressionCulture(item) : null}
              libelleEcheance={echeanceDe(item)}
              tonEcheance={enCours && echeance.type === 'retard' ? 'erreur' : 'primaire'}
              badges={badgesDe(item)}
              onPress={() => ouvrirCulture(item)}
              accessibilityHint={t('ecranCultures.liste.ouvrirAide')}
              testID={`culture-${item.id}`}
            />
          );
        }}
        ListHeaderComponent={entete}
        ListEmptyComponent={etatVide()}
        ItemSeparatorComponent={Separateur}
        contentContainerStyle={{
          paddingTop: insets.top + theme.espace.md,
          paddingHorizontal: theme.dimensions.margeEcran,
          // Espace réservé au bouton flottant : la dernière carte reste lisible.
          paddingBottom: 104,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
        initialNumToRender={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
        refreshControl={
          <RefreshControl
            refreshing={rafraichissement}
            onRefresh={rafraichir}
            tintColor={theme.couleurs.primaire}
            colors={[theme.couleurs.primaire]}
            progressBackgroundColor={theme.couleurs.surface}
          />
        }
      />
      <Fab
        label={t('ecranCultures.liste.nouvelle')}
        icon={Plus}
        onPress={nouvelleCulture}
        accessibilityHint={t('ecranCultures.liste.nouvelleAide')}
        testID="cultures-nouvelle"
        style={[styles.fab, { right: theme.dimensions.margeEcran }]}
      />
      {choixParcelle ? <ChoixParcelleSheet visible onFermer={() => setChoixParcelle(false)} /> : null}
    </View>
  );
}

function Separateur() {
  return <View style={styles.separateur} />;
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  flex: { flex: 1 },
  entete: { gap: 14, paddingBottom: 14 },
  ligneTitre: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  pastilleParcelle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingHorizontal: 12,
    minHeight: 36,
    maxWidth: '100%',
  },
  separateur: { height: 12 },
  squelettes: { gap: 12 },
  ligneSquelette: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  textesSquelette: { gap: 8 },
  fab: { position: 'absolute', bottom: 16 },
});
