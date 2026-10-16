import { router } from 'expo-router';
import { ChevronRight, MapPinned, Plus } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { tonStatutParcelle } from '@/features/parcelles/regles';
import { useParcelles } from '@/hooks';
import type { Parcelle } from '@/types';
import { AlertCard, Badge, BottomSheet, PrimaryButton, Skeleton, Text, Touchable, useTheme } from '@/ui';
import { formatSuperficieValue } from '@/utils/parcelle';

export interface ChoixParcelleSheetProps {
  visible: boolean;
  onFermer: () => void;
}

/** Parcelles proposées : toutes sauf supprimées (refus serveur), actives d'abord. */
function parcellesProposees(parcelles: readonly Parcelle[]): Parcelle[] {
  return parcelles
    .filter((parcelle) => parcelle.statut !== 'SUPPRIMEE')
    .sort((a, b) => Number(b.statut === 'ACTIVE') - Number(a.statut === 'ACTIVE') || a.nom.localeCompare(b.nom));
}

/**
 * Choix de la parcelle avant l'ajout d'une culture (F-26, `ModalChoixParcelle`
 * V1) : une feuille, un tap sur la parcelle, et le formulaire d'ajout s'ouvre
 * déjà rattaché (« Nouvelle culture » en 2 taps).
 */
export function ChoixParcelleSheet({ visible, onFermer }: ChoixParcelleSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const requete = useParcelles({ limit: 200 });
  const parcelles = parcellesProposees(requete.data?.items ?? []);

  const choisir = (parcelle: Parcelle) => {
    onFermer();
    router.push({ pathname: '/ajout-culture', params: { parcelleId: parcelle.id, parcelleNom: parcelle.nom } });
  };

  const creerParcelle = () => {
    onFermer();
    router.push('/ajout-parcelle');
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onFermer}
      closeLabel={t('commun.actions.fermer')}
      title={t('ecranCultures.choixParcelle.titre')}
      testID="cultures-choix-parcelle"
    >
      <Text variant="bodySmall" color="texteSecondaire">
        {t('ecranCultures.choixParcelle.message')}
      </Text>
      {requete.isLoading ? (
        <View style={styles.liste}>
          <Skeleton height={56} radius={theme.rayon.md} />
          <Skeleton height={56} radius={theme.rayon.md} />
        </View>
      ) : requete.isError ? (
        <AlertCard
          tone="error"
          title={t('ecranCultures.choixParcelle.erreur')}
          actionLabel={t('commun.actions.reessayer')}
          onAction={() => requete.refetch()}
          actionLoading={requete.isFetching}
        />
      ) : parcelles.length === 0 ? (
        <View style={styles.liste}>
          <Text variant="body">{t('ecranCultures.choixParcelle.aucune')}</Text>
          <PrimaryButton label={t('ecranCultures.choixParcelle.creerParcelle')} icon={Plus} onPress={creerParcelle} />
        </View>
      ) : (
        <ScrollView style={styles.defilement} contentContainerStyle={styles.liste} keyboardShouldPersistTaps="handled">
          {parcelles.map((parcelle) => (
            <Touchable
              key={parcelle.id}
              onPress={() => choisir(parcelle)}
              feedback="opacity"
              accessibilityRole="button"
              accessibilityLabel={[parcelle.nom, formatSuperficieValue(parcelle.superficie), parcelle.statut === 'ACTIVE' ? null : t(`statuts.${parcelle.statut}`)]
                .filter(Boolean)
                .join(', ')}
              testID={`cultures-choix-parcelle-${parcelle.id}`}
              style={[styles.ligne, { borderColor: theme.couleurs.bordure, borderRadius: theme.rayon.md }]}
            >
              <View style={[styles.icone, { backgroundColor: theme.couleurs.primaireConteneur, borderRadius: theme.rayon.sm }]}>
                <MapPinned size={18} color={theme.couleurs.surPrimaireConteneur} />
              </View>
              <View style={styles.textes}>
                <Text variant="bodyStrong" numberOfLines={1}>
                  {parcelle.nom}
                </Text>
                <Text variant="caption" color="texteSecondaire" numberOfLines={1}>
                  {[formatSuperficieValue(parcelle.superficie), parcelle.typeSol].filter(Boolean).join(' · ') || '—'}
                </Text>
              </View>
              {parcelle.statut === 'ACTIVE' ? null : (
                <Badge label={t(`statuts.${parcelle.statut}`)} tone={tonStatutParcelle(parcelle.statut)} size="sm" />
              )}
              <ChevronRight size={18} color={theme.couleurs.texteTertiaire} />
            </Touchable>
          ))}
        </ScrollView>
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  defilement: { maxHeight: 380 },
  liste: { gap: 8 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, padding: 10, minHeight: 56 },
  icone: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1, gap: 2 },
});
