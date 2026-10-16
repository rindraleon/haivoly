import { CircleAlert, CloudOff, RefreshCw, TriangleAlert, type LucideIcon } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useSyncContext } from '@/providers/AppProviders';
import { Text, Touchable, couleursDeTon, useTheme, type Ton } from '@/ui';

import type { EtatBanniere } from './etatSynchro';

const ICONES: Partial<Record<Ton, LucideIcon>> = {
  alerte: TriangleAlert,
  neutre: CloudOff,
  erreur: CircleAlert,
  info: RefreshCw,
};

/**
 * Bannière de synchronisation V2 (mêmes états et textes que la V1), placée
 * au-dessus de la pile : elle porte elle-même la zone sûre du haut.
 */
export function BanniereSynchro({ etat, margeHaut }: { etat: EtatBanniere; margeHaut: number }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { retry } = useSyncContext();
  const couleurs = couleursDeTon(theme.couleurs, etat.ton);
  const Icone = ICONES[etat.ton] ?? RefreshCw;
  const texte = etat.messages.map((m) => t(m.cle, m.count === undefined ? undefined : { count: m.count })).join(' ');

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={etat.ton === 'erreur' || etat.ton === 'alerte' ? 'alert' : 'summary'}
      style={[styles.bandeau, { backgroundColor: couleurs.conteneur, paddingTop: margeHaut + 8 }]}
    >
      {etat.enCours ? (
        <ActivityIndicator size="small" color={couleurs.surConteneur} />
      ) : (
        <Icone size={16} color={couleurs.surConteneur} strokeWidth={2.2} />
      )}
      <Text variant="caption" style={[styles.texte, { color: couleurs.surConteneur }]}>
        {texte}
      </Text>
      {etat.reessayer ? (
        <Touchable
          onPress={() => void retry()}
          feedback="opacity"
          accessibilityRole="button"
          accessibilityLabel={t('synchronisation.reessayer')}
          style={[styles.action, { borderColor: couleurs.surConteneur, borderRadius: theme.rayon.pill }]}
        >
          <RefreshCw size={14} color={couleurs.surConteneur} />
          <Text variant="label" style={{ color: couleurs.surConteneur }}>
            {t('synchronisation.reessayer')}
          </Text>
        </Touchable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bandeau: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingBottom: 8 },
  texte: { flex: 1 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, paddingHorizontal: 10, minHeight: 36 },
});
