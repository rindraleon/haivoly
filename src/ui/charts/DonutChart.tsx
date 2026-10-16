import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { calculerArcs } from './arcs';

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export interface DonutChartProps {
  segments: readonly DonutSegment[];
  size?: number;
  thickness?: number;
  centerValue?: string;
  centerLabel?: string;
  /** Résumé lu par le lecteur d'écran (le graphique seul n'est pas lisible). */
  accessibilityLabel: string;
}

/** Anneau de répartition, avec légende textuelle (pas d'information par la couleur seule). */
export function DonutChart({
  segments,
  size = 132,
  thickness = 18,
  centerValue,
  centerLabel,
  accessibilityLabel,
}: DonutChartProps) {
  const theme = useTheme();
  const rayon = (size - thickness) / 2;
  const circonference = 2 * Math.PI * rayon;
  const arcs = calculerArcs(segments, circonference);

  return (
    <View style={styles.ligne} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <G rotation={-90} origin={`${size / 2}, ${size / 2}`}>
            <Circle
              cx={size / 2}
              cy={size / 2}
              r={rayon}
              stroke={theme.couleurs.surfaceAlt}
              strokeWidth={thickness}
              fill="none"
            />
            {arcs.map((arc) => (
              <Circle
                key={arc.segment.label}
                cx={size / 2}
                cy={size / 2}
                r={rayon}
                stroke={arc.segment.color}
                strokeWidth={thickness}
                strokeDasharray={`${arc.longueur} ${circonference}`}
                strokeDashoffset={arc.decalage}
                strokeLinecap="butt"
                fill="none"
              />
            ))}
          </G>
        </Svg>
        {centerValue ? (
          <View style={[StyleSheet.absoluteFill, styles.centre]}>
            <Text variant="h2" tabular>
              {centerValue}
            </Text>
            {centerLabel ? (
              <Text variant="caption" color="texteSecondaire">
                {centerLabel}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.legende}>
        {segments.map((s) => (
          <View key={s.label} style={styles.entree}>
            <View style={[styles.pastille, { backgroundColor: s.color }]} />
            <Text variant="bodySmall" numberOfLines={1} style={styles.flex}>
              {s.label}
            </Text>
            <Text variant="label" tabular>
              {s.value}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  centre: { alignItems: 'center', justifyContent: 'center' },
  legende: { flex: 1, gap: 10 },
  entree: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pastille: { width: 10, height: 10, borderRadius: 3 },
  flex: { flex: 1 },
});
