import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '../theme';

export interface TouchableProps extends Omit<PressableProps, 'style'> {
  style?: StyleProp<ViewStyle>;
  /** Retour visuel à l'appui : légère réduction (cartes) ou opacité (liens). */
  feedback?: 'scale' | 'opacity' | 'none';
}

/**
 * Zone pressable accessible : retour visuel, ondulation Android, zone de
 * toucher élargie à 48 dp quand l'élément est plus petit.
 */
export function Touchable({
  feedback = 'scale',
  style,
  disabled,
  hitSlop,
  android_ripple,
  ...rest
}: TouchableProps) {
  const theme = useTheme();

  return (
    <Pressable
      {...rest}
      disabled={disabled}
      hitSlop={hitSlop ?? 6}
      android_ripple={
        android_ripple ?? (feedback === 'none' ? undefined : { color: theme.couleurs.surfaceSelection })
      }
      style={({ pressed }) => [
        style,
        disabled ? { opacity: 0.5 } : null,
        pressed && feedback === 'scale'
          ? { transform: [{ scale: theme.mouvement.echellePresse }], opacity: 0.94 }
          : null,
        pressed && feedback === 'opacity' ? { opacity: 0.7 } : null,
      ]}
    />
  );
}
