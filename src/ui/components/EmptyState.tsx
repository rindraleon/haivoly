import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Ellipse, Path, Rect } from 'react-native-svg';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { PrimaryButton } from './PrimaryButton';

export interface EmptyStateProps {
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  testID?: string;
}

/** Illustration légère (SVG) : champ en sillons et jeune pousse. */
function IllustrationChamp() {
  const { couleurs } = useTheme();
  return (
    <Svg width={140} height={96} viewBox="0 0 140 96" accessibilityElementsHidden>
      <Ellipse cx={70} cy={84} rx={62} ry={10} fill={couleurs.surfaceAlt} />
      <Rect x={18} y={56} width={104} height={24} rx={12} fill={couleurs.primaireConteneur} />
      <Path d="M28 68 H112" stroke={couleurs.secondaire} strokeWidth={2} strokeLinecap="round" strokeDasharray="6 8" />
      <Path d="M70 58 C70 44 70 36 70 30" stroke={couleurs.primaire} strokeWidth={3} strokeLinecap="round" />
      <Path d="M70 42 C60 42 54 36 52 28 C62 28 68 33 70 42 Z" fill={couleurs.secondaire} />
      <Path d="M70 36 C80 36 87 30 89 21 C78 21 72 27 70 36 Z" fill={couleurs.cta} />
      <Circle cx={112} cy={22} r={9} fill={couleurs.alerteConteneur} />
    </Svg>
  );
}

export function EmptyState({ title, message, actionLabel, onAction, testID }: EmptyStateProps) {
  return (
    <View style={styles.conteneur} testID={testID}>
      <IllustrationChamp />
      <View style={styles.textes}>
        <Text variant="h3" align="center">
          {title}
        </Text>
        {message ? (
          <Text variant="bodySmall" color="texteSecondaire" align="center">
            {message}
          </Text>
        ) : null}
      </View>
      {actionLabel && onAction ? (
        <PrimaryButton label={actionLabel} onPress={onAction} variant="secondary" size="md" style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  conteneur: { alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 8 },
  textes: { gap: 4, alignItems: 'center' },
  action: { alignSelf: 'center' },
});
