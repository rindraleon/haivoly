/* eslint-disable react-hooks/set-state-in-effect */
import { i18n } from '@/i18n/instance';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useConfirm } from '@/components/CommonComponent/ConfirmProvider';
import { MapPinned, ChevronRight, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useParcelles, useProfile, useRecommendationsFeed } from '@/hooks';
import { getActiveAccountId, removeToken } from '@/storage/authStorage';
import { queryClient } from '@/providers/AppProviders';
import { colors } from '@/theme';
import { Card } from '@/components/CommonComponent/Card';
import { Badge } from '@/components/CommonComponent/Badge';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { ErrorState } from '@/components/CommonComponent/ErrorState';

// Feature components
import { HomeHeader } from '@/components/HomeComponent/Header';

import { ActionSection } from '@/components/HomeComponent/ActionSection';
import { NotificationCenter } from '@/components/NotificationComponent/NotificationCenter';
import { OfflineBanner } from '@/components/CommonComponent/OfflineBanner';
import { useNetwork } from '@/hooks/common/useNetwork';
import { getPendingCount } from '@/services/offline/queue';
import { syncOnce } from '@/services/offline/syncEngine';

import { styles } from './HomeScreen.styles';

import { formatDate } from '@/utils/date';
export default function HomeScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { data: user, isLoading: loadingUser, isError, refetch: refetchUser } = useProfile();
  const {
    data: parcellesPage,
    isLoading: loadingParcelles,
    refetch: refetchParcelles,
  } = useParcelles({ limit: 200 });
  /** `useParcelles` renvoie une page : l'accueil ne montre que la liste. */
  const parcelles = parcellesPage?.items ?? [];
  const [refreshing, setRefreshing] = useState(false);
  const { isOnline } = useNetwork();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const {
    recommendations,
    unreadCount,
    refresh: refreshRecommendations,
    markRead,
    markAllRead,
  } = useRecommendationsFeed();

  const parcellesActives = (parcelles ?? []).filter((p) => p.statut === 'ACTIVE');
  const totalSuperficie = parcellesActives.reduce((acc, p) => acc + (p.superficie ?? 0), 0);
  const ha = totalSuperficie / 10000;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return t('accueil.bonjour');
    if (h < 18) return t('accueil.bonApresMidi');
    return t('accueil.bonsoir');
  })();

  const refreshQueueCount = useCallback(async () => {
    const accountId = await getActiveAccountId();
    if (!accountId) {
      setPendingCount(0);
      return;
    }
    setPendingCount(await getPendingCount());
  }, []);

  useEffect(() => {
    void refreshQueueCount();
    void syncOnce();
    const id = setInterval(() => void refreshQueueCount(), 3000);
    return () => clearInterval(id);
  }, [refreshQueueCount]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOnce();
    await Promise.all([refreshQueueCount(), refreshRecommendations()]);
    setIsSyncing(false);
  };

  const confirm = useConfirm();
  const handleLogout = async () => {
    const ok = await confirm({
      title: t('accueil.deconnexion.titre'),
      description: t('accueil.deconnexion.description'),
      confirmLabel: t('accueil.deconnexion.confirmer'),
      cancelLabel: 'Annuler',
      variant: 'primary',
    });
    if (!ok) return;
    await removeToken();
    queryClient.clear();
    void import('@/services/offline/syncEngine')
      .then((engine) => engine.refreshCounters())
      .catch(() => {});
    router.replace('/(auth)/login' as any);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchUser(),
        refetchParcelles(),
        refreshQueueCount(),
        refreshRecommendations(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUser, refetchParcelles, refreshQueueCount, refreshRecommendations]);

  if (loadingUser) return <LoadingState message={i18n.t('divers.chargementEspace')} />;
  if (isError || !user)
    return (
      <ErrorState
        title={i18n.t('libelles.chargementProfilImpossible')}
        message={t('accueil.erreurChargement')}
        onRetry={() => refetchUser()}
        onBack={handleLogout}
      />
    );

  return (
    <View style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 12 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary[500]} />}
      >
        {/* Header composé */}
        <View style={styles.header}>
          <HomeHeader
            user={user as any}
            greeting={greeting}
            loadingParcelles={loadingParcelles}
            parcellesCount={parcellesActives.length}
            superficieHa={ha}
            pendingCount={pendingCount}
            isOnline={isOnline ?? true}
            notificationCount={unreadCount}
          />

          <OfflineBanner
            isOnline={isOnline ?? true}
            pendingCount={pendingCount}
            isSyncing={isSyncing}
            onSyncPress={handleSync}
          />
        </View>

        {/* Actions rapides — composant dédié */}
        <ActionSection parcellesCount={parcellesActives.length} />

        {/* Notifications / Recommandations — centre */}
        {recommendations.length > 0 && (
          <NotificationCenter
            items={recommendations.slice(0, 3)}
            onSeeAll={() => router.push('/(app)/(common)/notifications' as any)}
            onMarkAllRead={async () => {
              if (isOnline !== true) {
                Alert.alert(t('accueil.notificationsConnexionRequise'));
                return;
              }
              try {
                await markAllRead();
              } catch {
                Alert.alert(t('accueil.notificationsEchec'));
              }
            }}
            onPressItem={async (item) => {
              try {
                await markRead(item.id);
              } catch {
                Alert.alert(t('accueil.notificationsConnexionRequise'));
              }
            }}
          />
        )}

        {/* Parcelles récentes — reste atomique pour l’instant */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('accueil.parcellesRecentes')}</Text>
            <Pressable onPress={() => router.push('/(app)/(parcelles)/parcelles' as any)} hitSlop={8}>
              <Text style={styles.seeAll}>{t('commun.actions.voirTout')}</Text>
            </Pressable>
          </View>

          {loadingParcelles ? (
            <Card>
              <Text style={{ color: colors.neutral[500], fontSize: 13 }}>{t('commun.etats.chargement')}</Text>
            </Card>
          ) : parcellesActives.length === 0 ? (
            <Card>
              <View style={{ gap: 12, alignItems: 'center', paddingVertical: 8 }}>
                <View style={styles.emptyIcon}>
                  <MapPinned size={20} color={colors.neutral[400]} />
                </View>
                <View style={{ gap: 4, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.neutral[800] }}>{t('accueil.aucuneParcelle')}</Text>
                  <Text style={{ fontSize: 12.5, color: colors.neutral[500], textAlign: 'center' }}>{t('accueil.aucuneParcelleHint')}</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(app)/(parcelles)/ajout-parcelle' as any)}
                  style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.85 }]}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.emptyCtaText}>{t('accueil.creerParcelle')}</Text>
                </Pressable>
              </View>
            </Card>
          ) : (
            <View style={{ gap: 10 }}>
              {parcellesActives.slice(0, 3).map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => router.push(`/(app)/(parcelles)/detail-parcelle?parcelleId=${p.id}` as any)}
                  style={({ pressed }) => [pressed && { opacity: 0.92, transform: [{ scale: 0.99 }] }]}
                >
                  <Card style={{ gap: 10 }}>
                    <View style={styles.parcelleTop}>
                      <View style={styles.parcelleIcon}>
                        <MapPinned size={16} color={colors.primary[600]} />
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <Text numberOfLines={1} style={styles.parcelleName}>
                          {p.nom}
                        </Text>
                        <Text numberOfLines={1} style={styles.parcelleMeta}>
                          {[p.typeSol, p.superficie ? `${(p.superficie / 10000).toFixed(2)} ha` : null].filter(Boolean).join(' • ') || t('accueil.parcelleAgricole')}
                        </Text>
                      </View>
                      <Badge label={p.statut} variant={p.statut === 'ACTIVE' ? 'success' : 'neutral'} dot />
                    </View>
                    {p.description ? (
                      <Text numberOfLines={2} style={styles.parcelleDesc}>
                        {p.description}
                      </Text>
                    ) : null}
                    <View style={styles.parcelleFooter}>
                      <Text style={styles.parcelleDate}>Modifiée le {formatDate(p.modifieA)}</Text>
                      <View style={styles.chev}>
                        <ChevronRight size={16} color={colors.neutral[500]} />
                      </View>
                    </View>
                  </Card>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Text style={styles.footer}>{t('accueil.piedDePage')}</Text>
      </ScrollView>
    </View>
  );
}
