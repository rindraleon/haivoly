import { router } from 'expo-router';
import { CloudUpload, Eye, Wheat, Wrench } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChoixCultureSheet } from '@/features/commun/ChoixCultureSheet';
import { RAYON } from '@/ui/tokens/dimensions';
import { etatSynchroEntite } from '@/features/commun/regles';
import {
  compterParFiltre,
  evenementsInterventions,
  evenementsObservations,
  evenementsRecoltes,
  filtrerEvenements,
  fusionnerEvenements,
  grouperParJour,
  FILTRES_SUIVI,
  type EvenementSuivi,
  type FiltreSuivi,
  type JourSuivi,
} from '@/features/suivi/regles';
import { useSuiviDuCompte } from '@/features/suivi/useSuiviDuCompte';
import {
  AlertCard,
  Badge,
  EmptyState,
  FilterChips,
  Skeleton,
  Text,
  Touchable,
  useTheme,
} from '@/ui';

const RESUME_MAX = 90;

function couper(texte: string): string {
  const nettoye = texte.trim().replace(/\s+/g, ' ');
  return nettoye.length <= RESUME_MAX ? nettoye : `${nettoye.slice(0, RESUME_MAX - 1)}…`;
}

const ICONES: Record<EvenementSuivi['type'], typeof Eye> = {
  OBSERVATION: Eye,
  INTERVENTION: Wrench,
  RECOLTE: Wheat,
};

/**
 * Suivi unifié V2 (lot 4) : un seul fil chronologique pour les observations,
 * interventions et récoltes de toutes les cultures du compte, filtrable par
 * type et par culture, groupé par jour. Remplace l'onglet « Suivi » V1
 * limité aux observations (V1 conservé derrière le drapeau V1/V2).
 */
