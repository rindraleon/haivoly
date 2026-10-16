import { router } from 'expo-router';
import { AlertTriangle, Camera, CheckCircle2, Eye, Layers, MapPin, RefreshCw, Sprout, Wheat, Wrench } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet, View } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import type { LucideIcon } from 'lucide-react-native';

import { useNetworkStatus } from '@/hooks';
import { queryClient } from '@/providers/AppProviders';
import { getQueue, removeSynced } from '@/services/offline/queue';
import { retryFailed, syncOnce } from '@/services/offline/syncEngine';
import type { EntityType, OfflineAction } from '@/types/offline.types';
import { Card, EmptyState, IconButton, PrimaryButton, Skeleton, Text, Touchable, useTheme } from '@/ui';
import { Screen, TopAppBar } from '@/ui/layout';
import { formatDate } from '@/utils/date';

import { aDesEchecs, grouperFile, resumeFile } from './reglesFileSync';

const ICONES_ENTITE: Record<EntityType, LucideIcon> = {
  PARCELLE: Layers,
  POINT_GPS: MapPin,
  CULTURE: Sprout,
  INTERVENTION: Wrench,
  OBSERVATION: Eye,
  PHOTO: Camera,
  RECOLTE: Wheat,
};

/**
 * File de synchronisation hors ligne (lot 8) : toutes les actions locales non
 * envoyées, groupées par entité (parcelles, cultures, observations…), avec
 * relance ciblée des échecs, synchronisation complète et nettoyage des actions
 * déjà envoyées. Complète l'envoi manuel du profil sans le remplacer.
 */
