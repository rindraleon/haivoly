import { ParcelleMap } from '@/components/ParcelleComponent/ParcelleMap';

import type { CarteParcelleProps } from './carteParcelle.types';

/**
 * Carte de la parcelle sur mobile : composant Leaflet V1 conservé tel quel
 * (standard/satellite, recentrage, ville la plus proche hors réseau — F-62).
 * Jamais la position de l'utilisateur ici : la carte pointe sur la parcelle.
 */
export function CarteParcelle({ points, centre, hauteur }: CarteParcelleProps) {
  return <ParcelleMap points={points} center={centre} showUserLocation={false} style={{ height: hauteur }} />;
}
