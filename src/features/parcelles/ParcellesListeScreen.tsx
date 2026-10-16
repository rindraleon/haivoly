import { router } from 'expo-router';
import { CloudUpload, History, Map, Plus, TriangleAlert } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useParcelles } from '@/hooks';
import type { Parcelle, StatutParcelle } from '@/types';
import {
  AlertCard,
  Card,
  EmptyState,
  Fab,
  FieldMapCard,
  FilterChips,
  IconButton,
  SearchField,
  Skeleton,
  Text,
  useTheme,
  type FieldMapCardBadge,
} from '@/ui';
import { formatDate } from '@/utils/date';
import { formatNombreDecimal } from '@/utils/formatNombre';
import { formatSuperficieValue } from '@/utils/parcelle';

import {
  FILTRES_PARCELLES,
  compterParFiltre,
  etatSynchroEntite,
  filtrerParcelles,
  nombreCulturesConnu,
  statsParcelles,
  tonStatutParcelle,
  type FiltreParcelles,
} from './regles';

/**
 * Liste des parcelles V2 (lot 2). Parité V1 (`ParcelleListScreen`, F-16) :
 * même source (`useParcelles({ limit: 200 })`, cache hors ligne et file
 * locale fusionnés), même recherche, mêmes filtres de statut, même tri, mêmes
 * statistiques, tirer-pour-rafraîchir, création en un tap. Ajouts : filtre
 * « À délimiter », effectifs par puce, badges de synchronisation (F-24),
 * accès direct à l'historique (F-22, route jusque-là orpheline).
 */
