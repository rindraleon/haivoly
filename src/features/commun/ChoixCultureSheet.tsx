import { Sprout } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { statutVisuel } from '@/features/cultures/regles';
import { useCulturesDuCompte } from '@/hooks';
import type { Culture } from '@/types';
import { AlertCard, BottomSheet, CropStatusBadge, Skeleton, Text, Touchable, useTheme } from '@/ui';
import { todayDateOnly } from '@/utils/date';

export interface ChoixCultureSheetProps {
  visible: boolean;
  onFermer: () => void;
  onChoisir: (culture: Culture) => void;
  /** Cultures à exclure (ex. culture déjà rattachée au formulaire). */
  exclure?: readonly string[];
}

/** Cultures proposées : ni supprimées ni récoltées, actives d'abord. */
export function culturesProposees(
  cultures: readonly Culture[],
  exclure: readonly string[] = [],
): Culture[] {
  return cultures
    .filter(
      (culture) =>
        !exclure.includes(culture.id) &&
        culture.statut !== 'SUPPRIMEE' &&
        culture.statut !== 'RECOLTEE',
    )
    .sort(
      (a, b) =>
        Number(b.statut === 'EN_COURS') - Number(a.statut === 'EN_COURS') ||
        a.nom.localeCompare(b.nom),
    );
}

/**
 * Choix d'une culture du compte (lot 4) : une feuille, un tap, et le
 * formulaire ou le filtre repart déjà rattaché. Partagée par les formulaires
 * d'observation, d'intervention et par le suivi unifié.
 */
export function ChoixCultureSheet({ visible, onFermer, onChoisir, exclure }: ChoixCultureSheetProps) {
  const { t } = useTranslation();
  const theme = useTheme();
  const requete = useCulturesDuCompte();
  const cultures = culturesProposees(requete.data?.items ?? [], exclure);

  return (
    <BottomSheet
      visible={visible}
      onClose={onFermer}
      closeLabel={t('commun.actions.fermer')}
      title={t('choixCulture.titre')}
    >
      {requete.isLoading ? (
        <View style={styles.charge}>
          <Skeleton height={52} radius={16} />
          <Skeleton height={52} radius={16} />
          <Skeleton height={52} radius={16} />
        </View>
      ) : requete.isError ? (
        <AlertCard tone="error" title={t('choixCulture.erreur')} />
      ) : cultures.length === 0 ? (
        <View style={styles.vide}>
          <Sprout size={28} color={theme.couleurs.texteSecondaire} />
          <Text variant="body" style={styles.videTexte}>
            {t('choixCulture.vide')}
          </Text>
        </View>
      ) : (
        cultures.map((culture) => (
          <Touchable
            key={culture.id}
            testID={`choix-culture-${culture.id}`}
            accessibilityLabel={`${culture.nom}, ${culture.variete ?? ''}`}
            onPress={() => {
              onFermer();
              onChoisir(culture);
            }}
            style={styles.ligneCulture}
          >
            <View style={styles.colonne}>
              <Text variant="h3">{culture.nom}</Text>
              <Text variant="caption">{culture.variete ?? t('choixCulture.sansVariete')}</Text>
            </View>
            <CropStatusBadge status={statutVisuel(culture, todayDateOnly())} />
          </Touchable>
        ))
      )}
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  charge: { gap: 10, paddingVertical: 8 },
  vide: { alignItems: 'center', gap: 8, paddingVertical: 24 },
  videTexte: { textAlign: 'center' },
  ligneCulture: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 12,
  },
  colonne: { flex: 1, gap: 2 },
});
