import {
  Bug,
  CalendarClock,
  CircleCheck,
  CircleSlash,
  Droplets,
  Leaf,
  Sprout,
  Wheat,
  type LucideIcon,
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import type { Ton } from '../tokens';
import { Badge } from './Badge';

/**
 * États visuels d'une culture. `water_stress` et `disease` ne s'affichent que
 * si l'information existe (étiquette d'observation, décision D15) : aucun
 * état n'est inventé.
 */
export type CropStatus =
  | 'healthy'
  | 'growing'
  | 'water_stress'
  | 'disease'
  | 'ready'
  | 'planned'
  | 'harvested'
  | 'abandoned';

export const CONFIG_STATUT_CULTURE: Record<CropStatus, { tone: Ton; icon: LucideIcon; cle: string }> = {
  healthy: { tone: 'succes', icon: Leaf, cle: 'cultures.statutsVisuels.saine' },
  growing: { tone: 'primaire', icon: Sprout, cle: 'cultures.statutsVisuels.enCroissance' },
  water_stress: { tone: 'alerte', icon: Droplets, cle: 'cultures.statutsVisuels.stressHydrique' },
  disease: { tone: 'erreur', icon: Bug, cle: 'cultures.statutsVisuels.maladie' },
  ready: { tone: 'info', icon: Wheat, cle: 'cultures.statutsVisuels.pretRecolte' },
  planned: { tone: 'neutre', icon: CalendarClock, cle: 'cultures.statutsVisuels.planifiee' },
  harvested: { tone: 'succes', icon: CircleCheck, cle: 'cultures.statutsVisuels.recoltee' },
  abandoned: { tone: 'neutre', icon: CircleSlash, cle: 'cultures.statutsVisuels.abandonnee' },
};

export interface CropStatusBadgeProps {
  status: CropStatus;
  size?: 'sm' | 'md';
  /** Remplace le libellé traduit par défaut. */
  label?: string;
}

export function CropStatusBadge({ status, size = 'md', label }: CropStatusBadgeProps) {
  const { t } = useTranslation();
  const config = CONFIG_STATUT_CULTURE[status];
  return (
    <Badge
      label={label ?? t(config.cle)}
      tone={config.tone}
      icon={config.icon}
      size={size}
      testID={`statut-culture-${status}`}
    />
  );
}
