import { router, useLocalSearchParams } from 'expo-router';
import { Archive, Sprout, Trash2, Wheat } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import {
  filtrerHistorique,
  periodeCulture,
  resumeHistorique,
  type FiltreHistorique,
} from '@/features/cultures/reglesHistorique';
import { useCulturesDuCompte, useRecoltesDuCompte } from '@/hooks';
import type { Culture } from '@/types';
import {
  AlertCard,
  Badge,
  Card,
  EmptyState,
  FilterChips,
  KpiCard,
  SearchField,
  Skeleton,
  Text,
  Touchable,
  useTheme,
} from '@/ui';
import { Screen, TopAppBar } from '@/ui/layout';
import { formatNombre } from '@/utils/formatNombre';
import { formatDate as formatDateCourt } from '@/utils/date';

const TONS_STATUT: Record<string, 'succes' | 'alerte' | 'neutre'> = {
  RECOLTEE: 'succes',
  ABANDONNEE: 'alerte',
  SUPPRIMEE: 'neutre',
};
const ICONES_STATUT = { RECOLTEE: Wheat, ABANDONNEE: Archive, SUPPRIMEE: Trash2 } as const;

function CarteHistorique({ culture, onPress }: { culture: Culture; onPress: () => void }) {
  const { t } = useTranslation();
  const periode = periodeCulture(culture);
  const Icone = ICONES_STATUT[culture.statut as keyof typeof ICONES_STATUT] ?? Sprout;
  return (
    <Card variant="outlined" padding="sm">
      <Touchable
        testID={`historique-culture-${culture.id}`}
        onPress={onPress}
        feedback="opacity"
        accessibilityRole="button"
        accessibilityLabel={`${culture.nom}, ${t(`ecranHistoriqueCultures.statuts.${culture.statut}`)}`}
        accessibilityHint={t('ecranHistoriqueCultures.ouvrirAide')}
        style={styles.ligne}
      >
        <View style={styles.flex}>
          <Text variant="body" style={styles.titre}>
            {culture.nom}
            {culture.variete ? ` · ${culture.variete}` : ''}
          </Text>
          <Text variant="caption" color="texteSecondaire" numberOfLines={1}>
            {culture.parcelle?.nom ?? t('ecranHistoriqueCultures.parcelleInconnue')}
          </Text>
          <Text variant="caption" color="texteTertiaire">
            {periode.debut ? formatDateCourt(periode.debut) : '—'} → {periode.fin ? formatDateCourt(periode.fin) : '—'}
          </Text>
        </View>
        <View style={styles.colonne}>
          <Badge
            label={t(`ecranHistoriqueCultures.statuts.${culture.statut}`)}
            tone={TONS_STATUT[culture.statut] ?? 'neutre'}
            icon={Icone}
            size="sm"
          />
          {culture.recolte ? (
            <Text variant="caption" color="texteSecondaire" tabular>
              {formatNombre(culture.recolte.quantite)} {culture.recolte.unite}
            </Text>
          ) : null}
        </View>
      </Touchable>
    </Card>
  );
}

/**
 * Historique des cultures V2 (lot 6) : cycles terminés (récoltés, abandonnés,
 * supprimés) du compte, filtrables par statut et recherchables, avec résumé
 * chiffré (kg récoltés convertibles) — liste virtualisée, parité V1 conservée
 * (filtres + recherche) et carte plein écran accessible depuis l'en-tête.
 */