export function FileSynchronisationScreen() {
  const { t } = useTranslation();
  const { couleurs } = useTheme();
  const enLigne = useNetworkStatus();
  const [ouverts, setOuvrir] = useState<ReadonlySet<EntityType>>(() => new Set());
  const [occupation, setOccupation] = useState<string | null>(null);

  const file = useQuery({
    queryKey: ['file-synchronisation'],
    queryFn: () => getQueue(),
  });

  const actions: OfflineAction[] = useMemo(() => file.data ?? [], [file.data]);
  const groupes = useMemo(() => grouperFile(actions), [actions]);
  const resume = useMemo(() => resumeFile(actions), [actions]);
  const echecs = useMemo(() => aDesEchecs(actions), [actions]);

  const rafraichir = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: ['file-synchronisation'] });
  }, []);

  const agir = useCallback(
    async (cle: string, action: () => Promise<unknown>) => {
      if (occupation) return;
      setOccupation(cle);
      try {
        await action();
      } finally {
        setOccupation(null);
        rafraichir();
      }
    },
    [occupation, rafraichir],
  );

  const basculer = useCallback((entite: EntityType) => {
    setOuvrir((actuel) => {
      const suivant = new Set(actuel);
      if (suivant.has(entite)) suivant.delete(entite);
      else suivant.add(entite);
      return suivant;
    });
  }, []);

  if (file.isLoading) {
    return (
      <View style={styles.racine} testID="ecran-file-sync-v2">
        <TopAppBar
          title={t('ecranFileSync.titre')}
          onBack={() => (router.canGoBack() ? router.back() : router.replace('/profil'))}
          backLabel={t('commun.actions.retour')}
        />
        <Screen scroll={false}>
          <Skeleton height={120} radius={20} />
          <Skeleton height={120} radius={20} />
        </Screen>
      </View>
    );
  }

  return (
    <View style={styles.racine} testID="ecran-file-sync-v2">
      <TopAppBar
        title={t('ecranFileSync.titre')}
        subtitle={t('ecranFileSync.resume', {
          attente: resume.enAttente + resume.enCours,
          echecs: resume.echecs + resume.conflits,
          total: resume.total,
        })}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/profil'))}
        backLabel={t('commun.actions.retour')}
        right={
          <IconButton
            icon={RefreshCw}
            accessibilityLabel={t('commun.actions.actualiser')}
            onPress={() => void file.refetch()}
            testID="file-sync-refresh"
          />
        }
      />
      {resume.total === 0 ? (
        <Screen>
          <EmptyState
            title={t('ecranFileSync.vide.titre')}
            message={t('ecranFileSync.vide.description')}
            testID="file-vide"
          />
        </Screen>
      ) : (
        <Screen scroll={false} testID="file-contenu">
          <View style={styles.entetes}>
            <PrimaryButton
              icon={RefreshCw}
              label={t('ecranFileSync.actions.toutSynchroniser')}
              loading={occupation === 'sync'}
              disabled={!enLigne}
              onPress={() => void agir('sync', () => syncOnce())}
              testID="file-sync-tout"
              style={styles.bouton}
            />
            {echecs ? (
              <PrimaryButton
                variant="outline"
                icon={AlertTriangle}
                label={t('ecranFileSync.actions.relancerEchecs')}
                loading={occupation === 'echecs'}
                disabled={!enLigne}
                onPress={() => void agir('echecs', () => retryFailed())}
                testID="file-relancer-echecs"
                style={styles.bouton}
              />
            ) : null}
            {resume.synchronisees > 0 ? (
              <Touchable
                onPress={() =>
                  void agir('nettoyer', async () => {
                    await removeSynced();
                  })
                }
                feedback="opacity"
                accessibilityRole="button"
                accessibilityLabel={t('ecranFileSync.actions.nettoyer')}
                testID="file-nettoyer"
                style={styles.nettoyer}
              >
                <Text variant="caption" color="primaire">
                  {t('ecranFileSync.actions.nettoyer')}
                </Text>
              </Touchable>
            ) : null}
            {!enLigne ? (
              <Text variant="caption" color="texteSecondaire" testID="file-hors-ligne">
                {t('ecranFileSync.horsLigne')}
              </Text>
            ) : null}
          </View>

          <FlatList
            data={groupes}
            keyExtractor={(item) => item.entite}
            contentContainerStyle={styles.liste}
            renderItem={({ item }) => {
              const Icone = ICONES_ENTITE[item.entite];
              const ouvert = ouverts.has(item.entite);
              const actionsDuGroupe = actions.filter((action) => action.entityType === item.entite);
              return (
                <Card
                  testID={`file-groupe-${item.entite.toLowerCase()}`}
                  onPress={() => basculer(item.entite)}
                  accessibilityLabel={t('ecranFileSync.groupe.a11y', {
                    entite: t(`commun.entites.${item.entite.toLowerCase()}`),
                    count: item.total,
                  })}
                  accessibilityHint={t('commun.actions.voirTout')}
                >
                  <View style={styles.ligneGroupe}>
                    <View style={[styles.pastille, { backgroundColor: couleurs.primaireConteneur }]}>
                      <Icone size={20} color={couleurs.primaire} strokeWidth={1.8} />
                    </View>
                    <View style={styles.colonneGroupe}>
                      <Text variant="h3" numberOfLines={1}>
                        {t(`commun.entites.${item.entite.toLowerCase()}`)}
                      </Text>
                      <Text variant="caption" color="texteSecondaire">
                        {item.enAttente > 0
                          ? t('ecranFileSync.groupe.enAttente', { count: item.enAttente })
                          : item.echecs > 0
                            ? t('ecranFileSync.groupe.echecs', { count: item.echecs })
                            : item.synchronisees > 0
                              ? t('ecranFileSync.groupe.synchronisees', { count: item.synchronisees })
                              : t('ecranFileSync.groupe.total', { count: item.total })}
                        {item.derniereAction ? ` · ${formatDate(item.derniereAction)}` : ''}
                      </Text>
                    </View>
                    {item.echecs > 0 || item.conflits > 0 ? (
                      <AlertTriangle size={16} color={couleurs.alerte} testID={`file-groupe-${item.entite.toLowerCase()}-alerte`} />
                    ) : item.enAttente > 0 || item.enCours > 0 ? (
                      <RefreshCw size={16} color={couleurs.info} />
                    ) : (
                      <CheckCircle2 size={16} color={couleurs.succes} />
                    )}
                  </View>

                  {ouvert ? (
                    <View style={styles.details}>
                      {actionsDuGroupe.map((action) => (
                        <View
                          key={action.id}
                          style={[styles.ligneAction, { borderColor: couleurs.bordure }]}
                          testID={`file-action-${action.entityType.toLowerCase()}-${action.id}`}
                        >
                          <View style={styles.colonneAction}>
                            <Text variant="label">
                              {t(`commun.action.${action.actionType.toLowerCase()}`)}
                            </Text>
                            <Text variant="caption" color="texteSecondaire" numberOfLines={2}>
                              {formatDate(action.createdAt)}
                              {action.retryCount > 0
                                ? ` · ${t('ecranFileSync.groupe.tentatives', { count: action.retryCount })}`
                                : ''}
                            </Text>
                            {action.lastError ? (
                              <Text variant="caption" color="erreur" numberOfLines={2}>
                                {action.lastError}
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            variant="micro"
                            tabular
                            color={
                              action.status === 'SYNCED'
                                ? 'succes'
                                : action.status === 'FAILED' || action.status === 'INVALID'
                                  ? 'erreur'
                                  : action.status === 'DUPLICATE' || action.status === 'CONFLICT'
                                    ? 'alerte'
                                    : 'info'
                            }
                          >
                            {t(`commun.statutSync.${action.status.toLowerCase()}`)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                </Card>
              );
            }}
          />
        </Screen>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bouton: { flex: 1 },
  colonneAction: { flex: 1, gap: 1, paddingRight: 8 },
  colonneGroupe: { flex: 1, gap: 1 },
  details: { gap: 8, marginTop: 12 },
  entetes: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: 20, paddingBottom: 4 },
  ligneAction: { alignItems: 'center', borderTopWidth: 1, flexDirection: 'row', gap: 8, paddingTop: 8 },
  ligneGroupe: { alignItems: 'center', flexDirection: 'row', gap: 12 },
  liste: { gap: 12, paddingHorizontal: 20, paddingVertical: 8 },
  nettoyer: { alignItems: 'center', justifyContent: 'center', minHeight: 44, paddingHorizontal: 8 },
  pastille: { alignItems: 'center', borderRadius: 12, height: 44, justifyContent: 'center', width: 44 },
  racine: { flex: 1 },
});
