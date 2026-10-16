import { useEffect } from 'react';
import type { DimensionValue } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '../theme';

export interface SkeletonProps {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}

/** Bloc de chargement pulsé ; statique si l'utilisateur réduit les animations. */
export function Skeleton({ width = '100%', height = 14, radius }: SkeletonProps) {
  const theme = useTheme();
  const reduire = useReducedMotion();
  const opacite = useSharedValue(1);

  useEffect(() => {
    if (reduire) return;
    opacite.value = withRepeat(withTiming(0.45, { duration: 750 }), -1, true);
    return () => cancelAnimation(opacite);
  }, [opacite, reduire]);

  const style = useAnimatedStyle(() => ({ opacity: opacite.value }));

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        {
          width,
          height,
          borderRadius: radius ?? theme.rayon.xs,
          backgroundColor: theme.couleurs.squelette,
        },
        style,
      ]}
    />
  );
}