export function SuiviUnifieScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const suivi = useSuiviDuCompte();
  const [filtre, setFiltre] = useState<FiltreSuivi>('TOUTES');
  const [cultureId, setCultureId] = useState<string | null>(null);
  const [choixVisible, setChoixVisible] = useState(false);
  const [rafraichissement, setRafraichissement] = useState(false);

  const rafraichir = useCallback(() => {
    setRafraichissement(true);
    suivi.refetch();
    setRafraichissement(false);
  }, [suivi]);

  const nomCulture = useMemo(() => {
    const table = new Map(suivi.cultures.map((culture) => [culture.id, culture.nom]));
    return (id: string) => table.get(id) ?? t('ecranSuivi.cultureInconnue');
  }, [suivi.cultures, t]);

  const evenements = useMemo(
    () =>
      fusionnerEvenements(
        evenementsObservations(suivi.observations, nomCulture, (observation) =>
          couper(observation.description),
        ),
        evenementsInterventions(suivi.interventions, nomCulture, (intervention) =>
          couper(
            `${t(`ecranCultures.typesIntervention.${intervention.type}`)}${
              intervention.produit ? ` · ${intervention.produit}` : ''
            }`,
          ),
        ),
        evenementsRecoltes(suivi.recoltes, nomCulture, (recolte) =>
          couper(`${recolte.quantite} ${recolte.unite}${recolte.prixVente ? ` · ${recolte.prixVente} Ar` : ''}`),
        ),
      ),
    [suivi.observations, suivi.interventions, suivi.recoltes, nomCulture, t],
  );

  const comptes = useMemo(() => compterParFiltre(evenements), [evenements]);
  const filtres = useMemo(() => filtrerEvenements(evenements, filtre, cultureId), [evenements, filtre, cultureId]);
  const jours = useMemo(() => grouperParJour(filtres), [filtres]);

  const libelleJour = useCallback(
    (jour: string) =>
      new Date(`${jour}T12:00:00`).toLocaleDateString(i18n.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
    [i18n.language],
  );

  const cultureFiltre = suivi.cultures.find((culture) => culture.id === cultureId);

  const entete = (
    <View style={styles.entete}>
      <Text variant="h1">{t('ecranSuivi.titre')}</Text>
      <Text variant="caption">{t('ecranSuivi.sousTitre')}</Text>
      <FilterChips
        testID="suivi-filtres"
        accessibilityLabel={t('ecranSuivi.filtresA11y')}
        value={filtre}
        onChange={setFiltre}
        options={FILTRES_SUIVI.map((valeur) => ({
          value: valeur,
          label: t(`ecranSuivi.filtres.${valeur}`),
          count: comptes[valeur],
        }))}
      />
      <View style={styles.ligneFiltre}>
        <Touchable
          testID="suivi-filtre-culture"
          style={[styles.puceCulture, { backgroundColor: theme.couleurs.primaireConteneur }]}
          onPress={() => setChoixVisible(true)}
          accessibilityLabel={t('ecranSuivi.filtrerParCulture')}
        >
          <Text variant="label">
            {cultureFiltre ? cultureFiltre.nom : t('ecranSuivi.toutesCultures')}
          </Text>
        </Touchable>
        {cultureId ? (
          <Touchable testID="suivi-filtre-culture-effacer" onPress={() => setCultureId(null)}>
            <Text variant="caption">{t('commun.actions.effacer')}</Text>
          </Touchable>
        ) : null}
      </View>
    </View>
  );

  const ligne = ({ item }: { item: JourSuivi }) => (
    <View style={styles.jour}>
      <Text variant="label" style={styles.jourTitre}>
        {libelleJour(item.jour)}
      </Text>
      {item.evenements.map((evenement) => {
        const Icone = ICONES[evenement.type];
        const etatSync = etatSynchroEntite({ _syncStatus: evenement.syncStatus });
        const horsLigne = etatSync !== null;
        return (
          <Touchable
            key={evenement.id}
            testID={`suivi-evenement-${evenement.id}`}
            accessibilityLabel={`${t(`ecranSuivi.types.${evenement.type}`)}, ${evenement.cultureNom}`}
            style={[styles.carte, { backgroundColor: theme.couleurs.surface }]}
            onPress={() => {
              const culture = suivi.cultures.find((une) => une.id === evenement.cultureId);
              router.push({
                pathname: '/detail-culture',
                params: { id: evenement.cultureId, parcelleId: culture?.parcelleId ?? '' },
              });
            }}
          >
            <View style={[styles.icone, { backgroundColor: theme.couleurs.primaireConteneur }]}>
              <Icone size={18} color={theme.couleurs.primaire} />
            </View>
            <View style={styles.colonne}>
              <Text variant="body">{evenement.resume}</Text>
              <View style={styles.ligneMeta}>
                <Badge tone="neutre" label={evenement.cultureNom} />
                <Text variant="caption">{t(`ecranSuivi.types.${evenement.type}`)}</Text>
                {horsLigne ? (
                  <View style={styles.sync}>
                    <CloudUpload size={12} color={theme.couleurs.texteSecondaire} />
                    <Text variant="caption">{t('ecranSuivi.enAttenteEnvoi')}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </Touchable>
        );
      })}
    </View>
  );

  return (
    <View style={[styles.racine, { backgroundColor: theme.couleurs.fond }]} testID="ecran-suivi-v2">
      <FlatList
        data={jours}
        keyExtractor={(item) => item.jour}
        renderItem={ligne}
        ListHeaderComponent={entete}
        ListEmptyComponent={
          suivi.isError ? (
            <AlertCard
              tone="error"
              title={t('ecranSuivi.erreur')}
              actionLabel={t('commun.actions.reessayer')}
              onAction={suivi.refetch}
              testID="suivi-erreur"
            />
          ) : suivi.isLoading ? (
            <View style={styles.charge} testID="suivi-chargement">
              <Skeleton height={72} radius={16} />
              <Skeleton height={72} radius={16} />
              <Skeleton height={72} radius={16} />
            </View>
          ) : (
            <EmptyState
              testID="suivi-vide"
              title={t('ecranSuivi.vide')}
              message={t(filtre === 'TOUTES' && !cultureId ? 'ecranSuivi.videMessage' : 'ecranSuivi.videFiltre')}
            />
          )
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + theme.espace.md,
          paddingHorizontal: theme.dimensions.margeEcran,
          paddingBottom: 104,
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
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
      <ChoixCultureSheet
        visible={choixVisible}
        onFermer={() => setChoixVisible(false)}
        onChoisir={(culture) => setCultureId(culture.id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  entete: { gap: 10, paddingBottom: 4 },
  ligneFiltre: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  puceCulture: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: RAYON.md },
  charge: { gap: 12 },
  jour: { paddingBottom: 8 },
  jourTitre: { textTransform: 'capitalize', paddingBottom: 8 },
  carte: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 16,
    padding: 12,
    marginBottom: 8,
  },
  icone: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  colonne: { flex: 1, gap: 6 },
  ligneMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  sync: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});
