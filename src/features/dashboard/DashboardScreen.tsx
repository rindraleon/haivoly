import { router } from 'expo-router';
import {
  Banknote,
  Bell,
  CircleCheck,
  ClipboardList,
  Clock3,
  MapPinned,
  Receipt,
  Sprout,
  TrendingUp,
  TriangleAlert,
  Wheat,
  Wrench,
} from 'lucide-react-native';
import { useCallback, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, FlatList, StyleSheet, View } from 'react-native';

import { useConfirm } from '@/components/CommonComponent/ConfirmProvider';
import { libelleEcheance as libelleEcheanceRecolte } from '@/features/cultures/regles';
import { useCultures, useMembresProjet, useParcelles, useProfile, useRecoltesDuCompte, useRecommendationsFeed } from '@/hooks';
import { queryClient, useSyncContext } from '@/providers/AppProviders';
import { removeToken } from '@/storage/authStorage';
import type { Culture, Parcelle } from '@/types';
import {
  AlertCard,
  Badge,
  Card,
  CropCard,
  DonutChart,
  EmptyState,
  FieldMapCard,
  KpiCard,
  PrimaryButton,
  RecommendationCard,
  Screen,
  SectionHeader,
  Skeleton,
  Text,
  couleursGraphique,
  useTheme,
  type FieldMapCardBadge,
} from '@/ui';
import { formatDate, todayDateOnly } from '@/utils/date';
import { formatMontant, formatNombreDecimal } from '@/utils/formatNombre';
import { libelleQuantites, resumeRentabilite } from '@/features/recoltes/regles';

import { EnteteTableauDeBord } from './components/EnteteTableauDeBord';
import { Raccourcis, type Raccourci } from './components/Raccourcis';
import { formaterDecimal } from './format';
import {
  echeanceRecolte,
  parcellesAAfficher,
  parcellesActives,
  prochainesRecoltes,
  progressionCulture,
  repartitionCultures,
  resumeCultures,
  salutation,
  statutVisuel,
  superficieHa,
  type Echeance,
  type RaisonPriorite,
} from './selectors';

type CleSection =
  | 'entete'
  | 'alerte'
  | 'kpis'
  | 'raccourcis'
  | 'parcelles'
  | 'recoltes'
  | 'cumul'
  | 'projet'
  | 'repartition'
  | 'recommandations'
  | 'pied';

const BADGE_RAISON: Record<RaisonPriorite, Omit<FieldMapCardBadge, 'label'>> = {
  recolteRetard: { tone: 'erreur', icon: TriangleAlert },
  recolteProche: { tone: 'info', icon: Wheat },
  aDelimiter: { tone: 'alerte', icon: MapPinned },
  sansCulture: { tone: 'neutre', icon: Sprout },
};

/**
 * Tableau de bord V2 (remplace l'accueil derrière le drapeau `v2`).
 * Données : profil, parcelles, cultures, recommandations, file hors ligne —
 * les mêmes hooks que la V1, aucune nouvelle route serveur.
 */
