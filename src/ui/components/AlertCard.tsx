import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  WifiOff,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { couleursDeTon, type Ton } from '../tokens';
import { PrimaryButton } from './PrimaryButton';

export type AlertTone = 'info' | 'success' | 'warning' | 'error' | 'offline';

const CONFIG: Record<AlertTone, { ton: Ton; icone: LucideIcon }> = {
  info: { ton: 'info', icone: Info },
  success: { ton: 'succes', icone: CircleCheck },
  warning: { ton: 'alerte', icone: TriangleAlert },
  error: { ton: 'erreur', icone: CircleAlert },
  offline: { ton: 'neutre', icone: WifiOff },
};

export interface AlertCardProps {
  tone?: AlertTone;
  title: string;
  message?: string;
  icon?: LucideIcon;
  actionLabel?: string;
  onAction?: () => void;
  actionLoading?: boolean;
  testID?: string;
}

/** Bandeau d'information ou d'alerte, annoncé aux lecteurs d'écran. */
export function AlertCard({
  tone = 'info',
  title,
  message,
  icon,
  actionLabel,
  onAction,
  actionLoading,
  testID,
}: AlertCardProps) {
  const theme = useTheme();
  const config = CONFIG[tone];
  const couleurs = couleursDeTon(theme.couleurs, config.ton);
  const Icone = icon ?? config.icone;
  const urgent = tone === 'error' || tone === 'warning';

  return (
    <View
      testID={testID}
      accessibilityRole={urgent ? 'alert' : 'summary'}
      accessibilityLiveRegion={urgent ? 'assertive' : 'polite'}
      style={[styles.carte, { backgroundColor: couleurs.conteneur, borderRadius: theme.rayon.lg }]}
    >
      <View style={styles.ligne}>
        <Icone size={20} color={couleurs.surConteneur} strokeWidth={2.2} />
        <View style={styles.textes}>
          <Text variant="label" style={{ color: couleurs.surConteneur }}>
            {title}
          </Text>
          {message ? (
            <Text variant="bodySmall" style={{ color: couleurs.surConteneur }}>
              {message}
            </Text>
          ) : null}
        </View>
      </View>
      {actionLabel && onAction ? (
        <PrimaryButton
          label={actionLabel}
          onPress={onAction}
          loading={actionLoading}
          variant="outline"
          size="sm"
          style={styles.action}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  carte: { padding: 14, gap: 10 },
  ligne: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  textes: { flex: 1, gap: 2 },
  action: { alignSelf: 'flex-end' },
});
