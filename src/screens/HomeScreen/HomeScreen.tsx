/**
 * HomeScreen — implémentation de l’écran.
 *
 * Le fichier de route correspondant (`src/app/(app)/…`) ne fait que
 * réexporter ce composant : toute la logique vit ici.
 */
/* eslint-disable react-hooks/set-state-in-effect, react/no-unescaped-entities */
/**
 * HomeScreen — composition (un écran = assemblage de composants)
 * Orchestre navigation + hooks, UI déléguée aux features
 */
import { useCallback, useEffect, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useConfirm } from '@/components/CommonComponent/ConfirmProvider';
import { MapPinned, ChevronRight, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useParcelles, useProfile } from '@/hooks';
import { recommendationsApi } from '@/services';
import { removeToken } from '@/storage/authStorage';
import { colors } from '@/theme';
import { Card } from '@/components/CommonComponent/Card';
import { Badge } from '@/components/CommonComponent/Badge';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { ErrorState } from '@/components/CommonComponent/ErrorState';
import { AppBottomBar } from '@/components/CommonComponent/AppBottomBar';

// Feature components
import { HomeHeader } from '@/components/HomeComponent/Header';

import { ActionSection } from '@/components/HomeComponent/ActionSection';
import { NotificationCenter } from '@/components/NotificationComponent/NotificationCenter';
import { OfflineBanner } from '@/components/CommonComponent/OfflineBanner';
import { useNetwork } from '@/hooks/common/useNetwork';
import { getPendingCount } from '@/services/offline/queue';
import { syncOnce } from '@/services/offline/syncEngine';
import { getItem, setItem, StorageKeys } from '@/storage/database';
import { markRecommendationReadLocal,} from '@/services/offline/recommendationSync';
import type { Recommendation } from '@/types/notification.types';

import { styles } from './HomeScreen.styles';

