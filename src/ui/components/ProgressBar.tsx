import { View } from 'react-native';

import { useTheme } from '../theme';
import { couleursDeTon, type Ton } from '../tokens';

export interface ProgressBarProps {
  /** Valeur entre 0 et 1. */
  value: number;
  tone?: Ton;
  height?: number;
  accessibilityLabel?: string;
}

export function ProgressBar({ value, tone = 'primaire', height = 8, accessibilityLabel }: ProgressBarProps) {
  const theme = useTheme();
  const borne = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
  const pourcentage = Math.round(borne * 100);

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: pourcentage }}
      style={{
        height,
        borderRadius: theme.rayon.pill,
        backgroundColor: theme.couleurs.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          width: `${pourcentage}%`,
          height: '100%',
          borderRadius: theme.rayon.pill,
          backgroundColor: couleursDeTon(theme.couleurs, tone).accent,
        }}
      />
    </View>
  );
}
