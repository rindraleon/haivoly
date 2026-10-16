import type { PointGPS } from '@/types';

export interface CarteParcelleProps {
  points: PointGPS[];
  centre: { latitude: number; longitude: number } | null;
  hauteur: number;
  /** Mention affichée par l'aperçu web (la carte interactive est native). */
  libelleApercu: string;
  /** Libellé de repli quand la parcelle n'a pas de contour. */
  libelleSansContour: string;
}
