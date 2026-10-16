import { router } from 'expo-router';
import { Bell, CheckCheck, Eye, MapPin, Sprout, Wheat, Wrench, type LucideIcon } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RefreshControl, SectionList, StyleSheet, View } from 'react-native';

import { BlocDiagnostic } from '@/features/notifications/BlocDiagnostic';
import { routeParEntite, sectionsParJour, cleJour, estNonLue, jourDeReco, toneParType } from '@/features/notifications/regles';
import { useRecommendationsFeed } from '@/hooks';
import type { Recommendation } from '@/types';
import { Badge, EmptyState, FilterChips, IconButton, Skeleton, Text, Touchable, useTheme } from '@/ui';
import { TopAppBar } from '@/ui/layout';
import { formatDateShort, formatTime, todayDateOnly } from '@/utils/date';

const ICONES_ENTITE: Record<string, LucideIcon> = {
  OBSERVATION: Eye,
  INTERVENTION: Wrench,
  RECOLTE: Wheat,
  PARCELLE: MapPin,
  CULTURE: Sprout,
};

type Filtre = 'toutes' | 'nonLues';

function CarteNotification({
  item,
  onPress,
  testID,
}: {
  item: Recommendation;
  onPress: () => void;
  testID: string;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { couleurs } = theme;
  const nonLue = estNonLue(item);
  const Icone = ICONES_ENTITE[String(item.metadata?.entityType ?? '')] ?? Bell;
  const ton = toneParType(item.type);
  const teinteIcone =
    ton === 'erreur'
      ? couleurs.erreur
      : ton === 'alerte'
        ? couleurs.alerte
        : ton === 'succes'
          ? couleurs.succes
          : couleurs.info;

  return (
    <Touchable
      testID={testID}
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={`${item.title}${nonLue ? `, ${t('centreNotifications.nonLue')}` : ''}`}
      style={[
        styles.carte,
        {
          backgroundColor: nonLue ? couleurs.surfaceAlt : couleurs.surface,
          borderColor: couleurs.bordure,
          borderRadius: theme.rayon.lg,
        },
      ]}
    >
      <View style={[styles.puce, { backgroundColor: couleurs.surface, borderColor: couleurs.bordure }]}>
        <Icone size={18} color={teinteIcone} />
      </View>
      <View style={styles.corps}>
        <View style={styles.ligneTitre}>
          <Text variant="body" style={styles.titre} numberOfLines={1}>
            {item.title}
          </Text>
          {nonLue ? <View style={[styles.point, { backgroundColor: couleurs.primaire }]} /> : null}
        </View>
        <Text variant="caption" color="texteSecondaire" style={styles.message} numberOfLines={2}>
          {item.message}
        </Text>
        <View style={styles.pied}>
          <Text variant="caption" color="texteTertiaire">
            {jourDeReco(item) === todayDateOnly()
              ? formatTime(item.createdAt)
              : formatDateShort(item.createdAt)}
          </Text>
          <Badge size="sm" label={t(`centreNotifications.types.${item.type}`)} tone={ton} />
        </View>
      </View>
    </Touchable>
  );
}

/**
 * Centre de notifications V2 (lot 5) : fil groupé par jour, filtre
 * « Non lues », lecture au tap avec navigation vers l'entité concernée,
 * « Tout marquer lu » qui réalimente la pastille de la barre d'onglets.
 * Source offline-first partagée avec le tableau de bord (mêmes compteurs).
 */
export function NotificationsCentreScreen() {
  const { t } = useTranslation();
  const { couleurs } = useTheme();
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
  const [filtre, setFiltre] = useState<Filtre>('toutes');
  const [marquage, setMarquage] = useState(false);

  const visibles = useMemo(
    () => (filtre === 'nonLues' ? recommendations.filter(estNonLue) : recommendations),
    [recommendations, filtre],
  );
  const sections = useMemo(
    () => sectionsParJour(visibles, todayDateOnly()),
    [visibles],
  );

  const ouvrir = async (item: Recommendation) => {
    if (estNonLue(item)) {
      try {
        await markRead(item.id);
      } catch {
        // lecture impossible hors ligne : l'ouverture reste utile.
      }
    }
    const route = routeParEntite(item.metadata);
    if (route) router.push(route as never);
  };

  const toutMarquerLu = async () => {
    if (marquage || unreadCount === 0) return;
    setMarquage(true);
    try {
      await markAllRead();
    } catch {
      // silencieux : le compteur reste inchangé, l'utilisateur réessaiera.
    } finally {
      setMarquage(false);
    }
  };

  return (
    <View style={styles.racine} testID="ecran-notifications-v2">
      <TopAppBar
        title={t('centreNotifications.titre')}
        subtitle={
          unreadCount > 0
            ? t('centreNotifications.sousTitreNonLues', { count: unreadCount })
            : t('centreNotifications.toutLu')
        }
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/home'))}
        backLabel={t('commun.actions.retour')}
        right={
          <IconButton
            icon={CheckCheck}
            accessibilityLabel={t('centreNotifications.toutMarquerLu')}
            testID="notif-tout-lu"
            onPress={() => void toutMarquerLu()}
            badge={unreadCount}
          />
        }
      />
      <FilterChips<Filtre>
        options={[
          { value: 'toutes', label: t('centreNotifications.filtres.toutes', { count: recommendations.length }) },
          { value: 'nonLues', label: t('centreNotifications.filtres.nonLues', { count: unreadCount }) },
        ]}
        value={filtre}
        onChange={setFiltre}
        accessibilityLabel={t('centreNotifications.filtres.accessibilite')}
        testID="notif-filtres"
      />
      {loading ? (
        <View style={styles.skeletons}>
          <Skeleton height={84} radius={16} />
          <Skeleton height={84} radius={16} />
          <Skeleton height={84} radius={16} />
        </View>
      ) : visibles.length === 0 ? (
        erreur ? (
          <EmptyState
            testID="notif-erreur"
            title={t('centreNotifications.erreur.titre')}
            message={t('centreNotifications.erreur.message')}
          />
        ) : (
          <EmptyState
            testID="notif-vide"
            title={t(filtre === 'nonLues' ? 'centreNotifications.videNonLues.titre' : 'centreNotifications.vide.titre')}
            message={t(filtre === 'nonLues' ? 'centreNotifications.videNonLues.message' : 'centreNotifications.vide.message')}
          />
        )
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void refresh()} tintColor={couleurs.primaire} />
          }
          contentContainerStyle={styles.liste}
          renderSectionHeader={({ section }) => (
            <Text variant="label" color="texteSecondaire" style={styles.enteteJour}>
              {t(`centreNotifications.jours.${cleJour(section.jour, todayDateOnly())}`, {
                date: formatDateShort(`${section.jour}T12:00:00.000Z`),
              })}
            </Text>
          )}
          renderItem={({ item }) => (
            <CarteNotification
              item={item}
              testID={`notif-${item.id}`}
              onPress={() => void ouvrir(item)}
            />
          )}
        />
      )}
      <BlocDiagnostic erreur={derniereErreur} />
    </View>
  );
}

const styles = StyleSheet.create({
  racine: { flex: 1 },
  skeletons: { gap: 12, paddingHorizontal: 20, paddingTop: 8 },
  liste: { paddingHorizontal: 20, paddingBottom: 120, gap: 10 },
  enteteJour: { marginTop: 6, marginBottom: 2 },
  carte: { flexDirection: 'row', gap: 12, padding: 12, borderWidth: 1 },
  puce: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  corps: { flex: 1, gap: 4 },
  ligneTitre: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  titre: { flex: 1, fontWeight: '600' },
  point: { width: 8, height: 8, borderRadius: 4 },
  message: { lineHeight: 18 },
  pied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
});
