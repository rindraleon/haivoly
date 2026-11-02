import { useCallback, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { router } from 'expo-router';
import { Bell, CheckCheck } from 'lucide-react-native';

import { ScreenHeader } from '@/components/CommonComponent/ScreenHeader';
import { NotificationCard } from '@/components/NotificationComponent/NotificationCard';
import { EmptyState } from '@/components/CommonComponent/EmptyState';
import { LoadingState } from '@/components/CommonComponent/LoadingState';
import { useRecommendationsFeed } from '@/hooks';
import { env } from '@/config/env';
import { colors } from '@/theme';
import type { Recommendation } from '@/types/notification.types';

import { styles } from './NotificationScreen.styles';

export default function NotificationScreen() {
  const { t } = useTranslation();
  const {
    recommendations,
    unreadCount,
    loading,
    refreshing,
    erreur,
    derniereErreur,
    refresh,
    markRead,
    markAllRead,
  } = useRecommendationsFeed();
  const [marking, setMarking] = useState(false);

  const onPressItem = useCallback(
    async (item: Recommendation) => {
      if (item.readAt) return;
      try {
        await markRead(item.id);
      } catch {
        Alert.alert(t('notifications.titre'), t('notifications.connexionRequise'));
      }
    },
    [markRead, t],
  );

  const onMarkAllRead = useCallback(async () => {
    if (unreadCount === 0 || marking) return;
    setMarking(true);
    try {
      await markAllRead();
    } catch {
      Alert.alert(t('notifications.titre'), t('notifications.connexionRequise'));
    } finally {
      setMarking(false);
    }
  }, [markAllRead, marking, unreadCount, t]);

  const goBack = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  return (
    <View style={styles.root}>
      <ScreenHeader
        title={t('notifications.titre')}
        subtitle={
          unreadCount > 0
            ? t('notifications.nonLues', { count: unreadCount })
            : t('notifications.toutLu')
        }
        showBack
        onBack={goBack}
      />

      {loading ? (
        <LoadingState message={t('notifications.chargement')} />
      ) : (
        <FlatList
          style={styles.listFlex}
          data={recommendations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <NotificationCard item={item} onPress={() => void onPressItem(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => void refresh()}
              tintColor={colors.primary[500]}
            />
          }
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            unreadCount > 0 || erreur ? (
              <View>
                {erreur ? (
                  <View style={styles.syncError}>
                    <View style={styles.syncErrorCopy}>
                      <Text style={styles.syncErrorText}>
                        {t('notifications.erreurSynchronisation')}
                      </Text>
                      {env.isDev && derniereErreur ? (
                        <Text selectable style={styles.syncErrorDetail}>
                          {derniereErreur}
                        </Text>
                      ) : null}
                    </View>
                    <Pressable
                      onPress={() => void refresh()}
                      disabled={refreshing}
                      accessibilityRole="button"
                      accessibilityLabel={t('commun.actions.reessayer')}
                      style={({ pressed }) => [styles.retry, pressed && styles.pressed]}
                    >
                      <Text style={styles.retryText}>{t('commun.actions.reessayer')}</Text>
                    </Pressable>
                  </View>
                ) : null}
                {unreadCount > 0 ? (
                  <View style={styles.summary}>
                    <Text style={styles.summaryText}>
                      {t('notifications.nonLues', { count: unreadCount })}
                    </Text>
                    <Pressable
                      onPress={() => void onMarkAllRead()}
                      disabled={marking}
                      accessibilityRole="button"
                      accessibilityLabel={t('notifications.marquerToutLu')}
                      style={({ pressed }) => [styles.markAll, pressed && styles.pressed]}
                    >
                      <CheckCheck size={14} color={colors.primary[700]} />
                      <Text style={styles.markAllText}>{t('notifications.marquerToutLu')}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            ) : null
          }
          ListEmptyComponent={
            <EmptyState
              icon={Bell}
              title={erreur ? t('notifications.erreurChargement') : t('notifications.aucune')}
              description={
                erreur
                  ? t('notifications.erreurSynchronisation')
                  : t('notifications.aucuneDescription')
              }
              actionLabel={erreur ? t('commun.actions.reessayer') : undefined}
              onAction={erreur ? () => void refresh() : undefined}
            />
          }
        />
      )}
    </View>
  );
}
