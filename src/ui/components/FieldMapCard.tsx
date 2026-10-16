import { ChevronRight, MapPinOff, type LucideIcon } from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';
import Svg, { Line, Polygon } from 'react-native-svg';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import { couleursDeTon, type Ton } from '../tokens';
import { Badge } from './Badge';
import { Card } from './Card';
import { projeterPolygone, type PointGeo } from './geometrie';

const LARGEUR = 88;
const HAUTEUR = 72;

export interface FieldMapCardBadge {
  label: string;
  tone: Ton;
  icon?: LucideIcon;
}

export interface FieldMapCardProps {
  nom: string;
  /** Sommets de la délimitation : la vignette est dessinée hors ligne, sans carte. */
  points: readonly PointGeo[];
  /** Ex. « 1,20 ha · Argileux · 2 cultures ». */
  meta?: string;
  /** Description libre de la parcelle (2 lignes max, parité avec la carte V1). */
  description?: string | null;
  /** Ligne discrète (ex. « Modifiée le 12/10/2026 »). */
  caption?: string;
  tone?: Ton;
  badges?: FieldMapCardBadge[];
  /** Libellé affiché dans la vignette quand la parcelle n'est pas délimitée. */
  labelSansGeometrie: string;
  onPress?: () => void;
  accessibilityHint?: string;
  testID?: string;
}

export function FieldMapCard({
  nom,
  points,
  meta,
  description,
  caption,
  tone = 'primaire',
  badges = [],
  labelSansGeometrie,
  onPress,
  accessibilityHint,
  testID,
}: FieldMapCardProps) {
  const theme = useTheme();
  const couleurs = couleursDeTon(theme.couleurs, tone);
  const contour = projeterPolygone(points, LARGEUR, HAUTEUR, 8);
  const resume = [nom, meta, description, ...badges.map((b) => b.label), contour ? null : labelSansGeometrie, caption]
    .filter(Boolean)
    .join(', ');

  return (
    <Card onPress={onPress} accessibilityLabel={resume} accessibilityHint={accessibilityHint} testID={testID} padding="md">
      <View style={styles.ligne}>
        <View
          style={[styles.vignette, { backgroundColor: theme.couleurs.surfaceAlt, borderRadius: theme.rayon.md }]}
          importantForAccessibility="no-hide-descendants"
        >
          {contour ? (
            <Svg width={LARGEUR} height={HAUTEUR}>
              {[18, 36, 54].map((y) => (
                <Line key={y} x1={0} y1={y} x2={LARGEUR} y2={y} stroke={theme.couleurs.bordure} strokeWidth={1} />
              ))}
              <Polygon
                points={contour}
                fill={couleurs.conteneur}
                stroke={couleurs.accent}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            </Svg>
          ) : (
            <View style={styles.sansGeometrie}>
              <MapPinOff size={20} color={theme.couleurs.texteSecondaire} />
              <Text variant="micro" color="texteSecondaire" align="center" numberOfLines={2}>
                {labelSansGeometrie}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.textes} importantForAccessibility="no-hide-descendants">
          {/* Deux lignes : les toponymes malgaches sont souvent longs. */}
          <Text variant="bodyStrong" numberOfLines={2}>
            {nom}
          </Text>
          {meta ? (
            <Text variant="bodySmall" color="texteSecondaire" numberOfLines={1}>
              {meta}
            </Text>
          ) : null}
          {description ? (
            <Text variant="bodySmall" color="texteSecondaire" numberOfLines={2}>
              {description}
            </Text>
          ) : null}
          {caption ? (
            <Text variant="caption" color="texteTertiaire" numberOfLines={1}>
              {caption}
            </Text>
          ) : null}
          {badges.length > 0 ? (
            <View style={styles.badges}>
              {badges.map((badge) => (
                <Badge key={badge.label} label={badge.label} tone={badge.tone} icon={badge.icon} size="sm" />
              ))}
            </View>
          ) : null}
        </View>

        {onPress ? <ChevronRight size={18} color={theme.couleurs.texteTertiaire} /> : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vignette: { width: LARGEUR, height: HAUTEUR, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  sansGeometrie: { alignItems: 'center', gap: 4, paddingHorizontal: 6 },
  textes: { flex: 1, gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 2 },
});