export function DashboardScreen() {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const confirm = useConfirm();
  const sync = useSyncContext();
  const profil = useProfile();
  // Lot 8 : vue d'ensemble du projet pour le propriétaire (membres rattachés).
  const membresProjet = useMembresProjet();
  const requeteParcelles = useParcelles({ limit: 200 });
  const requeteCultures = useCultures({ limit: 200 });
  const flux = useRecommendationsFeed();
  const recoltesCompte = useRecoltesDuCompte();
  const [rafraichissement, setRafraichissement] = useState(false);

  const aujourdhui = todayDateOnly();
  const parcelles: Parcelle[] = requeteParcelles.data?.items ?? [];
  const cultures: Culture[] = requeteCultures.data?.items ?? [];
  const actives = parcellesActives(parcelles);
  const resume = resumeCultures(cultures);
  const affichees = parcellesAAfficher(parcelles, cultures, aujourdhui);
  const aucunePriorite = affichees.every((p) => !p.prioritaire);
  const recoltes = prochainesRecoltes(cultures);
  const repartition = repartitionCultures(cultures);
  const enEchec = sync.failedCount + sync.invalidCount + sync.conflictCount;
  // Lot 7 : cumul des récoltes du compte (règles partagées de l'écran Récoltes).
  const cumul = resumeRentabilite(recoltesCompte.data ?? [], cultures);

  const rafraichir = useCallback(async () => {
    setRafraichissement(true);
    try {
      await Promise.all([
        profil.refetch(),
        requeteParcelles.refetch(),
        requeteCultures.refetch(),
        flux.refresh(),
      ]);
    } finally {
      setRafraichissement(false);
    }
  }, [profil, requeteParcelles, requeteCultures, flux]);

  const seDeconnecter = useCallback(async () => {
    const ok = await confirm({
      title: t('accueil.deconnexion.titre'),
      description: t('accueil.deconnexion.description'),
      confirmLabel: t('accueil.deconnexion.confirmer'),
      cancelLabel: t('commun.actions.annuler'),
      variant: 'primary',
    });
    if (!ok) return;
    await removeToken();
    queryClient.clear();
    void import('@/services/offline/syncEngine')
      .then((moteur) => moteur.refreshCounters())
      .catch(() => {});
    router.replace('/(auth)/login' as never);
  }, [confirm, t]);

  const marquerLue = useCallback(
    async (id: string) => {
      try {
        await flux.markRead(id);
      } catch {
        Alert.alert(t('accueil.notificationsConnexionRequise'));
      }
    },
    [flux, t],
  );

  const toutMarquerLu = useCallback(async () => {
    if (!sync.isOnline) {
      Alert.alert(t('accueil.notificationsConnexionRequise'));
      return;
    }
    try {
      await flux.markAllRead();
    } catch {
      Alert.alert(t('accueil.notificationsEchec'));
    }
  }, [flux, sync.isOnline, t]);

  const libelleEcheance = (echeance: Echeance): string | null => libelleEcheanceRecolte(t, echeance);

  if (profil.isLoading) return <SqueletteTableauDeBord />;

  if (profil.isError || !profil.data) {
    return (
      <Screen>
        <AlertCard
          tone="error"
          title={t('libelles.chargementProfilImpossible')}
          message={t('accueil.erreurChargement')}
        />
        <PrimaryButton label={t('commun.actions.reessayer')} onPress={() => void profil.refetch()} fullWidth />
        <PrimaryButton
          label={t('accueil.deconnexion.confirmer')}
          onPress={() => void seDeconnecter()}
          variant="outline"
          fullWidth
        />
      </Screen>
    );
  }

  const utilisateur = profil.data;
  const prenom = utilisateur.prenom?.trim() || utilisateur.nom;
  const nomComplet = [utilisateur.prenom, utilisateur.nom].filter(Boolean).join(' ') || utilisateur.nom;
  const parcellesParId = new Map(parcelles.map((p) => [p.id, p]));
  const chargementDonnees = requeteParcelles.isLoading || requeteCultures.isLoading;
  const couleurs = couleursGraphique(theme.mode);

  const raccourcis: Raccourci[] = [
    {
      cle: 'nouvelle-parcelle',
      libelle: t('tableauDeBord.raccourcis.nouvelleParcelle'),
      icone: MapPinned,
      ton: 'primaire',
      onPress: () => router.push('/ajout-parcelle'),
    },
    {
      cle: 'interventions',
      libelle: t('tableauDeBord.raccourcis.interventions'),
      icone: Wrench,
      ton: 'alerte',
      onPress: () => router.push('/interventions-culture'),
    },
    {
      cle: 'observations',
      libelle: t('tableauDeBord.raccourcis.observations'),
      icone: ClipboardList,
      ton: 'info',
      onPress: () => router.navigate('/observations'),
    },
    {
      cle: 'cultures',
      libelle: t('tableauDeBord.raccourcis.cultures'),
      icone: Sprout,
      ton: 'succes',
      onPress: () => router.navigate('/cultures'),
    },
  ];

  const renduSection = (cle: CleSection): ReactElement | null => {
    switch (cle) {
      case 'entete':
        return (
          <>
      <EnteteTableauDeBord
        prenom={prenom}
        nomComplet={nomComplet}
        cleSalutation={salutation(new Date().getHours())}
        enLigne={sync.isOnline}
        nonLues={flux.unreadCount}
        onNotifications={() => router.push('/notifications')}
        onProfil={() => router.navigate('/profil')}
      />
          </>
        );
      case 'alerte':
        return (
          <>
      {!sync.isOnline ? (
        <AlertCard
          tone="offline"
          title={t('tableauDeBord.sync.horsLigneTitre')}
          message={t('tableauDeBord.sync.horsLigneMessage', { count: sync.pendingCount })}
        />
      ) : enEchec > 0 ? (
        <AlertCard
          tone="warning"
          title={t('tableauDeBord.sync.echecsTitre', { count: enEchec })}
          message={t('tableauDeBord.sync.echecsMessage')}
          actionLabel={t('commun.actions.reessayer')}
          onAction={() => void sync.retry()}
          actionLoading={sync.isSyncing}
        />
      ) : sync.pendingCount > 0 ? (
        <AlertCard
          tone="info"
          title={t('tableauDeBord.sync.enAttenteTitre', { count: sync.pendingCount })}
          message={t('tableauDeBord.sync.enAttenteMessage')}
          actionLabel={t('tableauDeBord.sync.synchroniser')}
          onAction={() => void sync.syncNow()}
          actionLoading={sync.isSyncing}
        />
      ) : null}
          </>
        );
      case 'kpis':
        return (
          <>
      <View style={styles.grille}>
        <KpiCard
          label={t('tableauDeBord.kpi.parcelles')}
          value={actives.length}
          hint={`${formaterDecimal(superficieHa(parcelles), 2, i18n.language)} ha`}
          icon={MapPinned}
          tone="primaire"
          loading={requeteParcelles.isLoading}
          onPress={() => router.navigate('/parcelles')}
          testID="kpi-parcelles"
        />
        <KpiCard
          label={t('tableauDeBord.kpi.cultures')}
          value={resume.enCours}
          hint={t('tableauDeBord.kpi.planifiees', { count: resume.planifiees })}
          icon={Sprout}
          tone="succes"
          loading={requeteCultures.isLoading}
          onPress={() => router.navigate('/cultures')}
          testID="kpi-cultures"
          liveRegion="polite"
        />
        <KpiCard
          label={t('tableauDeBord.kpi.notifications')}
          value={flux.unreadCount}
          hint={t('tableauDeBord.kpi.recommandations')}
          icon={Bell}
          tone={flux.unreadCount > 0 ? 'info' : 'neutre'}
          loading={flux.loading}
          onPress={() => router.push('/notifications')}
          testID="kpi-notifications"
        />
        <KpiCard
          label={t('tableauDeBord.kpi.enAttente')}
          value={sync.pendingCount}
          hint={
            !sync.isOnline
              ? t('tableauDeBord.horsLigne')
              : sync.pendingCount > 0
                ? t('accueil.aSynchroniser')
                : t('tableauDeBord.kpi.toutSynchronise')
          }
          icon={sync.pendingCount > 0 ? Clock3 : CircleCheck}
          tone={sync.pendingCount > 0 ? 'alerte' : 'succes'}
          testID="kpi-en-attente"
        />
      </View>
          </>
        );
      case 'raccourcis':
        return (
          <>
      <View style={styles.section}>
        <SectionHeader title={t('tableauDeBord.raccourcis.titre')} />
        <Raccourcis elements={raccourcis} />
      </View>
          </>
        );
      case 'parcelles':
        return (
          <>
      <View style={styles.section}>
        <SectionHeader
          title={aucunePriorite ? t('accueil.parcellesRecentes') : t('tableauDeBord.prioritaires.titre')}
          actionLabel={t('commun.actions.voirTout')}
          onAction={() => router.navigate('/parcelles')}
        />
        {requeteParcelles.isError ? (
          <AlertCard
            tone="warning"
            title={t('tableauDeBord.erreurs.parcelles')}
            actionLabel={t('commun.actions.reessayer')}
            onAction={() => void requeteParcelles.refetch()}
          />
        ) : chargementDonnees ? (
          <View style={styles.liste}>
            <Skeleton height={96} radius={theme.rayon.lg} />
            <Skeleton height={96} radius={theme.rayon.lg} />
          </View>
        ) : actives.length === 0 ? (
          <Card>
            <EmptyState
              title={t('accueil.aucuneParcelle')}
              message={t('accueil.aucuneParcelleHint')}
              actionLabel={t('accueil.creerParcelle')}
              onAction={() => router.push('/ajout-parcelle')}
              testID="tableau-de-bord-vide"
            />
          </Card>
        ) : (
          <View style={styles.liste}>
            {aucunePriorite ? <AlertCard tone="success" title={t('tableauDeBord.prioritaires.vide')} /> : null}
            {affichees.map(({ parcelle, raisons, prioritaire }) => {
              const nombre =
                parcelle.nombreCultures ??
                parcelle._count?.cultures ??
                cultures.filter((c) => c.parcelleId === parcelle.id).length;
              const meta = [
                parcelle.superficie
                  ? `${formaterDecimal(parcelle.superficie / 10_000, 2, i18n.language)} ha`
                  : null,
                parcelle.typeSol,
                t('tableauDeBord.prioritaires.cultures', { count: nombre }),
              ]
                .filter(Boolean)
                .join(' · ');
              return (
                <FieldMapCard
                  key={parcelle.id}
                  nom={parcelle.nom}
                  points={parcelle.pointsGPS ?? []}
                  meta={meta}
                  caption={prioritaire ? undefined : t('tableauDeBord.modifieeLe', { date: formatDate(parcelle.modifieA) })}
                  tone={raisons.includes('recolteRetard') ? 'erreur' : 'primaire'}
                  labelSansGeometrie={t('tableauDeBord.prioritaires.raisons.aDelimiter')}
                  badges={raisons
                    .filter((r) => r !== 'aDelimiter')
                    .map((r) => ({ ...BADGE_RAISON[r], label: t(`tableauDeBord.prioritaires.raisons.${r}`) }))}
                  onPress={() => router.push(`/detail-parcelle?parcelleId=${parcelle.id}`)}
                  testID={`parcelle-accueil-${parcelle.id}`}
                />
              );
            })}
          </View>
        )}
      </View>
          </>
        );
      case 'recoltes':
        return (
          <>
      <View style={styles.section}>
        <SectionHeader
          title={t('tableauDeBord.recoltes.titre')}
          actionLabel={t('commun.actions.voirTout')}
          onAction={() => router.navigate('/cultures')}
        />
        {requeteCultures.isError ? (
          <AlertCard
            tone="warning"
            title={t('tableauDeBord.erreurs.cultures')}
            actionLabel={t('commun.actions.reessayer')}
            onAction={() => void requeteCultures.refetch()}
          />
        ) : chargementDonnees ? (
          <Skeleton height={120} radius={theme.rayon.lg} />
        ) : recoltes.length === 0 ? (
          <Card variant="tonal">
            <Text variant="bodySmall" color="texteSecondaire" align="center">
              {t('tableauDeBord.recoltes.vide')}
            </Text>
          </Card>
        ) : (
          <View style={styles.liste}>
            {recoltes.map((culture) => {
              const echeance = echeanceRecolte(culture, aujourdhui);
              return (
                <CropCard
                  key={culture.id}
                  nom={culture.nom}
                  variete={culture.variete}
                  type={culture.type}
                  parcelle={culture.parcelle?.nom ?? parcellesParId.get(culture.parcelleId)?.nom}
                  statut={statutVisuel(culture, aujourdhui)}
                  progression={progressionCulture(culture)}
                  libelleEcheance={libelleEcheance(echeance)}
                  tonEcheance={echeance.type === 'retard' ? 'erreur' : 'primaire'}
                  onPress={() =>
                    router.push({
                      pathname: '/detail-culture',
                      params: { cultureId: culture.id, parcelleId: culture.parcelleId },
                    })
                  }
                  testID={`recolte-${culture.id}`}
                />
              );
            })}
          </View>
        )}
      </View>
          </>
        );
      case 'repartition':
        return (
          <>
      {repartition.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader title={t('tableauDeBord.repartition.titre')} />
          <Card>
            <DonutChart
              segments={repartition.map((part, index) => ({
                label: part.libelle ?? t('tableauDeBord.repartition.autres'),
                value: part.valeur,
                color: couleurs[index % couleurs.length],
              }))}
              centerValue={String(resume.enCours)}
              centerLabel={t('tableauDeBord.repartition.unite', { count: resume.enCours })}
              accessibilityLabel={t('tableauDeBord.repartition.resume', {
                total: resume.enCours,
                detail: repartition
                  .map((part) => `${part.libelle ?? t('tableauDeBord.repartition.autres')} ${part.valeur}`)
                  .join(', '),
              })}
            />
          </Card>
        </View>
      ) : null}
          </>
        );
      case 'recommandations':
        return (
          <>
      {flux.recommendations.length > 0 ? (
        <View style={styles.section}>
          <SectionHeader
            title={t('notifications.recommandations')}
            subtitle={
              flux.unreadCount > 0 ? t('notifications.nonLues', { count: flux.unreadCount }) : t('notifications.toutLu')
            }
            actionLabel={t('commun.actions.voirTout')}
            onAction={() => router.push('/notifications')}
          />
          <View style={styles.liste}>
            {flux.recommendations.slice(0, 3).map((reco) => (
              <RecommendationCard
                key={reco.id}
                title={reco.title}
                message={reco.message}
                priority={reco.priority}
                kind={reco.type}
                unread={!reco.readAt}
                priorityLabel={t(`notifications.priorites.${reco.priority}`)}
                unreadLabel={t('notifications.nonLue')}
                dateLabel={formatDate(reco.createdAt)}
                onPress={() => void marquerLue(reco.id)}
                testID={`recommandation-${reco.id}`}
              />
            ))}
          </View>
          {flux.unreadCount > 0 ? (
            <PrimaryButton
              label={t('notifications.marquerToutLu')}
              onPress={() => void toutMarquerLu()}
              variant="ghost"
              size="sm"
              style={styles.droite}
            />
          ) : null}
        </View>
      ) : null}
          </>
        );
      case 'pied':
        return (
          <>
      <Text variant="caption" color="texteTertiaire" align="center">
        {t('accueil.piedDePage')}
      </Text>
          </>
        );
      case 'projet': {
        const membres = membresProjet.data ?? [];
        return (
          <>
      <View style={styles.section} testID="tableau-de-bord-projet">
        <SectionHeader title={t('tableauDeBord.projet.titre')} />
        <Card testID="projet-carte">
          <Text variant="bodySmall" color="texteSecondaire" testID="projet-membres-compte">
            {membres.length > 0
              ? t('tableauDeBord.projet.membres', { count: membres.length })
              : t('tableauDeBord.projet.aucunMembre')}
          </Text>
          {membres.length > 0 ? (
            <View style={styles.pucesMembres}>
              {membres.map((membre) => (
                <Badge
                  key={membre.id}
                  label={membre.nomComplet}
                  tone={membre.role === 'PROPRIETAIRE' ? 'primaire' : 'neutre'}
                  size="sm"
                  testID={`projet-membre-${membre.id}`}
                />
              ))}
            </View>
          ) : null}
          <Text variant="micro" color="texteTertiaire" testID="projet-portee">
            {t('tableauDeBord.projet.portee')}
          </Text>
        </Card>
      </View>
          </>
        );
      }
      case 'cumul':
        return (
          <>
      <View style={styles.section} testID="tableau-de-bord-cumul">
        <SectionHeader
          title={t('tableauDeBord.cumul.titre', { count: cumul.nombre })}
          actionLabel={t('commun.actions.voirTout')}
          onAction={() => router.navigate('/recoltes')}
          actionAccessibilityLabel={t('tableauDeBord.cumul.voirToutA11y')}
        />
        <Card>
          <View style={styles.grille}>
            <View style={styles.demi}>
              <KpiCard
                label={t('tableauDeBord.cumul.quantite')}
                value={cumul.quantitesParUnite.length ? libelleQuantites(cumul.quantitesParUnite) : '0'}
                icon={Wheat}
                testID="cumul-quantite"
                liveRegion="polite"
              />
            </View>
            <View style={styles.demi}>
              <KpiCard
                label={t('tableauDeBord.cumul.revenu')}
                value={formatMontant(cumul.revenu)}
                icon={Banknote}
                tone="succes"
                testID="cumul-revenu"
              />
            </View>
            <View style={styles.demi}>
              <KpiCard
                label={t('tableauDeBord.cumul.cout')}
                value={formatMontant(cumul.cout)}
                icon={Receipt}
                tone="alerte"
                testID="cumul-cout"
              />
            </View>
            <View style={styles.demi}>
              <KpiCard
                label={t('tableauDeBord.cumul.marge')}
                value={formatMontant(cumul.marge)}
                icon={TrendingUp}
                tone={cumul.marge >= 0 ? 'succes' : 'erreur'}
                testID="cumul-marge"
              />
            </View>
          </View>
          {cumul.rendementKgParHa != null ? (
            <Text variant="bodySmall" color="texteSecondaire" tabular testID="cumul-rendement">
              {t('tableauDeBord.cumul.rendement', {
                valeur: formatNombreDecimal(cumul.rendementKgParHa, 0),
                superficie: formatNombreDecimal(cumul.superficieHa ?? 0, 1),
              })}
            </Text>
          ) : null}
        </Card>
      </View>
          </>
        );
    }
    return null;
  };

  const sections: CleSection[] = [
    'entete',
    ...(!sync.isOnline || enEchec > 0 || sync.pendingCount > 0 ? (['alerte'] as CleSection[]) : []),
    'kpis',
    'raccourcis',
    'parcelles',
    'recoltes',
    ...(cumul.nombre > 0 ? (['cumul'] as CleSection[]) : []),
    ...(utilisateur.role === 'PROPRIETAIRE' ? (['projet'] as CleSection[]) : []),
    ...(repartition.length > 0 ? (['repartition'] as CleSection[]) : []),
    ...(flux.recommendations.length > 0 ? (['recommandations'] as CleSection[]) : []),
    'pied',
  ];

  return (
    <Screen scroll={false} refreshing={rafraichissement} onRefresh={() => void rafraichir()} testID="tableau-de-bord">
      <FlatList
        data={sections}
        keyExtractor={(cle) => cle}
        style={styles.listeConteneur}
        renderItem={({ item }) => renduSection(item)}
        contentContainerStyle={styles.contenuListe}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}


function SqueletteTableauDeBord() {
  const theme = useTheme();
  return (
    <Screen scroll={false}>
      <View style={styles.squeletteEntete}>
        <View style={styles.flex}>
          <Skeleton width={90} height={14} />
          <Skeleton width={160} height={28} />
        </View>
        <Skeleton width={48} height={48} radius={24} />
        <Skeleton width={48} height={48} radius={24} />
      </View>
      <View style={styles.grille}>
        {[0, 1, 2, 3].map((i) => (
          <View key={i} style={styles.squeletteKpi}>
            <Skeleton height={112} radius={theme.rayon.lg} />
          </View>
        ))}
      </View>
      <Skeleton height={96} radius={theme.rayon.lg} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  pucesMembres: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginVertical: 8 },
  listeConteneur: { flex: 1 },
  contenuListe: { gap: 20, paddingBottom: 8 },
  demi: { flexBasis: '47%', flexGrow: 1 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  section: { gap: 12 },
  liste: { gap: 12 },
  droite: { alignSelf: 'flex-end' },
  flex: { flex: 1, gap: 8 },
  squeletteEntete: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  squeletteKpi: { flexBasis: '47%', flexGrow: 1 },
});