export function HistoriqueCulturesScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const params = useLocalSearchParams<{ parcelleId?: string }>();
  const cultures = useCulturesDuCompte();
  const recoltes = useRecoltesDuCompte();
  const [filtre, setFiltre] = useState<FiltreHistorique>('tous');
  const [terme, setTerme] = useState('');

  const duCompte = useMemo(() => {
    const items = cultures.data?.items ?? [];
    return params.parcelleId ? items.filter((culture) => culture.parcelleId === params.parcelleId) : items;
  }, [cultures.data, params.parcelleId]);

  const visibles = useMemo(() => filtrerHistorique(duCompte, filtre, terme), [duCompte, filtre, terme]);
  const resume = useMemo(() => resumeHistorique(duCompte, recoltes.data ?? []), [duCompte, recoltes.data]);

  const entete = (
    <View style={styles.entete}>
      <Text variant="h1" accessibilityRole="header">
        {t('ecranHistoriqueCultures.titre')}
      </Text>
      <View style={styles.kpis}>
        <View style={styles.demi}>
          <KpiCard
            testID="historique-kpi-nombre"
            liveRegion="polite"
            label={t('ecranHistoriqueCultures.kpi.cycles')}
            value={resume.nombre}
            icon={Sprout}
            hint={t('ecranHistoriqueCultures.kpi.cyclesHint', {
              recoltees: resume.recoltees,
              abandonnees: resume.abandonnees,
            })}
          />
        </View>
        <View style={styles.demi}>
          <KpiCard
            testID="historique-kpi-kg"
            liveRegion="polite"
            label={t('ecranHistoriqueCultures.kpi.kg')}
            value={resume.kgRecoltes === null ? '—' : formatNombre(resume.kgRecoltes)}
            unit="kg"
            icon={Wheat}
            tone="succes"
          />
        </View>
      </View>
      <SearchField
        testID="historique-recherche"
        value={terme}
        onChangeText={setTerme}
        placeholder={t('ecranHistoriqueCultures.recherche')}
        accessibilityLabel={t('ecranHistoriqueCultures.rechercheA11y')}
        clearLabel={t('commun.actions.effacer')}
      />
      <FilterChips<FiltreHistorique>
        testID="historique-filtres"
        options={[
          { value: 'tous', label: t('ecranHistoriqueCultures.filtres.tous', { count: resume.nombre }) },
          { value: 'RECOLTEE', label: t('ecranHistoriqueCultures.filtres.RECOLTEE', { count: resume.recoltees }) },
          { value: 'ABANDONNEE', label: t('ecranHistoriqueCultures.filtres.ABANDONNEE', { count: resume.abandonnees }) },
          { value: 'SUPPRIMEE', label: t('ecranHistoriqueCultures.filtres.SUPPRIMEE', { count: resume.supprimees }) },
        ]}
        value={filtre}
        onChange={setFiltre}
        accessibilityLabel={t('ecranHistoriqueCultures.filtresA11y')}
      />
    </View>
  );

  if (cultures.isLoading) {
    return (
      <View style={styles.racine} testID="ecran-historique-cultures-v2">
        <TopAppBar
          title={t('ecranHistoriqueCultures.titre')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/cultures'))}
          backLabel={t('commun.actions.retour')}
        />
        <Screen scroll={false} gap={12}>
          <Skeleton height={72} radius={16} />
          <Skeleton height={96} radius={16} />
          <Skeleton height={96} radius={16} />
        </Screen>
      </View>
    );
  }

  if (cultures.isError) {
    return (
      <View style={styles.racine} testID="ecran-historique-cultures-v2">
        <TopAppBar
          title={t('ecranHistoriqueCultures.titre')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/cultures'))}
          backLabel={t('commun.actions.retour')}
        />
        <Screen>
          <AlertCard
            tone="error"
            title={t('ecranHistoriqueCultures.erreur')}
            actionLabel={t('ecranHistoriqueCultures.reessayer')}
            onAction={() => void cultures.refetch()}
            testID="historique-erreur"
          />
        </Screen>
      </View>
    );
  }

  return (
    <View style={styles.racine} testID="ecran-historique-cultures-v2">
      <TopAppBar
        title={t('ecranHistoriqueCultures.titre')}
        subtitle={t('ecranHistoriqueCultures.sousTitre')}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/cultures'))}
        backLabel={t('commun.actions.retour')}
      />
      <FlatList
        data={visibles}
        keyExtractor={(item) => item.id}
        style={styles.listeConteneur}
        contentContainerStyle={[styles.liste, { backgroundColor: theme.couleurs.fond }]}
        ListHeaderComponent={entete}
        refreshing={cultures.isFetching}
        onRefresh={() => void cultures.refetch()}
        renderItem={({ item }) => (
          <CarteHistorique
            culture={item}
            onPress={() => router.push({ pathname: '/detail-culture', params: { id: item.id } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            testID="historique-vide"
            title={t(terme || filtre !== 'tous' ? 'ecranHistoriqueCultures.videFiltre.titre' : 'ecranHistoriqueCultures.vide.titre')}
            message={t(terme || filtre !== 'tous' ? 'ecranHistoriqueCultures.videFiltre.message' : 'ecranHistoriqueCultures.vide.message')}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listeConteneur: { flex: 1 },
  racine: { flex: 1 },
  entete: { gap: 12, paddingBottom: 4 },
  kpis: { flexDirection: 'row', gap: 12 },
  demi: { flexBasis: '47%', flexGrow: 1 },
  liste: { paddingBottom: 140, gap: 10 },
  ligne: { flexDirection: 'row', gap: 12 },
  flex: { flex: 1 },
  colonne: { alignItems: 'flex-end', gap: 6 },
  titre: { fontWeight: '600' },
});
