import { router } from 'expo-router';
import { Bell, Check, ListChecks, ChevronRight, Languages, LogOut, MoonStar, RefreshCw, UserRoundPen, type LucideIcon } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CHOIX_SYSTEME,
  LANGUES_DISPONIBLES,
  definirLangue,
  lireChoixLangue,
  type ChoixLangue,
} from '@/i18n';
import { queryClient } from '@/providers/AppProviders';
import { getSyncState, onSyncState, syncOnce, type SyncState } from '@/services/offline/syncEngine';
import { removeToken } from '@/storage/authStorage';
import { CHOIX_THEME, type ChoixTheme } from '@/theme/preference';
import {
  Avatar,
  Badge,
  Card,
  ConfirmSheet,
  PrimaryButton,
  SectionHeader,
  Skeleton,
  Text,
  Touchable,
  BottomSheet,
  useTheme,
} from '@/ui';
import { Screen } from '@/ui/layout';
import {
  useNetworkStatus,
  useProfile,
  useRecommendationsFeed,
  useTheme as useThemePreferences,
} from '@/hooks';
import { formatDate } from '@/utils/date';

function LigneMenu({
  icone: Icone,
  label,
  valeur,
  onPress,
  badge = 0,
  tonErreur = false,
  testID,
}: {
  icone: LucideIcon;
  label: string;
  valeur?: string;
  onPress: () => void;
  badge?: number;
  tonErreur?: boolean;
  testID: string;
}) {
  const theme = useTheme();
  const { couleurs } = theme;
  return (
    <Touchable
      testID={testID}
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityLabel={valeur ? `${label}, ${valeur}` : label}
      style={styles.ligne}
    >
      <Icone size={18} color={tonErreur ? couleurs.erreur : couleurs.texteSecondaire} />
      <Text variant="body" style={styles.ligneLabel} color={tonErreur ? 'erreur' : 'texte'}>
        {label}
      </Text>
      {badge > 0 ? <Badge label={String(badge)} tone="erreur" size="sm" /> : null}
      {valeur ? (
        <Text variant="caption" color="texteSecondaire" style={styles.ligneValeur} numberOfLines={1}>
          {valeur}
        </Text>
      ) : null}
      <ChevronRight size={16} color={couleurs.texteTertiaire} />
    </Touchable>
  );
}

function OptionFeuille({
  label,
  actif,
  onPress,
  testID,
}: {
  label: string;
  actif: boolean;
  onPress: () => void;
  testID: string;
}) {
  const { couleurs } = useTheme();
  return (
    <Touchable
      testID={testID}
      onPress={onPress}
      feedback="opacity"
      accessibilityRole="button"
      accessibilityState={{ selected: actif }}
      accessibilityLabel={label}
      style={[styles.option, actif ? { backgroundColor: couleurs.primaireConteneur } : null]}
    >
      <Text variant="body" color={actif ? 'surPrimaireConteneur' : 'texte'} style={styles.flex}>
        {label}
      </Text>
      {actif ? <Check size={18} color={couleurs.primaire} /> : null}
    </Touchable>
  );
}

/**
 * Profil & paramètres V2 (lot 5) : carte d'identité du compte, raccourcis
 * compte (modification, notifications), préférences langue et thème en
 * feuilles ancrées, état de synchronisation hors ligne avec envoi manuel,
 * déconnexion confirmée par feuille — toutes les fonctions V1 conservées.
 */
