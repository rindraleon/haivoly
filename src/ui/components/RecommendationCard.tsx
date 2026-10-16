import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { couleursDeTon, type Ton } from '../tokens';
import { Badge } from './Badge';
import { Card } from './Card';

export type RecommendationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type RecommendationKind = 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';

const TON_PRIORITE: Record<RecommendationPriority, Ton> = {
  LOW: 'neutre',
  MEDIUM: 'info',
  HIGH: 'alerte',
  URGENT: 'erreur',
};

const ICONE_TYPE: Record<RecommendationKind, LucideIcon> = {
  INFO: Info,
  WARNING: TriangleAlert,
  SUCCESS: CircleCheck,
  ALERT: CircleAlert,
};

export interface RecommendationCardProps {
  title: string;
  message: string;
  priority: RecommendationPriority;
  kind: RecommendationKind;
  unread: boolean;
  priorityLabel: string;
  /** Date déjà formatée (JJ/MM/AAAA). */
  dateLabel: string;
  /** Texte lu par le lecteur d'écran pour « non lue ». */
  unreadLabel: string;
  onPress?: () => void;
  testID?: string;
}

/**
 * Recommandation envoyée par le propriétaire (remplace la WeatherCard : pas
 * de météo dans le périmètre, décision du 14/10).
 */
export function RecommendationCard({
  title,
  message,
  priority,
  kind,
  unread,
  priorityLabel,
  dateLabel,
  unreadLabel,
  onPress,
  testID,
}: RecommendationCardProps) {
  const theme = useTheme();
  const ton = TON_PRIORITE[priority];
  const couleurs = couleursDeTon(theme.couleurs, ton);
  const Icone = ICONE_TYPE[kind];
  const resume = [unread ? unreadLabel : null, priorityLabel, title, message, dateLabel]
    .filter(Boolean)
    .join(', ');

  return (
    <Card onPress={onPress} accessibilityLabel={resume} testID={testID} padding="md">
      <View style={styles.ligne} importantForAccessibility="no-hide-descendants">
        <View style={[styles.icone, { backgroundColor: couleurs.conteneur, borderRadius: theme.rayon.sm }]}>
          <Icone size={18} color={couleurs.surConteneur} strokeWidth={2.2} />
        </View>
        <View style={styles.textes}>
          <View style={styles.titre}>
            <Text variant={unread ? 'bodyStrong' : 'body'} numberOfLines={2} style={styles.flex}>
              {title}
            </Text>
            {unread ? (
              <View style={[styles.point, { backgroundColor: theme.couleurs.primaire }]} />
            ) : null}
          </View>
          <Text variant="bodySmall" color="texteSecondaire" numberOfLines={2}>
            {message}
          </Text>
          <View style={styles.pied}>
            <Badge label={priorityLabel} tone={ton} size="sm" />
            <Text variant="caption" color="texteTertiaire" tabular>
              {dateLabel}
            </Text>
          </View>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', gap: 12 },
  icone: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1, gap: 4 },
  titre: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  flex: { flex: 1 },
  point: { width: 10, height: 10, borderRadius: 5, marginTop: 7 },
  pied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 },
});