import { formatDate } from '@/utils/date';
export default function HomeScreen() {
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
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const parcellesActives = (parcelles ?? []).filter((p) => p.statut === 'ACTIVE');
  const totalSuperficie = parcellesActives.reduce((acc, p) => acc + (p.superficie ?? 0), 0);
  const ha = totalSuperficie / 10000;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  })();

  const refreshPending = useCallback(async () => {
    setPendingCount(await getPendingCount());
    const recs = await getItem<Recommendation[]>(StorageKeys.RECOMMENDATIONS, []);
    setRecommendations(recs);
  }, []);

  useEffect(() => {
    refreshPending();
    // Une synchronisation à l'ouverture, puis rafraîchissement des compteurs.
    // La boucle périodique est celle du provider (`AppProviders`) : en démarrer
    // une ici coupait celle de l'application en quittant l'écran.
    void syncOnce();
    const id = setInterval(refreshPending, 3000);
    return () => clearInterval(id);
  }, [refreshPending]);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOnce();
    await refreshPending();
    setIsSyncing(false);
  };

  const confirm = useConfirm();
  const handleLogout = async () => {
    const ok = await confirm({
      title: 'Se déconnecter ?',
      description: 'Vous allez quitter votre session. Vous devrez vous reconnecter pour accéder à vos parcelles.',
      confirmLabel: 'Se déconnecter',
      cancelLabel: 'Annuler',
      variant: 'primary',
    });
    if (!ok) return;
    await removeToken();
    router.replace('/(auth)/login' as any);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([refetchUser(), refetchParcelles(), refreshPending()]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchUser, refetchParcelles, refreshPending]);

  if (loadingUser) return <LoadingState message="Chargement de votre espace..." />;
  if (isError || !user)
    return (
      <ErrorState
        title="Impossible de charger le profil"
        message="Vérifiez votre connexion et réessayez."
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
  notificationCount={
    recommendations.filter((r) => !r.readAt).length
  }
/>

<OfflineBanner
  isOnline={isOnline ?? true}
  pendingCount={pendingCount}
  isSyncing={isSyncing}
  onSyncPress={handleSync}
/>

          {/* Stats 
          <View style={styles.statsRow}>
            <Card style={[styles.statCard as any, { flex: 1.1 } as any]}>
              <Text style={styles.statValue}>{loadingParcelles ? '—' : parcellesActives.length}</Text>
              <Text style={styles.statLabel}>Parcelles actives</Text>
              <Text style={styles.statHint}>{ha.toFixed(2)} ha au total</Text>
            </Card>
            <Card style={[styles.statCard as any, { flex: 1 } as any]}>
              <Text style={styles.statValue}>{pendingCount}</Text>
              <Text style={styles.statLabel}>En attente</Text>
              <Text style={styles.statHint}>{isOnline ? 'à synchroniser' : 'offline'}</Text>
            </Card>
            <Card style={[styles.statCard as any, { flex: 1 } as any]}>
              <Text style={styles.statValue}>{recommendations.filter((r) => !r.readAt).length}</Text>
              <Text style={styles.statLabel}>Notifications</Text>
              <Text style={styles.statHint}>recommandations</Text>
            </Card>
          </View>*/}
        </View> 

        {/* Actions rapides — composant dédié */}
        <ActionSection parcellesCount={parcellesActives.length} />

        {/* Notifications / Recommandations — centre */}
        {recommendations.length > 0 && (
  <NotificationCenter
    items={recommendations.slice(0, 3)}
    onMarkAllRead={async () => {
      const now = new Date().toISOString();

      const updated = recommendations.map((r) => ({
        ...r,
        readAt: r.readAt ?? now,
      }));

      setRecommendations(updated);

      await setItem(
        StorageKeys.RECOMMENDATIONS,
        updated,
      );

      // Synchronisation backend
      if (isOnline) {
        try {
          await recommendationsApi.markAllRead();
        } catch {
          // Le statut local reste conservé
          // si le backend est momentanément indisponible.
        }
      }
    }}
    onPressItem={async (item) => {
      await markRecommendationReadLocal(item.id);

      const updated = recommendations.map((r) =>
        r.id === item.id
          ? {
              ...r,
              readAt: r.readAt ?? new Date().toISOString(),
            }
          : r,
      );

      setRecommendations(updated);
    }}
  />
)}

        {/* Parcelles récentes — reste atomique pour l’instant */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Parcelles récentes</Text>
            <Pressable onPress={() => router.push('/(app)/(parcelles)/parcelles' as any)} hitSlop={8}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </Pressable>
          </View>

          {loadingParcelles ? (
            <Card>
              <Text style={{ color: colors.neutral[500], fontSize: 13 }}>Chargement...</Text>
            </Card>
          ) : parcellesActives.length === 0 ? (
            <Card>
              <View style={{ gap: 12, alignItems: 'center', paddingVertical: 8 }}>
                <View style={styles.emptyIcon}>
                  <MapPinned size={20} color={colors.neutral[400]} />
                </View>
                <View style={{ gap: 4, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, fontWeight: '700', color: colors.neutral[800] }}>Aucune parcelle pour l'instant</Text>
                  <Text style={{ fontSize: 12.5, color: colors.neutral[500], textAlign: 'center' }}>Créez votre première parcelle pour commencer.</Text>
                </View>
                <Pressable
                  onPress={() => router.push('/(app)/(parcelles)/ajout-parcelle' as any)}
                  style={({ pressed }) => [styles.emptyCta, pressed && { opacity: 0.85 }]}
                >
                  <Plus size={16} color="#FFFFFF" />
                  <Text style={styles.emptyCtaText}>Créer une parcelle</Text>
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
                          {[p.typeSol, p.superficie ? `${(p.superficie / 10000).toFixed(2)} ha` : null].filter(Boolean).join(' • ') || 'Parcelle agricole'}
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

        <Text style={styles.footer}>Haivoly — Plateforme de gestion agricole • Antananarivo</Text>
      </ScrollView>

      <AppBottomBar />
    </View>
  );
}
