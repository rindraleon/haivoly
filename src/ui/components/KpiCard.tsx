import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { couleursDeTon, type Ton } from '../tokens';
import { Card } from './Card';
import { Skeleton } from './Skeleton';

export interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  tone?: Ton;
  /** Indication secondaire (ex. « 3,4 ha », « à synchroniser »). */
  hint?: string;
  loading?: boolean;
  onPress?: () => void;
  accessibilityHint?: string;
  /** Lot 7 : annoncer les changements de valeur aux lecteurs d'écran. */
  liveRegion?: 'polite' | 'assertive' | 'none';
  testID?: string;
}

/** Indicateur clé : valeur en gras à chiffres tabulaires, icône teintée. */
export function KpiCard({
  label,
  value,
  unit,
  icon: Icone,
  tone = 'primaire',
  hint,
  loading = false,
  onPress,
  accessibilityHint,
  liveRegion,
  testID,
}: KpiCardProps) {
  const theme = useTheme();
  const couleurs = couleursDeTon(theme.couleurs, tone);
  const resume = [label, loading ? '…' : `${value}${unit ? ` ${unit}` : ''}`, hint]
    .filter(Boolean)
    .join(', ');

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={resume}
      accessibilityHint={accessibilityHint}
      testID={testID}
      padding="md"
      style={styles.carte}
    >
      <View
        style={[styles.icone, { backgroundColor: couleurs.conteneur, borderRadius: theme.rayon.sm }]}
        importantForAccessibility="no-hide-descendants"
      >
        <Icone size={18} color={couleurs.surConteneur} strokeWidth={2.2} />
      </View>

      {loading ? (
        <View style={styles.squelettes}>
          <Skeleton width={56} height={26} />
          <Skeleton width={84} height={12} />
        </View>
      ) : (
        <View importantForAccessibility="no-hide-descendants">
          <View style={styles.valeur}>
            <Text variant="kpi" numberOfLines={1} adjustsFontSizeToFit accessibilityLiveRegion={liveRegion}>
              {value}
            </Text>
            {unit ? (
              <Text variant="label" color="texteSecondaire">
                {unit}
              </Text>
            ) : null}
          </View>
          <Text variant="caption" color="texteSecondaire" numberOfLines={2}>
            {label}
          </Text>
          {hint ? (
            <Text variant="micro" color="texteTertiaire" numberOfLines={1}>
              {hint}
            </Text>
          ) : null}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  carte: { flex: 1, minWidth: 140, gap: 10 },
  icone: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  valeur: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  squelettes: { gap: 6 },
});
