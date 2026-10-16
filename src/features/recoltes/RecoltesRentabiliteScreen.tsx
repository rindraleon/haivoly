import { useLocalSearchParams, router } from 'expo-router';
import { Banknote, Gauge, Receipt, TrendingUp, Wheat } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';

import { etatSynchroEntite } from '@/features/commun/regles';
import { libelleQuantites, resumeRentabilite } from '@/features/recoltes/regles';
import { useCulturesDuCompte, useRecoltesDuCompte } from '@/hooks';
import type { Recolte } from '@/types';
import {
  AlertCard,
  Badge,
  Card,
  EmptyState,
  FilterChips,
  KpiCard,
  Skeleton,
  Text,
  Touchable,
} from '@/ui';
import { Screen } from '@/ui/layout';
import { formatMontant, formatNombreDecimal } from '@/utils/formatNombre';
import { formatDate as formatDateCourt } from '@/utils/date';

function CarteRecolte({
  recolte,
  nomCulture,
  onPress,
}: {
  recolte: Recolte;
  nomCulture: string;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const sync = etatSynchroEntite(recolte);
  const marge = (recolte.prixVente ?? 0) - (recolte.coutRecolte ?? 0);
  return (
    <Card variant="outlined" padding="sm">
      <Touchable
        testID={`recolte-${recolte.id}`}
        onPress={onPress}
        feedback="opacity"
        accessibilityRole="button"
        accessibilityLabel={`${nomCulture}, ${formatDateCourt(recolte.dateRecolte)}, ${recolte.quantite} ${recolte.unite}`}
        style={styles.ligne}
      >
        <View style={styles.flex}>
          <Text variant="body" style={styles.titre}>
            {nomCulture}
          </Text>
          <Text variant="caption" color="texteSecondaire">
            {formatDateCourt(recolte.dateRecolte)} · {formatNombreDecimal(recolte.quantite, 1)} {recolte.unite}
          </Text>
          {recolte.description ? (
            <Text variant="caption" color="texteTertiaire" numberOfLines={1}>
              {recolte.description}
            </Text>
          ) : null}
        </View>
        <View style={styles.montants}>
          {recolte.prixVente != null ? (
            <Text variant="caption" color="texteSecondaire" tabular>
              {formatMontant(recolte.prixVente)}
            </Text>
          ) : null}
          <Text variant="caption" color={marge >= 0 ? 'succes' : 'erreur'} tabular>
            {t('ecranRecoltes.margePrefixe', { montant: formatMontant(marge) })}
          </Text>
        </View>
      </Touchable>
      {sync ? (
        <Badge
          size="sm"
          label={t(sync === 'echec' ? 'ecranRecoltes.sync.echec' : 'ecranRecoltes.sync.aSynchroniser')}
          tone={sync === 'echec' ? 'erreur' : 'alerte'}
        />
      ) : null}
    </Card>
  );
}

/**
 * Récolte & rendement V2 (lot 5) : KPI du compte (quantités par unité,
 * revenus, coûts, marge, rendement kg/ha quand la superficie est connue),
 * filtre par culture et liste des récoltes tapables vers le cockpit.
 * Données existantes uniquement : récoltes saisies + superficies.
 */
export function RecoltesRentabiliteScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams<{ cultureId?: string }>();
  const recoltes = useRecoltesDuCompte();
  const cultures = useCulturesDuCompte();
  const [filtreCulture, setFiltreCulture] = useState<string>(params.cultureId ?? 'toutes');

  const toutes = useMemo(() => recoltes.data ?? [], [recoltes.data]);
  const nomParCulture = useMemo(
    () => new Map((cultures.data?.items ?? []).map((culture) => [culture.id, culture.nom])),
    [cultures.data],
  );
  const culturesAvecRecolte = useMemo(() => {
    const ids = [...new Set(toutes.map((recolte) => recolte.cultureId))];
    return ids
      .map((id) => ({ id, nom: nomParCulture.get(id) }))
      .filter((item): item is { id: string; nom: string } => Boolean(item.nom));
  }, [toutes, nomParCulture]);

  const visibles = useMemo(
    () => (filtreCulture === 'toutes' ? toutes : toutes.filter((r) => r.cultureId === filtreCulture)),
    [toutes, filtreCulture],
  );
  const resume = useMemo(
    () => resumeRentabilite(visibles, cultures.data?.items ?? []),
    [visibles, cultures.data],
  );

  const triees = useMemo(
    () => [...visibles].sort((a, b) => b.dateRecolte.localeCompare(a.dateRecolte)),
    [visibles],
  );

  if (recoltes.isLoading || cultures.isLoading) {
    return (
      <Screen testID="ecran-recoltes-v2" gap={12}>
        <Skeleton height={72} radius={16} />
        <Skeleton height={72} radius={16} />
        <Skeleton height={96} radius={16} />
      </Screen>
    );
  }

  if (recoltes.isError) {
    return (
      <Screen testID="ecran-recoltes-v2">
        <AlertCard
          tone="error"
          title={t('ecranRecoltes.erreur')}
          actionLabel={t('ecranRecoltes.reessayer')}
          onAction={() => void recoltes.refetch()}
          testID="recoltes-erreur"
        />
      </Screen>
    );
  }

  const entete = (
    <View style={styles.entete}>
        <Text variant="h1" accessibilityRole="header">
        {t('ecranRecoltes.titre')}
        </Text>
        <View style={styles.grille}>
          <View style={styles.demi}>
          <KpiCard
          testID="recoltes-kpi-quantite"
          liveRegion="polite"
          label={t('ecranRecoltes.kpi.quantite')}
          value={resume.quantitesParUnite.length ? libelleQuantites(resume.quantitesParUnite) : '0'}
          icon={Wheat}
          hint={t('ecranRecoltes.kpi.quantiteHint', { count: resume.nombre })}
        />
            </View>
          <View style={styles.demi}>
          <KpiCard
          testID="recoltes-kpi-revenu"
          label={t('ecranRecoltes.kpi.revenu')}
          value={formatMontant(resume.revenu)}
          icon={Banknote}
          tone="succes"
        />
            </View>
          <View style={styles.demi}>
          <KpiCard
          testID="recoltes-kpi-cout"
          label={t('ecranRecoltes.kpi.cout')}
          value={formatMontant(resume.cout)}
          icon={Receipt}
          tone="alerte"
        />
            </View>
          <View style={styles.demi}>
          <KpiCard
          testID="recoltes-kpi-marge"
          label={t('ecranRecoltes.kpi.marge')}
          value={formatMontant(resume.marge)}
          icon={TrendingUp}
          tone={resume.marge >= 0 ? 'succes' : 'erreur'}
        />
            </View>
          </View>
      {resume.rendementKgParHa != null ? (
          <KpiCard
          testID="recoltes-kpi-rendement"
          label={t('ecranRecoltes.kpi.rendement')}
          value={formatMontant(resume.rendementKgParHa)}
          unit="kg/ha"
          icon={Gauge}
          hint={t('ecranRecoltes.kpi.rendementHint', { superficie: formatNombreDecimal(resume.superficieHa ?? 0, 1) })}
        />
      ) : null}

      {culturesAvecRecolte.length > 1 ? (
          <FilterChips<string>
          testID="recoltes-filtre-culture"
          options={[
            { value: 'toutes', label: t('ecranRecoltes.filtre.toutes') },
            ...culturesAvecRecolte.map((culture) => ({ value: culture.id, label: culture.nom })),
          ]}
          value={filtreCulture}
          onChange={setFiltreCulture}
          accessibilityLabel={t('ecranRecoltes.filtre.accessibilite')}
        />
      ) : null}

    </View>
  );

  return (
    <Screen testID="ecran-recoltes-v2" scroll={false}>
      <FlatList
        data={triees}
        keyExtractor={(item) => item.id}
        style={styles.listeConteneur}
        contentContainerStyle={styles.liste}
        ListHeaderComponent={entete}
        refreshing={recoltes.isFetching}
        onRefresh={() => void recoltes.refetch()}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <CarteRecolte
            recolte={item}
            nomCulture={nomParCulture.get(item.cultureId) ?? t('ecranRecoltes.cultureInconnue')}
            onPress={() => router.push({ pathname: '/detail-culture', params: { id: item.cultureId } })}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            testID="recoltes-vide"
            title={t('ecranRecoltes.vide.titre')}
            message={t('ecranRecoltes.vide.message')}
          />
        }
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  listeConteneur: { flex: 1 },
  flex: { flex: 1 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  demi: { flexBasis: '47%', flexGrow: 1 },
  liste: { gap: 10, paddingBottom: 140 },
  entete: { gap: 14 },
  ligne: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  titre: { fontWeight: '600' },
  montants: { alignItems: 'flex-end', gap: 2 },
});