export function ParcellesListeScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const requete = useParcelles({ limit: 200 });
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState<FiltreParcelles>('TOUTES');
  const [rafraichissement, setRafraichissement] = useState(false);

  const parcelles = useMemo(() => requete.data?.items ?? [], [requete.data]);
  const libelleStatut = (statut: StatutParcelle) => t(`statuts.${statut}`);
  const affichees = filtrerParcelles(parcelles, { recherche, filtre, libelleStatut });
  const compteurs = compterParFiltre(parcelles);
  const stats = statsParcelles(parcelles);

  const rafraichir = async () => {
    setRafraichissement(true);
    try {
      await requete.refetch();
    } finally {
      setRafraichissement(false);
    }
  };

  const ouvrirCreation = () => router.push('/ajout-parcelle');
  const ouvrirDetail = (parcelle: Parcelle) =>
    router.push({ pathname: '/detail-parcelle', params: { parcelleId: parcelle.id } });

  const resume = [
    t('ecranParcelles.liste.actives', { count: stats.actives }),
    t('ecranParcelles.liste.hectares', { valeur: formatNombreDecimal(stats.superficieHa, 1) }),
    t('ecranParcelles.liste.total', { count: stats.total }),
  ].join(' · ');

  const entete = (
    <View style={styles.entete}>
      <View style={styles.ligneTitre}>
        <View style={styles.flex}>
          <Text variant="h1" accessibilityRole="header">
            {t('navigation.parcelles')}
          </Text>
          {requete.data ? (
            <Text variant="bodySmall" color="texteSecondaire" tabular accessibilityLiveRegion="polite">
              {resume}
            </Text>
          ) : null}
        </View>
        <IconButton
          icon={Map}
          accessibilityLabel={t('ecranParcelles.liste.carte')}
          onPress={() => router.push('/carte-parcelles')}
          testID="parcelles-carte"
        />
        <IconButton
          icon={History}
          accessibilityLabel={t('ecranParcelles.liste.historique')}
          onPress={() => router.push('/historique-parcelles')}
          testID="parcelles-historique"
        />
      </View>

      <SearchField
        value={recherche}
        onChangeText={setRecherche}
        placeholder={t('libelles.rechercheParcelleSol')}
        accessibilityLabel={t('ecranParcelles.liste.rechercheA11y')}
        clearLabel={t('ecranParcelles.liste.effacerRecherche')}
        testID="parcelles-recherche"
      />

      <FilterChips
        options={FILTRES_PARCELLES.map((valeur) => ({
          value: valeur,
          label: t(`ecranParcelles.liste.filtres.${valeur}`),
          count: requete.data ? compteurs[valeur] : undefined,
        }))}
        value={filtre}
        onChange={setFiltre}
        accessibilityLabel={t('ecranParcelles.liste.filtresA11y')}
        inset={theme.dimensions.margeEcran}
        testID="parcelles-filtres"
      />

      {affichees.length > 0 ? (
        <Text variant="caption" color="texteTertiaire">
          {t('parcelles.trieesModification')}
        </Text>
      ) : null}
    </View>
  );

  const badgesDe = (parcelle: Parcelle): FieldMapCardBadge[] => {
    const badges: FieldMapCardBadge[] = [];
    if (parcelle.statut !== 'ACTIVE') {
      badges.push({ label: libelleStatut(parcelle.statut), tone: tonStatutParcelle(parcelle.statut) });
    }
    const synchro = etatSynchroEntite(parcelle);
    if (synchro === 'aSynchroniser') {
      badges.push({ label: t('ecranParcelles.liste.aSynchroniser'), tone: 'info', icon: CloudUpload });
    } else if (synchro === 'echec') {
      badges.push({ label: t('commun.etats.echec'), tone: 'erreur', icon: TriangleAlert });
    }
    return badges;
  };

  const metaDe = (parcelle: Parcelle): string => {
    const cultures = nombreCulturesConnu(parcelle);
    return [
      formatSuperficieValue(parcelle.superficie) ?? t('parcelles.nonCalculee'),
      parcelle.typeSol,
      cultures == null ? null : t('ecranParcelles.liste.cultures', { count: cultures }),
    ]
      .filter(Boolean)
      .join(' · ');
  };

  const etatVide = () => {
    if (requete.isLoading) {
      return (
        <View style={styles.squelettes} accessibilityLabel={t('parcelles.chargementParcelle')}>
          {[0, 1, 2].map((cle) => (
            <Card key={cle} padding="md">
              <View style={styles.ligneSquelette}>
                <Skeleton width={84} height={72} radius={theme.rayon.md} />
                <View style={[styles.flex, styles.textesSquelette]}>
                  <Skeleton width="70%" height={16} />
                  <Skeleton width="45%" />
                  <Skeleton width="35%" height={12} />
                </View>
              </View>
            </Card>
          ))}
        </View>
      );
    }
    if (requete.isError) {
      return (
        <AlertCard
          tone="error"
          title={t('libelles.chargementParcellesImpossible')}
          message={t('parcelles.verifiezConnexion')}
          actionLabel={t('commun.actions.reessayer')}
          onAction={() => requete.refetch()}
          actionLoading={requete.isFetching}
          testID="parcelles-erreur"
        />
      );
    }
    if (parcelles.length === 0) {
      return (
        <EmptyState
          title={t('ecranParcelles.liste.aucuneParcelle')}
          message={t('parcelles.premiereParcelle')}
          actionLabel={t('parcelles.creerUne')}
          onAction={ouvrirCreation}
          testID="parcelles-vide"
        />
      );
    }
    if (recherche.trim()) {
      return (
        <EmptyState
          title={t('domaine.aucunResultat')}
          message={t('ecranParcelles.liste.aucunResultatPour', { recherche: recherche.trim() })}
          actionLabel={t('ecranParcelles.liste.effacerRecherche')}
          onAction={() => setRecherche('')}
          testID="parcelles-aucun-resultat"
        />
      );
    }
    return (
      <EmptyState
        title={t('domaine.aucunResultat')}
        message={t('ecranParcelles.liste.aucunePourFiltre', { filtre: t(`ecranParcelles.liste.filtres.${filtre}`) })}
        actionLabel={t('ecranParcelles.liste.voirToutes')}
        onAction={() => setFiltre('TOUTES')}
        testID="parcelles-filtre-vide"
      />
    );
  };

  return (
    <View style={[styles.racine, { backgroundColor: theme.couleurs.fond }]} testID="ecran-parcelles-v2">
      <FlatList
        data={affichees}
        keyExtractor={(parcelle) => parcelle.id}
        renderItem={({ item }) => (
          <FieldMapCard
            nom={item.nom}
            points={item.pointsGPS ?? []}
            meta={metaDe(item)}
            description={item.description}
            caption={t('ecranParcelles.liste.modifieeLe', { date: formatDate(item.modifieA) })}
            tone={item.statut === 'ACTIVE' ? 'primaire' : tonStatutParcelle(item.statut)}
            badges={badgesDe(item)}
            labelSansGeometrie={t('ecranParcelles.liste.sansContour')}
            onPress={() => ouvrirDetail(item)}
            accessibilityHint={t('ecranParcelles.liste.ouvrirAide')}
            testID={`parcelle-${item.id}`}
          />
        )}
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
        label={t('ecranParcelles.liste.nouvelle')}
        icon={Plus}
        onPress={ouvrirCreation}
        accessibilityHint={t('ecranParcelles.liste.nouvelleAide')}
        testID="parcelles-nouvelle"
        style={[styles.fab, { right: theme.dimensions.margeEcran }]}
      />
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
  separateur: { height: 12 },
  squelettes: { gap: 12 },
  ligneSquelette: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  textesSquelette: { gap: 8 },
  fab: { position: 'absolute', bottom: 16 },
});
