import {
  Apple,
  Bean,
  Carrot,
  Citrus,
  Flower2,
  MapPin,
  Sprout,
  TreePalm,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';
import { StyleSheet, View } from 'react-native';

import { Text } from '../primitives';
import { useTheme } from '../theme';
import type { Ton } from '../tokens';
import { Badge } from './Badge';
import { Card } from './Card';
import { CropStatusBadge, type CropStatus } from './CropStatusBadge';
import type { FieldMapCardBadge } from './FieldMapCard';
import { categorieCulture, type CategorieCulture } from './categorieCulture';
import { ProgressBar } from './ProgressBar';

const ICONES: Record<CategorieCulture, LucideIcon> = {
  cereale: Wheat,
  legumineuse: Bean,
  tubercule: Carrot,
  agrume: Citrus,
  aromate: Flower2,
  palmier: TreePalm,
  fruit: Apple,
  autre: Sprout,
};

export interface CropCardProps {
  nom: string;
  variete?: string | null;
  type?: string | null;
  parcelle?: string | null;
  statut: CropStatus;
  /** Avancement du cycle (0 → 1) entre plantation et récolte prévue. */
  progression?: number | null;
  /** Ex. « J-12 avant récolte », « Récolte en retard de 3 jours ». */
  libelleEcheance?: string | null;
  tonEcheance?: Ton;
  /** Pastilles complémentaires (alerte, synchronisation), après le statut. */
  badges?: readonly FieldMapCardBadge[];
  onPress?: () => void;
  accessibilityHint?: string;
  testID?: string;
}

export function CropCard({
  nom,
  variete,
  type,
  parcelle,
  statut,
  progression,
  libelleEcheance,
  tonEcheance = 'primaire',
  badges = [],
  onPress,
  accessibilityHint,
  testID,
}: CropCardProps) {
  const theme = useTheme();
  const Icone = ICONES[categorieCulture(nom, type)];
  const titre = variete ? `${nom} · ${variete}` : nom;
  const resume = [titre, parcelle, libelleEcheance, ...badges.map((badge) => badge.label)].filter(Boolean).join(', ');

  return (
    <Card
      onPress={onPress}
      accessibilityLabel={resume}
      accessibilityHint={accessibilityHint}
      testID={testID}
      style={styles.carte}
    >
      <View style={styles.entete}>
        <View
          style={[
            styles.vignette,
            { backgroundColor: theme.couleurs.primaireConteneur, borderRadius: theme.rayon.md },
          ]}
        >
          <Icone size={26} color={theme.couleurs.surPrimaireConteneur} strokeWidth={2} />
        </View>

        <View style={styles.textes}>
          <Text variant="bodyStrong" numberOfLines={1}>
            {titre}
          </Text>
          {parcelle ? (
            <View style={styles.ligne}>
              <MapPin size={13} color={theme.couleurs.texteSecondaire} />
              <Text variant="bodySmall" color="texteSecondaire" numberOfLines={1} style={styles.flex}>
                {parcelle}
              </Text>
            </View>
          ) : null}
          <View style={styles.badges}>
            <CropStatusBadge status={statut} size="sm" />
            {badges.map((badge) => (
              <Badge key={badge.label} label={badge.label} tone={badge.tone} icon={badge.icon} size="sm" />
            ))}
          </View>
        </View>
      </View>

      {typeof progression === 'number' ? (
        <View style={styles.progression}>
          <ProgressBar value={progression} tone={tonEcheance} />
          <View style={styles.ligneEcheance}>
            <Text variant="caption" color="texteSecondaire" tabular>
              {Math.round(progression * 100)} %
            </Text>
            {libelleEcheance ? (
              <Text variant="caption" color="texte" numberOfLines={1}>
                {libelleEcheance}
              </Text>
            ) : null}
          </View>
        </View>
      ) : libelleEcheance ? (
        <Text variant="caption" color="texteSecondaire">
          {libelleEcheance}
        </Text>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  carte: { gap: 14 },
  entete: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  vignette: { width: 56, height: 56, alignItems: 'center', justifyContent: 'center' },
  textes: { flex: 1, gap: 4 },
  ligne: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  flex: { flex: 1 },
  progression: { gap: 6 },
  ligneEcheance: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
});