export function ProfilParametresScreen() {
  const { t } = useTranslation();
  const theme = useTheme();
  const { couleurs } = theme;
  const insets = useSafeAreaInsets();
  const { data: profil, isLoading, isError, refetch } = useProfile();
  const { unreadCount } = useRecommendationsFeed();
  const enLigne = useNetworkStatus();
  const { choix: choixTheme, definirTheme } = useThemePreferences();

  const [choixLangue, setChoixLangue] = useState<ChoixLangue>(CHOIX_SYSTEME);
  const [feuilleLangue, setFeuilleLangue] = useState(false);
  const [feuilleTheme, setFeuilleTheme] = useState(false);
  const [confirmDeconnexion, setConfirmDeconnexion] = useState(false);
  const [sync, setSync] = useState<SyncState>(() => getSyncState());
  const [syncEnCours, setSyncEnCours] = useState(false);

  useEffect(() => {
    let actif = true;
    void lireChoixLangue().then((valeur) => {
      if (actif) setChoixLangue(valeur);
    });
    return () => {
      actif = false;
    };
  }, []);

  useEffect(() => onSyncState((etat) => setSync(etat)), []);

  const nomComplet = useMemo(
    () => [profil?.prenom, profil?.nom].filter(Boolean).join(' ').trim() || t('ecranProfil.utilisateur'),
    [profil, t],
  );

  const libelleLangue = (choix: ChoixLangue): string =>
    choix === CHOIX_SYSTEME
      ? t('ecranProfil.langue.systeme')
      : t(`ecranProfil.langue.${choix}`);

  const libelleTheme = (choix: ChoixTheme): string => t(`ecranProfil.theme.${choix}`);

  const changerLangue = async (choix: ChoixLangue) => {
    setChoixLangue(choix);
    setFeuilleLangue(false);
    // comme en V1 : préférence locale d'interface (la langue du compte,
    // utilisée pour les e-mails, se gère côté serveur).
    await definirLangue(choix);
  };

  const lancerSync = async () => {
    if (syncEnCours || !enLigne) return;
    setSyncEnCours(true);
    try {
      await syncOnce();
    } catch {
      // l'état de synchronisation affiche déjà les échecs
    } finally {
      setSyncEnCours(false);
      setSync(getSyncState());
    }
  };

  const deconnexion = async () => {
    await removeToken();
    queryClient.clear();
    void import('@/services/offline/syncEngine')
      .then((engine) => engine.refreshCounters())
      .catch(() => {});
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <Screen testID="ecran-profil-v2" gap={14}>
        <Skeleton height={96} radius={20} />
        <Skeleton height={120} radius={16} />
        <Skeleton height={120} radius={16} />
      </Screen>
    );
  }

  if (isError || !profil) {
    return (
      <Screen testID="ecran-profil-v2" refreshing={false} onRefresh={() => void refetch()}>
        <Card variant="tonal">
          <Text variant="body" color="erreur">
            {t('ecranProfil.erreurChargement')}
          </Text>
          <PrimaryButton
            variant="outline"
            label={t('ecranProfil.reessayer')}
            onPress={() => void refetch()}
            testID="profil-reessayer"
          />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen testID="ecran-profil-v2" gap={18} contentStyle={{ paddingBottom: 140 + insets.bottom }}>
      <Card variant="elevated" testID="profil-carte">
        <View style={styles.carte}>
          <Avatar nom={nomComplet} size={56} accessibilityLabel={nomComplet} />
          <View style={styles.flex}>
            <Text variant="h2" style={styles.nomCompte}>
              {nomComplet}
            </Text>
            {profil.username ? (
              <Text variant="caption" color="texteSecondaire">
                @{profil.username}
              </Text>
            ) : null}
            <View style={styles.badges}>
              <Badge
                label={t(profil.role === 'PROPRIETAIRE' ? 'ecranProfil.roleProprietaire' : 'ecranProfil.roleAgriculteur')}
                tone="primaire"
                size="sm"
              />
              {profil.estVerifie ? <Badge label={t('ecranProfil.compteVerifie')} tone="succes" size="sm" /> : null}
            </View>
          </View>
        </View>
        <Text variant="caption" color="texteSecondaire">
          {profil.email}
        </Text>
        {profil.telephone ? (
          <Text variant="caption" color="texteSecondaire" testID="profil-telephone-carte">
            {profil.telephone}
          </Text>
        ) : null}
        {profil.creeA ? (
          <Text variant="caption" color="texteTertiaire">
            {t('ecranProfil.membreDepuis', { date: formatDate(profil.creeA) })}
          </Text>
        ) : null}
      </Card>

      <View style={styles.bloc}>
        <SectionHeader title={t('ecranProfil.sections.compte')} />
        <Card variant="outlined" padding="sm">
          <LigneMenu
            icone={UserRoundPen}
            label={t('ecranProfil.modifierProfil')}
            onPress={() => router.push('/modifier-profil')}
            testID="profil-modifier"
          />
          <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />
          <LigneMenu
            icone={Bell}
            label={t('ecranProfil.notifications')}
            badge={unreadCount}
            onPress={() => router.push('/notifications')}
            testID="profil-notifications"
          />
        </Card>
      </View>

      <View style={styles.bloc}>
        <SectionHeader title={t('ecranProfil.sections.preferences')} />
        <Card variant="outlined" padding="sm">
          <LigneMenu
            icone={Languages}
            label={t('ecranProfil.langue.titre')}
            valeur={libelleLangue(choixLangue)}
            onPress={() => setFeuilleLangue(true)}
            testID="profil-langue"
          />
          <View style={[styles.separateur, { backgroundColor: couleurs.bordure }]} />
          <LigneMenu
            icone={MoonStar}
            label={t('ecranProfil.theme.titre')}
            valeur={libelleTheme(choixTheme)}
            onPress={() => setFeuilleTheme(true)}
            testID="profil-theme"
          />
        </Card>
      </View>

      <View style={styles.bloc}>
        <SectionHeader title={t('ecranProfil.sections.synchronisation')} />
        <Card variant="outlined">
          <Text variant="caption" color="texteSecondaire" testID="profil-sync-etat">
            {sync.isSyncing
              ? t('ecranProfil.sync.enCours')
              : sync.pendingCount > 0
                ? t('ecranProfil.sync.enAttente', { count: sync.pendingCount })
                : t('ecranProfil.sync.aJour')}
          </Text>
          {sync.failedCount > 0 ? (
            <Text variant="caption" color="erreur">
              {t('ecranProfil.sync.echecs', { count: sync.failedCount })}
            </Text>
          ) : null}
          {!enLigne ? (
            <Text variant="caption" color="texteTertiaire">
              {t('ecranProfil.sync.horsLigne')}
            </Text>
          ) : null}
          <PrimaryButton
            variant="outline"
            icon={RefreshCw}
            label={t('ecranProfil.sync.lancer')}
            loading={syncEnCours}
            disabled={!enLigne}
            onPress={() => void lancerSync()}
            testID="profil-sync"
          />
          <Touchable
            onPress={() => router.push('/file-synchronisation')}
            feedback="opacity"
            accessibilityRole="button"
            accessibilityLabel={t('ecranProfil.sync.voirFile')}
            testID="profil-file-sync"
            style={styles.ligneFile}
          >
            <ListChecks size={18} color={couleurs.primaire} strokeWidth={1.8} />
            <Text variant="label" color="primaire">
              {t('ecranProfil.sync.voirFile')}
            </Text>
            <ChevronRight size={16} color={couleurs.texteTertiaire} />
          </Touchable>
        </Card>
      </View>

      <View style={styles.bloc}>
        <SectionHeader title={t('ecranProfil.sections.session')} />
        <Card variant="outlined" padding="sm">
          <LigneMenu
            icone={LogOut}
            label={t('ecranProfil.deconnexion')}
            onPress={() => setConfirmDeconnexion(true)}
            tonErreur
            testID="profil-deconnexion"
          />
        </Card>
      </View>
      <Text variant="caption" color="texteTertiaire" align="center">
        {t('ecranProfil.version', { version: '2.5.0' })}
      </Text>

      <BottomSheet
        visible={feuilleLangue}
        onClose={() => setFeuilleLangue(false)}
        closeLabel={t('commun.actions.fermer')}
        title={t('ecranProfil.langue.titre')}
        testID="feuille-langue"
      >
        <View style={styles.feuille}>
          <OptionFeuille
            label={libelleLangue(CHOIX_SYSTEME)}
            actif={choixLangue === CHOIX_SYSTEME}
            onPress={() => void changerLangue(CHOIX_SYSTEME)}
            testID="feuille-langue-systeme"
          />
          {LANGUES_DISPONIBLES.map((code) => (
            <OptionFeuille
              key={code}
              label={libelleLangue(code)}
              actif={choixLangue === code}
              onPress={() => void changerLangue(code)}
              testID={`feuille-langue-${code}`}
            />
          ))}
        </View>
      </BottomSheet>

      <BottomSheet
        visible={feuilleTheme}
        onClose={() => setFeuilleTheme(false)}
        closeLabel={t('commun.actions.fermer')}
        title={t('ecranProfil.theme.titre')}
        testID="feuille-theme"
      >
        <View style={styles.feuille}>
          {CHOIX_THEME.map((choix) => (
            <OptionFeuille
              key={choix}
              label={libelleTheme(choix)}
              actif={choixTheme === choix}
              onPress={() => {
                definirTheme(choix);
                setFeuilleTheme(false);
              }}
              testID={`feuille-theme-${choix}`}
            />
          ))}
        </View>
      </BottomSheet>

      <ConfirmSheet
        visible={confirmDeconnexion}
        title={t('ecranProfil.deconnexionTitre')}
        message={t('ecranProfil.deconnexionQuestion')}
        confirmLabel={t('ecranProfil.deconnexionConfirmer')}
        cancelLabel={t('commun.actions.annuler')}
        closeLabel={t('commun.actions.fermer')}
        tone="danger"
        onConfirm={() => void deconnexion()}
        onCancel={() => setConfirmDeconnexion(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  ligneFile: { alignItems: 'center', flexDirection: 'row', gap: 8, minHeight: 44, marginTop: 4 },
  flex: { flex: 1 },
  bloc: { gap: 8 },
  carte: { flexDirection: 'row', gap: 14, alignItems: 'center' },
  nomCompte: { marginBottom: 2 },
  badges: { flexDirection: 'row', gap: 6, marginTop: 6 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 4 },
  ligneLabel: { flex: 1 },
  ligneValeur: { maxWidth: 120 },
  separateur: { height: 1, marginHorizontal: 4 },
  feuille: { gap: 6, paddingBottom: 8 },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
});
